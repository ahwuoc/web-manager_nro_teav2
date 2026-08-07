import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, requiredBigInt, requiredInt, validateRewardItems } from '@/lib/fishing-event';

const serialize = (row: {
    id: number; season_id: string; name: string; description: string | null; required_points: bigint;
    reward_items: string; reward_gold: bigint; reward_gem: number; reward_ruby: number;
    enabled: boolean; sort_order: number;
}) => ({ ...row, required_points: row.required_points.toString(), reward_gold: row.reward_gold.toString() });

export async function GET(request: NextRequest) {
    try {
        const season = new URL(request.url).searchParams.get('season')?.trim() || '2026-08';
        const rows = await prisma.fishing_milestone.findMany({
            where: { season_id: season }, orderBy: [{ sort_order: 'asc' }, { required_points: 'asc' }, { id: 'asc' }],
        });
        return NextResponse.json({ success: true, data: rows.map(serialize) });
    } catch (error) {
        console.error('Error fetching fishing milestones:', error);
        return NextResponse.json({ success: false, error: 'Không thể tải mốc câu cá' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const season = String(body.season_id ?? '').trim();
        const name = String(body.name ?? '').trim();
        if (!season || season.length > 32 || !name || name.length > 100) throw new Error('Mùa và tên mốc không hợp lệ');
        const row = await prisma.fishing_milestone.create({ data: {
            season_id: season,
            name,
            description: String(body.description ?? '').trim() || null,
            required_points: requiredBigInt(body.required_points, 'Điểm yêu cầu'),
            reward_items: validateRewardItems(body.reward_items ?? '[]'),
            reward_gold: requiredBigInt(body.reward_gold ?? 0, 'Vàng thưởng'),
            reward_gem: requiredInt(body.reward_gem ?? 0, 'Ngọc thưởng', 0),
            reward_ruby: requiredInt(body.reward_ruby ?? 0, 'Hồng ngọc thưởng', 0),
            enabled: body.enabled ?? true,
            sort_order: requiredInt(body.sort_order ?? 0, 'Thứ tự', 0),
        }});
        return NextResponse.json({ success: true, data: serialize(row) });
    } catch (error) {
        console.error('Error creating fishing milestone:', error);
        const result = errorResponse(error, 'Không thể thêm mốc câu cá');
        return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
}
