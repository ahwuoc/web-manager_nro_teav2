import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy thông tin chi tiết một boss level
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; levelIndex: string }> }
) {
    try {
        const { id, levelIndex } = await params;
        const boss = await prisma.boss_data.findUnique({
            where: {
                id_level_index: {
                    id: parseInt(id),
                    level_index: parseInt(levelIndex)
                }
            }
        });

        if (!boss) {
            return NextResponse.json(
                { success: false, error: 'Không tìm thấy boss' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                ...boss,
                dame: boss.dame.toString()
            }
        });
    } catch (error) {
        console.error('Error fetching boss_data:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể lấy thông tin boss' },
            { status: 500 }
        );
    }
}

// PUT - Cập nhật boss_data
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; levelIndex: string }> }
) {
    try {
        const { id, levelIndex } = await params;
        const body = await request.json();

        const updateData: any = {};
        
        if (body.boss_name !== undefined) updateData.boss_name = body.boss_name;
        if (body.display_name !== undefined) updateData.display_name = body.display_name;
        if (body.level_name !== undefined) updateData.level_name = body.level_name;
        if (body.gender !== undefined) updateData.gender = body.gender;
        if (body.dame !== undefined) updateData.dame = BigInt(body.dame);
        if (body.hp !== undefined) updateData.hp = body.hp;
        if (body.outfit !== undefined) updateData.outfit = body.outfit;
        if (body.map_join !== undefined) updateData.map_join = body.map_join;
        if (body.appear_type !== undefined) updateData.appear_type = body.appear_type;
        if (body.seconds_rest !== undefined) updateData.seconds_rest = body.seconds_rest;
        if (body.skills !== undefined) updateData.skills = body.skills;
        if (body.text_start !== undefined) updateData.text_start = body.text_start;
        if (body.text_mid !== undefined) updateData.text_mid = body.text_mid;
        if (body.text_end !== undefined) updateData.text_end = body.text_end;
        if (body.rewards !== undefined) updateData.rewards = body.rewards;
        if (body.bosses_appear_together !== undefined) updateData.bosses_appear_together = body.bosses_appear_together;
        if (body.is_notify_disabled !== undefined) updateData.is_notify_disabled = body.is_notify_disabled;
        if (body.is_zone01_spawn_disabled !== undefined) updateData.is_zone01_spawn_disabled = body.is_zone01_spawn_disabled;
        if (body.special_class !== undefined) updateData.special_class = body.special_class;
        if (body.auto_spawn !== undefined) updateData.auto_spawn = body.auto_spawn;

        const updatedBoss = await prisma.boss_data.update({
            where: {
                id_level_index: {
                    id: parseInt(id),
                    level_index: parseInt(levelIndex)
                }
            },
            data: updateData
        });

        return NextResponse.json({
            success: true,
            data: {
                ...updatedBoss,
                dame: updatedBoss.dame.toString()
            }
        });
    } catch (error) {
        console.error('Error updating boss_data:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể cập nhật boss' },
            { status: 500 }
        );
    }
}

// DELETE - Xóa boss_data
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; levelIndex: string }> }
) {
    try {
        const { id, levelIndex } = await params;
        await prisma.boss_data.delete({
            where: {
                id_level_index: {
                    id: parseInt(id),
                    level_index: parseInt(levelIndex)
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Xóa boss thành công'
        });
    } catch (error) {
        console.error('Error deleting boss_data:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể xóa boss' },
            { status: 500 }
        );
    }
}
