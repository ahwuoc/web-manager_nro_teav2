import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Cập nhật setting
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const body = await request.json();
        const { key_name, value, description } = body;

        // Kiểm tra xem ID có tồn tại không
        const existing = await prisma.settings.findUnique({
            where: { id }
        });

        if (!existing) {
            return NextResponse.json(
                { success: false, error: 'Không tìm thấy cấu hình' },
                { status: 404 }
            );
        }

        const updatedSetting = await prisma.settings.update({
            where: { id },
            data: {
                key_name,
                value: value ?? '',
                description: description ?? '',
                updated_at: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedSetting
        });
    } catch (error) {
        console.error('Error updating setting:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể cập nhật cấu hình' },
            { status: 500 }
        );
    }
}

// DELETE - Xóa setting
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);

        await prisma.settings.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'Đã xóa cấu hình thành công'
        });
    } catch (error) {
        console.error('Error deleting setting:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể xóa cấu hình' },
            { status: 500 }
        );
    }
}
