import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy thông tin chi tiết một giftcode
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const giftcode = await prisma.giftcode.findUnique({
      where: { id: parseInt(id) }
    });

    if (!giftcode) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy giftcode' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: giftcode
    });
  } catch (error) {
    console.error('Error fetching giftcode:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy thông tin giftcode' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật giftcode
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { code, count_left, detail, expired, type } = body;

    const updateData: any = {};
    if (code !== undefined) updateData.code = code;
    if (count_left !== undefined) updateData.count_left = parseInt(count_left);
    if (detail !== undefined) updateData.detail = detail;
    if (expired !== undefined) updateData.expired = new Date(expired);
    if (type !== undefined) updateData.type = parseInt(type);

    const updatedGiftcode = await prisma.giftcode.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updatedGiftcode
    });
  } catch (error) {
    console.error('Error updating giftcode:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật giftcode' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa giftcode
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Kiểm tra xem giftcode có tồn tại không
    const existingGiftcode = await prisma.giftcode.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingGiftcode) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy giftcode' },
        { status: 404 }
      );
    }

    await prisma.giftcode.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa giftcode thành công'
    });
  } catch (error) {
    console.error('Error deleting giftcode:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể xóa giftcode' },
      { status: 500 }
    );
  }
}
