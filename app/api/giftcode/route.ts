import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách tất cả giftcode
export async function GET(request: NextRequest) {
    try {
        const giftcodes = await prisma.giftcode.findMany({
            orderBy: {
                id: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            data: giftcodes
        });
    } catch (error) {
        console.error('Error fetching giftcodes:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể lấy danh sách giftcode' },
            { status: 500 }
        );
    }
}

// POST - Tạo giftcode mới
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, count_left, detail, expired, type } = body;

        if (!code || count_left === undefined || !detail || !expired || type === undefined) {
            return NextResponse.json(
                { success: false, error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            );
        }

        const newGiftcode = await prisma.giftcode.create({
            data: {
                code,
                count_left: parseInt(count_left),
                detail,
                expired: new Date(expired),
                type: parseInt(type)
            }
        });

        return NextResponse.json({
            success: true,
            data: newGiftcode
        });
    } catch (error) {
        console.error('Error creating giftcode:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể tạo giftcode' },
            { status: 500 }
        );
    }
}
