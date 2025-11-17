import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        
        if (isNaN(id)) {
            return NextResponse.json(
                { success: false, error: 'Invalid ID' },
                { status: 400 }
            );
        }

        const itemTemplate = await prisma.item_template.findUnique({
            where: { id }
        });

        if (!itemTemplate) {
            return NextResponse.json(
                { success: false, error: 'Item template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: itemTemplate
        });
    } catch (error) {
        console.error('Error fetching item template:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
