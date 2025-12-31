import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách tất cả boss_data
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bossName = searchParams.get('boss_name');
        
        const where: any = {};
        if (bossName) {
            where.boss_name = bossName;
        }

        const bosses = await prisma.boss_data.findMany({
            where,
            orderBy: [
                { id: 'asc' },
                { level_index: 'asc' }
            ]
        });

        // Convert BigInt to string
        const serializedBosses = bosses.map(boss => ({
            ...boss,
            dame: boss.dame.toString()
        }));

        // Group by id for multi-level bosses
        const grouped = serializedBosses.reduce((acc: any, boss) => {
            if (!acc[boss.id]) {
                acc[boss.id] = {
                    id: boss.id,
                    boss_name: boss.boss_name,
                    display_name: boss.display_name,
                    levels: []
                };
            }
            acc[boss.id].levels.push(boss);
            return acc;
        }, {});

        return NextResponse.json({
            success: true,
            data: serializedBosses,
            grouped: Object.values(grouped)
        });
    } catch (error) {
        console.error('Error fetching boss_data:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể lấy danh sách boss' },
            { status: 500 }
        );
    }
}

// POST - Tạo boss_data mới
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            id, level_index, boss_name, display_name, level_name,
            gender, dame, hp, outfit, map_join,
            appear_type, seconds_rest, skills,
            text_start, text_mid, text_end,
            rewards, bosses_appear_together,
            is_notify_disabled, is_zone01_spawn_disabled,
            special_class, auto_spawn
        } = body;

        if (id === undefined || !boss_name || !display_name || !level_name) {
            return NextResponse.json(
                { success: false, error: 'Thiếu thông tin bắt buộc (id, boss_name, display_name, level_name)' },
                { status: 400 }
            );
        }

        const newBoss = await prisma.boss_data.create({
            data: {
                id: parseInt(id),
                level_index: level_index ?? 0,
                boss_name,
                display_name,
                level_name,
                gender: gender ?? 0,
                dame: dame ? BigInt(dame) : BigInt(0),
                hp: hp || '[0]',
                outfit: outfit || '[-1,-1,-1,-1,-1,-1]',
                map_join: map_join || '[]',
                appear_type: appear_type || 'DEFAULT_APPEAR',
                seconds_rest: seconds_rest ?? 0,
                skills: skills || '[]',
                text_start: text_start || '[]',
                text_mid: text_mid || '[]',
                text_end: text_end || '[]',
                rewards: rewards || '[]',
                bosses_appear_together: bosses_appear_together || null,
                is_notify_disabled: is_notify_disabled ?? false,
                is_zone01_spawn_disabled: is_zone01_spawn_disabled ?? true,
                special_class: special_class || null,
                auto_spawn: auto_spawn ?? true
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                ...newBoss,
                dame: newBoss.dame.toString()
            }
        });
    } catch (error: any) {
        console.error('Error creating boss_data:', error);
        if (error.code === 'P2002') {
            return NextResponse.json(
                { success: false, error: 'Boss với ID và level_index này đã tồn tại' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Không thể tạo boss' },
            { status: 500 }
        );
    }
}
