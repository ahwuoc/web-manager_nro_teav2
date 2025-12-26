import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách phần thưởng
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const topTypeId = searchParams.get('top_type_id');

        const where = topTypeId ? { top_type_id: parseInt(topTypeId) } : {};

        const rewards = await prisma.weekly_top_rewards.findMany({
            where,
            orderBy: { rank_from: 'asc' },
            include: {
                weekly_top_types: true
            }
        });

        return NextResponse.json({
            success: true,
            data: rewards
        });
    } catch (error) {
        console.error('Error fetching weekly top rewards:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể lấy danh sách phần thưởng' },
            { status: 500 }
        );
    }
}

// POST - Tạo phần thưởng mới
export async function POST(request: NextRequest) {
    try {
        const { top_type_id, rank_from, rank_to, details, description } = await request.json();

        if (!top_type_id || rank_from === undefined || rank_to === undefined || !details) {
            return NextResponse.json(
                { success: false, error: 'Thiếu thông tin bắt buộc' },
                { status: 400 }
            );
        }

        const newReward = await prisma.weekly_top_rewards.create({
            data: {
                top_type_id: parseInt(top_type_id),
                rank_from: parseInt(rank_from),
                rank_to: parseInt(rank_to),
                details,
                description
            }
        });

        return NextResponse.json({
            success: true,
            data: newReward
        });
    } catch (error) {
        console.error('Error creating weekly top reward:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể tạo phần thưởng' },
            { status: 500 }
        );
    }
}