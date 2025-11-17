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

        const optionTemplate = await prisma.item_option_template.findUnique({
            where: { id }
        });

        if (!optionTemplate) {
            return NextResponse.json(
                { success: false, error: 'Option template not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: optionTemplate
        });
    } catch (error) {
        console.error('Error fetching option template:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
