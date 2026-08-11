import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { basisPoints, errorResponse, requiredBigInt, requiredInt } from '@/lib/fishing-event';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
    try {
        const itemId = requiredInt((await params).itemId, 'Item cá', 1);
        const body = await request.json();
        const minWeight = requiredInt(body.min_weight_grams, 'Cân nặng nhỏ nhất', 1);
        const maxWeight = requiredInt(body.max_weight_grams, 'Cân nặng lớn nhất', minWeight);
        const row = await prisma.fishing_fish_config.update({ where: { item_id: itemId }, data: {
            catch_weight: requiredInt(body.catch_weight, 'Trọng số bắt cá', 1),
            min_weight_grams: minWeight,
            max_weight_grams: maxWeight,
            base_points: requiredBigInt(body.base_points, 'Điểm cơ bản'),
            points_per_kg: requiredInt(body.points_per_kg, 'Điểm mỗi kg', 0),
            escape_rate_bps: basisPoints(body.escape_rate_bps ?? 0, 'Tỷ lệ cá vùng thoát'),
            enabled: body.enabled ?? true,
            sort_order: requiredInt(body.sort_order ?? 0, 'Thứ tự', 0),
        }});
        return NextResponse.json({ success: true, data: { ...row, base_points: row.base_points.toString() } });
    } catch (error) {
        console.error('Error updating fishing fish config:', error);
        const result = errorResponse(error, 'Không thể cập nhật cấu hình cá');
        return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
    try {
        const itemId = requiredInt((await params).itemId, 'Item cá', 1);
        await prisma.fishing_fish_config.delete({ where: { item_id: itemId } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting fishing fish config:', error);
        return NextResponse.json({ success: false, error: 'Không thể xóa cấu hình cá' }, { status: 500 });
    }
}
