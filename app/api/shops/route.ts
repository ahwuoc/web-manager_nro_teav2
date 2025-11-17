import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách tất cả shops
export async function GET() {
    try {
        const shops = await prisma.shop.findMany({
            include: {
                npc_template: true
            },
            orderBy: {
                id: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            data: shops
        });
    } catch (error) {
        console.error('Error fetching shops:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể lấy danh sách shop' },
            { status: 500 }
        );
    }
}
