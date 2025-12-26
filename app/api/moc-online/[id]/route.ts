import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { info, required_online, detail } = body;

        const updateData: any = {};
        if (info !== undefined) updateData.info = info;
        if (required_online !== undefined) updateData.required_online = required_online;
        if (detail !== undefined) updateData.detail = detail;

        const updated = await prisma.moc_online.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error('Error updating moc_online:', error);
        return NextResponse.json({ success: false, error: 'Không thể cập nhật' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.moc_online.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting moc_online:', error);
        return NextResponse.json({ success: false, error: 'Không thể xóa' }, { status: 500 });
    }
}
