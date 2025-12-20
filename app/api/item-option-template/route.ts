import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách tất cả item_option_template
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

        const itemOptionTemplates = await prisma.item_option_template.findMany({
            where: whereClause,
            select: {
                id: true,
                NAME: true,
                type: true
            },
            orderBy: {
                id: 'asc'
            }
        });

        // Create a map for easy lookup
        const optionMap: { [key: number]: any } = {};
        itemOptionTemplates.forEach(option => {
            optionMap[option.id] = option;
        });

        return NextResponse.json({
            success: true,
            data: itemOptionTemplates,
            map: optionMap
        });
    } catch (error) {
        console.error('Error fetching item option templates:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể lấy danh sách item option template' },
            { status: 500 }
        );
    }
}
