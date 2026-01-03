import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách tất cả item_template
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const ids = searchParams.get('ids');

        let whereClause = {};
        if (ids) {
            // Parse comma-separated IDs
            const idArray = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
            whereClause = { id: { in: idArray } };
        }

        const itemTemplates = await prisma.item_template.findMany({
            where: whereClause,
            select: {
                id: true,
                NAME: true,
                TYPE: true,
                gender: true,
                description: true,
                level: true,
                icon_id: true,
                part: true,
                gold: true,
                gem: true,
                head: true,
                body: true,
                leg: true
            },
            orderBy: {
                id: 'asc'
            }
        });

        // Create a map for easy lookup
        const itemMap: { [key: number]: any } = {};
        itemTemplates.forEach(item => {
            itemMap[item.id] = item;
        });

        return NextResponse.json({
            success: true,
            data: itemTemplates,
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
