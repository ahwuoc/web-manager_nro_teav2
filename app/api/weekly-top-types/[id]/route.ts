import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy chi tiết loại top
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        
        const type = await prisma.weekly_top_types.findUnique({
            where: { id: parseInt(id) },
            include: {
                weekly_top_rewards: {
                    orderBy: { rank_from: 'asc' }
                }
            }
        });

        if (!type) {
            return NextResponse.json(
                { success: false, error: 'Không tìm thấy loại top' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: type
        });
    } catch (error) {
        console.error('Error fetching weekly top type:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể lấy thông tin loại top' },
            { status: 500 }
        );
    }
}

// PUT - Cập nhật loại top
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { name, order_index, column_name } = await request.json();

        const updatedType = await prisma.weekly_top_types.update({
            where: { id: parseInt(id) },
            data: {
                name,
                order_index: parseInt(order_index),
                column_name
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedType
        });
    } catch (error) {
        console.error('Error updating weekly top type:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể cập nhật loại top' },
            { status: 500 }
        );
    }
}

// DELETE - Xóa loại top
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.weekly_top_types.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({
            success: true,
            message: 'Đã xóa loại top'
        });
    } catch (error) {
        console.error('Error deleting weekly top type:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể xóa loại top' },
            { status: 500 }
        );
    }
}