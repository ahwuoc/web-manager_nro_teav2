import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách loại top
export async function GET() {
    try {
        const types = await prisma.weekly_top_types.findMany({
            orderBy: { order_index: 'asc' },
            include: {
                weekly_top_rewards: {
                    orderBy: { rank_from: 'asc' }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: types
        });
    } catch (error) {
        console.error('Error fetching weekly top types:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể lấy danh sách loại top' },
            { status: 500 }
        );
    }
}

// POST - Tạo loại top mới
export async function POST(request: NextRequest) {
    try {
        const { name, order_index, column_name } = await request.json();

        if (!name || order_index === undefined || !column_name) {
            return NextResponse.json(
                { success: false, error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            );
        }

        const newType = await prisma.weekly_top_types.create({
            data: {
                name,
                order_index: parseInt(order_index),
                column_name
            }
        });

        return NextResponse.json({
            success: true,
            data: newType
        });
    } catch (error) {
        console.error('Error creating weekly top type:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể tạo loại top' },
            { status: 500 }
        );
    }
}