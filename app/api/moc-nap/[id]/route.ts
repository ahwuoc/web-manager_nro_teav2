import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy thông tin chi tiết một moc_nap
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mocNap = await prisma.moc_nap.findUnique({
      where: { id: parseInt(id) }
    });

    if (!mocNap) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy mốc nạp' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: mocNap
    });
  } catch (error) {
    console.error('Error fetching moc_nap:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy thông tin mốc nạp' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật moc_nap
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { info, detail } = body;

    const updateData: any = {};
    if (info !== undefined) updateData.info = info;
    if (detail !== undefined) updateData.detail = detail;

    const updatedMocNap = await prisma.moc_nap.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updatedMocNap
    });
  } catch (error) {
    console.error('Error updating moc_nap:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật mốc nạp' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa moc_nap
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.moc_nap.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa mốc nạp thành công'
    });
  } catch (error) {
    console.error('Error deleting moc_nap:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể xóa mốc nạp' },
      { status: 500 }
    );
  }
}
