import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, requiredBigInt, requiredInt, validateRewardItems } from '@/lib/fishing-event';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = requiredInt((await params).id, 'ID mốc', 1);
        const body = await request.json();
        const name = String(body.name ?? '').trim();
        if (!name || name.length > 100) throw new Error('Tên mốc không hợp lệ');
        const row = await prisma.fishing_milestone.update({ where: { id }, data: {
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
        return NextResponse.json({ success: true, data: {
            ...row, required_points: row.required_points.toString(), reward_gold: row.reward_gold.toString(),
        }});
    } catch (error) {
        console.error('Error updating fishing milestone:', error);
        const result = errorResponse(error, 'Không thể cập nhật mốc câu cá');
        return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const id = requiredInt((await params).id, 'ID mốc', 1);
        const claimCount = await prisma.fishing_milestone_claim.count({ where: { milestone_id: id } });
        if (claimCount > 0) {
            return NextResponse.json({ success: false, error: `Không thể xóa: đã có ${claimCount} người nhận mốc. Hãy tắt mốc thay vì xóa.` }, { status: 409 });
        }
        await prisma.fishing_milestone.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting fishing milestone:', error);
        return NextResponse.json({ success: false, error: 'Không thể xóa mốc câu cá' }, { status: 500 });
    }
}
