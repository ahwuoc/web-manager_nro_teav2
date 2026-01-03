import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách skill_template
export async function GET(request: NextRequest) {
    try {
        const skills = await prisma.skill_template.findMany({
            select: {
                nclass_id: true,
                id: true,
                NAME: true,
            },
            orderBy: [
                { nclass_id: 'asc' },
                { id: 'asc' }
            ]
        });

        // Tạo map lookup theo id
        const skillMap: { [key: number]: { id: number; NAME: string; nclass_id: number } } = {};
        skills.forEach(s => {
            skillMap[s.id] = s;
        });

        return NextResponse.json({
            success: true,
            data: skills,
            map: skillMap
        });
    } catch (error) {
        console.error('Error fetching skill_template:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể lấy danh sách skill' },
            { status: 500 }
        );
    }
}
