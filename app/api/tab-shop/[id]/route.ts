import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy thông tin chi tiết một tab_shop
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tabShop = await prisma.tab_shop.findUnique({
      where: { id: parseInt(id) },
      include: {
        shop: {
          include: {
            npc_template: true
          }
        }
      }
    });

    if (!tabShop) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy tab shop' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tabShop
    });
  } catch (error) {
    console.error('Error fetching tab shop:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể lấy thông tin tab shop' },
      { status: 500 }
    );
  }
}

// PUT - Cập nhật tab_shop
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { shop_id, tab_name, tab_index, items } = body;

    const updateData: any = {};
    if (shop_id !== undefined) updateData.shop_id = parseInt(shop_id);
    if (tab_name !== undefined) updateData.tab_name = tab_name;
    if (tab_index !== undefined) updateData.tab_index = parseInt(tab_index);
    if (items !== undefined) updateData.items = items;

    const updatedTabShop = await prisma.tab_shop.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        shop: {
          include: {
            npc_template: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedTabShop
    });
  } catch (error) {
    console.error('Error updating tab shop:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể cập nhật tab shop' },
      { status: 500 }
    );
  }
}

// DELETE - Xóa tab_shop
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.tab_shop.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa tab shop thành công'
    });
  } catch (error) {
    console.error('Error deleting tab shop:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể xóa tab shop' },
      { status: 500 }
    );
  }
}
