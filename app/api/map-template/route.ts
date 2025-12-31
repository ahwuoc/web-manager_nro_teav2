import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách map_template
export async function GET(request: NextRequest) {
    try {
        const maps = await prisma.map_template.findMany({
            select: {
                id: true,
                NAME: true,
            },
            orderBy: { id: 'asc' }
        });

        // Tạo map lookup
        const mapLookup: { [key: number]: { id: number; NAME: string } } = {};
        maps.forEach(m => {
            mapLookup[m.id] = m;
        });

        return NextResponse.json({
            success: true,
            data: maps,
            map: mapLookup
        });
    } catch (error) {
        console.error('Error fetching map_template:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể lấy danh sách map' },
            { status: 500 }
        );
    }
}
