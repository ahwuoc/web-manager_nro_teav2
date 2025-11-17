import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách tất cả tab_shop
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const shopId = searchParams.get('shop_id');

        const whereClause = shopId ? { shop_id: parseInt(shopId) } : {};

        const tabShops = await prisma.tab_shop.findMany({
            where: whereClause,
            include: {
                shop: {
                    include: {
                        npc_template: true
                    }
                }
            },
            orderBy: {
                tab_index: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            data: tabShops
        });
    } catch (error) {
        console.error('Error fetching tab shops:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể lấy danh sách tab shop' },
            { status: 500 }
        );
    }
}

// POST - Tạo tab_shop mới
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { shop_id, tab_name, tab_index, items } = body;

        if (!shop_id || !tab_name || tab_index === undefined || !items) {
            return NextResponse.json(
                { success: false, error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            );
        }

        const newTabShop = await prisma.tab_shop.create({
            data: {
                shop_id: parseInt(shop_id),
                tab_name,
                tab_index: parseInt(tab_index),
                items
            },
            include: {
                shop: {
                    include: {
                        npc_template: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: newTabShop
        });
    } catch (error) {
        console.error('Error creating tab shop:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể tạo tab shop' },
            { status: 500 }
        );
    }
}
