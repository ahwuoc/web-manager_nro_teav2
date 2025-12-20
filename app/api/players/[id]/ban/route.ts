import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { ban } = await request.json();

        await prisma.account.update({
            where: { id: parseInt(id) },
            data: { ban }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating ban status:', error);
        return NextResponse.json({ error: 'Failed to update ban status' }, { status: 500 });
    }
}
