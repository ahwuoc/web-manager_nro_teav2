import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, requiredBigInt, requiredInt } from '@/lib/fishing-event';

const serialize = (row: {
    item_id: number; catch_weight: number; min_weight_grams: number; max_weight_grams: number;
    base_points: bigint; points_per_kg: number; enabled: boolean; sort_order: number;
}, item?: { NAME: string; icon_id: number }) => ({
    ...row,
    base_points: row.base_points.toString(),
    item_name: item?.NAME ?? `Item #${row.item_id}`,
    icon_id: item?.icon_id ?? -1,
});

export async function GET() {
    try {
        const rows = await prisma.fishing_fish_config.findMany({ orderBy: [{ sort_order: 'asc' }, { item_id: 'asc' }] });
        const templates = await prisma.item_template.findMany({
            where: { id: { in: rows.map((row) => row.item_id) } },
            select: { id: true, NAME: true, icon_id: true },
        });
        const itemMap = new Map(templates.map((item) => [item.id, item]));
        return NextResponse.json({ success: true, data: rows.map((row) => serialize(row, itemMap.get(row.item_id))) });
    } catch (error) {
        console.error('Error fetching fishing fish config:', error);
        return NextResponse.json({ success: false, error: 'Không thể tải cấu hình cá' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const minWeight = requiredInt(body.min_weight_grams, 'Cân nặng nhỏ nhất', 1);
        const maxWeight = requiredInt(body.max_weight_grams, 'Cân nặng lớn nhất', minWeight);
        const row = await prisma.fishing_fish_config.create({ data: {
            item_id: requiredInt(body.item_id, 'Item cá', 1),
            catch_weight: requiredInt(body.catch_weight, 'Trọng số bắt cá', 1),
            min_weight_grams: minWeight,
            max_weight_grams: maxWeight,
            base_points: requiredBigInt(body.base_points, 'Điểm cơ bản'),
            points_per_kg: requiredInt(body.points_per_kg, 'Điểm mỗi kg', 0),
            enabled: body.enabled ?? true,
            sort_order: requiredInt(body.sort_order ?? 0, 'Thứ tự', 0),
        }});
        return NextResponse.json({ success: true, data: serialize(row) });
    } catch (error) {
        console.error('Error creating fishing fish config:', error);
        const result = errorResponse(error, 'Không thể thêm cấu hình cá');
        return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
}
