import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to handle BigInt serialization
const serializeItem = (item: any) => ({
    ...item,
    power_require: item.power_require?.toString() || "0"
});

// GET - Lấy danh sách item_template với tìm kiếm
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const ids = searchParams.get('ids');

        let whereClause: any = {};
        
        if (ids) {
            const idArray = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
            whereClause.id = { in: idArray };
        }

        if (search) {
            whereClause.OR = [
                { NAME: { contains: search } },
                { description: { contains: search } },
                { id: isNaN(parseInt(search)) ? undefined : parseInt(search) }
            ].filter(condition => condition.id !== undefined || !condition.id);
        }

        const itemTemplates = await prisma.item_template.findMany({
            where: whereClause,
            orderBy: {
                id: 'asc'
            },
            take: search ? 50 : 200 // Limit for performance if not searching, or keep it manageable
        });

        const serializedItems = itemTemplates.map(serializeItem);

        // Create a map for easy lookup
        const itemMap: { [key: number]: any } = {};
        serializedItems.forEach(item => {
            itemMap[item.id] = item;
        });

        return NextResponse.json({
            success: true,
            data: serializedItems,
            map: itemMap
        });
    } catch (error) {
        console.error('Error fetching item templates:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể lấy danh sách item template' },
            { status: 500 }
        );
    }
}

// POST - Tạo item_template mới
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Convert power_require string back to BigInt if present
        const data = { ...body };
        if (data.power_require) {
            data.power_require = BigInt(data.power_require);
        }

        const newItem = await prisma.item_template.create({
            data
        });

        return NextResponse.json({
            success: true,
            data: serializeItem(newItem)
        });
    } catch (error) {
        console.error('Error creating item template:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể tạo item template. Có thể ID đã tồn tại.' },
            { status: 500 }
        );
    }
}
