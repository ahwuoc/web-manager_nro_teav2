import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const data = await prisma.moc_online.findMany({
            orderBy: { id: 'asc' }
        });
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching moc_online:', error);
        return NextResponse.json({ success: false, error: 'Không thể lấy danh sách' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { info, required_online, detail } = body;

        if (!info || !detail) {
            return NextResponse.json({ success: false, error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
        }

        const newData = await prisma.moc_online.create({
            data: { info, required_online: required_online || 0, detail } as any
        });

        return NextResponse.json({ success: true, data: newData });
    } catch (error) {
        console.error('Error creating moc_online:', error);
        return NextResponse.json({ success: false, error: 'Không thể tạo mới' }, { status: 500 });
    }
}
