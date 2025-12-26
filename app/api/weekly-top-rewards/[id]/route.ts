import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Cập nhật phần thưởng
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { top_type_id, rank_from, rank_to, details, description } = await request.json();

        const updatedReward = await prisma.weekly_top_rewards.update({
            where: { id: parseInt(id) },
            data: {
                top_type_id: parseInt(top_type_id),
                rank_from: parseInt(rank_from),
                rank_to: parseInt(rank_to),
                details,
                description
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedReward
        });
    } catch (error) {
        console.error('Error updating weekly top reward:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể cập nhật phần thưởng' },
            { status: 500 }
        );
    }
}

// DELETE - Xóa phần thưởng
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.weekly_top_rewards.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({
            success: true,
            message: 'Đã xóa phần thưởng'
        });
    } catch (error) {
        console.error('Error deleting weekly top reward:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể xóa phần thưởng' },
            { status: 500 }
        );
    }
}