import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, fishingBaitData, fishingRecipeData, fishingRodData, requiredInt } from '@/lib/fishing-event';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ kind: string; id: string }> }) {
    try {
        const { kind, id: rawId } = await params;
        const id = requiredInt(rawId, 'ID', 1);
        const body = await request.json();
        if (kind === 'rod') {
            const data = fishingRodData({ ...body, rod_item_id: id });
            const { rod_item_id: _rodItemId, ...update } = data;
            void _rodItemId;
            await prisma.fishing_rod_config.update({ where: { rod_item_id: id }, data: update });
        } else if (kind === 'bait') {
            const data = fishingBaitData({ ...body, bait_item_id: id });
            const { bait_item_id: _baitItemId, ...update } = data;
            void _baitItemId;
            await prisma.fishing_bait_config.update({ where: { bait_item_id: id }, data: update });
        } else if (kind === 'recipe') {
            await prisma.fishing_craft_recipe.update({ where: { id }, data: fishingRecipeData(body) });
        } else throw new Error('Loại cấu hình không hợp lệ');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating fishing gear:', error);
        const result = errorResponse(error, 'Không thể cập nhật cấu hình');
        return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ kind: string; id: string }> }) {
    try {
        const { kind, id: rawId } = await params;
        const id = requiredInt(rawId, 'ID', 1);
        if (kind === 'rod') await prisma.fishing_rod_config.delete({ where: { rod_item_id: id } });
        else if (kind === 'bait') await prisma.fishing_bait_config.delete({ where: { bait_item_id: id } });
        else if (kind === 'recipe') await prisma.fishing_craft_recipe.delete({ where: { id } });
        else throw new Error('Loại cấu hình không hợp lệ');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting fishing gear:', error);
        return NextResponse.json({ success: false, error: 'Không thể xóa cấu hình' }, { status: 500 });
    }
}
