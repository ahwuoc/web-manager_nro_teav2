import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to handle BigInt serialization
const serializeItem = (item: any) => ({
    ...item,
    power_require: item.power_require?.toString() || "0"
});

// GET - Lấy chi tiết một item template
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const item = await prisma.item_template.findUnique({
            where: { id }
        });

        if (!item) {
            return NextResponse.json(
                { success: false, error: 'Không tìm thấy item template' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: serializeItem(item)
        });
    } catch (error) {
        console.error('Error fetching item template:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể lấy thông tin item template' },
            { status: 500 }
        );
    }
}

// PUT - Cập nhật item template
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const body = await request.json();
        
        // Convert power_require string back to BigInt if present
        const data = { ...body };
        if (data.power_require !== undefined) {
            data.power_require = BigInt(data.power_require);
        }

        // Remove ID from data to avoid trying to update it if it's in the body
        delete data.id;

        const updatedItem = await prisma.item_template.update({
            where: { id },
            data
        });

        return NextResponse.json({
            success: true,
            data: serializeItem(updatedItem)
        });
    } catch (error) {
        console.error('Error updating item template:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể cập nhật item template' },
            { status: 500 }
        );
    }
}

// DELETE - Xóa item template
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);

        await prisma.item_template.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'Đã xóa item template thành công'
        });
    } catch (error) {
        console.error('Error deleting item template:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể xóa item template' },
            { status: 500 }
        );
    }
}
