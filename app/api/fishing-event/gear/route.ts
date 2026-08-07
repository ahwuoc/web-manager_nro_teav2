import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, fishingBaitData, fishingRecipeData, fishingRodData } from '@/lib/fishing-event';

async function itemNames(ids: number[]) {
    const items = await prisma.item_template.findMany({
        where: { id: { in: [...new Set(ids)] } }, select: { id: true, NAME: true },
    });
    return new Map(items.map((item) => [item.id, item.NAME]));
}

export async function GET() {
    try {
        const [rods, baits, recipes] = await Promise.all([
            prisma.fishing_rod_config.findMany({ orderBy: [{ sort_order: 'asc' }, { rod_item_id: 'asc' }] }),
            prisma.fishing_bait_config.findMany({ orderBy: [{ priority: 'desc' }, { bait_item_id: 'asc' }] }),
            prisma.fishing_craft_recipe.findMany({ orderBy: [{ sort_order: 'asc' }, { id: 'asc' }] }),
        ]);
        const names = await itemNames([
            ...rods.map((row) => row.rod_item_id), ...baits.map((row) => row.bait_item_id),
            ...recipes.map((row) => row.result_item_id),
        ]);
        return NextResponse.json({ success: true,
            rods: rods.map((row) => ({ ...row, item_name: names.get(row.rod_item_id) ?? `Item #${row.rod_item_id}` })),
            baits: baits.map((row) => ({ ...row, item_name: names.get(row.bait_item_id) ?? `Item #${row.bait_item_id}` })),
            recipes: recipes.map((row) => ({ ...row, result_name: names.get(row.result_item_id) ?? `Item #${row.result_item_id}` })),
        });
    } catch (error) {
        console.error('Error fetching fishing gear:', error);
        return NextResponse.json({ success: false, error: 'Không thể tải cấu hình cần, mồi và chế tạo' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (body.kind === 'rod') {
            await prisma.fishing_rod_config.create({ data: fishingRodData(body) });
        } else if (body.kind === 'bait') {
            await prisma.fishing_bait_config.create({ data: fishingBaitData(body) });
        } else if (body.kind === 'recipe') {
            await prisma.fishing_craft_recipe.create({ data: fishingRecipeData(body) });
        } else throw new Error('Loại cấu hình không hợp lệ');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating fishing gear:', error);
        const result = errorResponse(error, 'Không thể thêm cấu hình');
        return NextResponse.json({ success: false, error: result.error }, { status: result.status });
    }
}
