import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Lấy danh sách tất cả settings
export async function GET(request: NextRequest) {
    try {
        const settings = await prisma.settings.findMany({
            orderBy: {
                key_name: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            data: settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể lấy danh sách cấu hình' },
            { status: 500 }
        );
    }
}

// POST - Tạo setting mới
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { key_name, value, description } = body;

        if (!key_name) {
            return NextResponse.json(
                { success: false, error: 'Thiếu key_name' },
                { status: 400 }
            );
        }

        // Kiểm tra xem key_name đã tồn tại chưa
        const existing = await prisma.settings.findUnique({
            where: { key_name }
        });

        if (existing) {
            return NextResponse.json(
                { success: false, error: 'Key đã tồn tại' },
                { status: 400 }
            );
        }

        const newSetting = await prisma.settings.create({
            data: {
                key_name,
                value: value || '',
                description: description || '',
                updated_at: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            data: newSetting
        });
    } catch (error) {
        console.error('Error creating setting:', error);
        return NextResponse.json(
            { success: false, error: 'Không thể tạo cấu hình' },
            { status: 500 }
        );
    }
}
