import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách tất cả moc_nap
export async function GET(request: NextRequest) {
    try {
        const mocNaps = await prisma.moc_nap.findMany({
            orderBy: {
                id: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            data: mocNaps
        });
    } catch (error) {
        console.error('Error fetching moc_nap:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể lấy danh sách mốc nạp' },
            { status: 500 }
        );
    }
}

// POST - Tạo moc_nap mới
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { info, detail } = body;

        if (!info || !detail) {
            return NextResponse.json(
                { success: false, error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            );
        }

        const newMocNap = await prisma.moc_nap.create({
            data: {
                info,
                detail
            }
        });

        return NextResponse.json({
            success: true,
            data: newMocNap
        });
    } catch (error) {
        console.error('Error creating moc_nap:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể tạo mốc nạp' },
            { status: 500 }
        );
    }
}
