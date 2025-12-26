import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { info, required_amount, detail } = body;

        const updateData: any = {};
        if (info !== undefined) updateData.info = info;
        if (required_amount !== undefined) updateData.required_amount = required_amount;
        if (detail !== undefined) updateData.detail = detail;

        const updated = await prisma.goi_qua.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating goi_qua:', error);
        return NextResponse.json({ success: false, error: 'Không thể cập nhật' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.goi_qua.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting goi_qua:', error);
        return NextResponse.json({ success: false, error: 'Không thể xóa' }, { status: 500 });
    }
}
