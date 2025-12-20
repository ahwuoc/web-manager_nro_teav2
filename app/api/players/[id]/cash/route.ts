import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { amount, action, addToDanap } = await request.json();
        
        const account = await prisma.account.findUnique({
            where: { id: parseInt(id) },
            select: { cash: true, danap: true }
        });

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        const newCash = action === 'add' 
            ? account.cash + amount 
            : Math.max(0, account.cash - amount);

        const updateData: any = { cash: newCash };
        
        // Nếu cộng tiền và có checkbox cộng vào danap
        if (action === 'add' && addToDanap) {
            updateData.danap = account.danap + amount;
        }

        await prisma.account.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        return NextResponse.json({ success: true, newCash });
    } catch (error) {
        console.error('Error updating cash:', error);
        return NextResponse.json({ error: 'Failed to update cash' }, { status: 500 });
    }
}
