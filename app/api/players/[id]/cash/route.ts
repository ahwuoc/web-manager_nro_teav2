import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { amount, action, addToDanap, subtractFromDanap } = await request.json();
        
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
        
        // Cộng tiền và cộng vào danap
        if (action === 'add' && addToDanap) {
            updateData.danap = Number(account.danap) + amount;
        }
        
        // Trừ tiền và trừ từ danap
        if (action === 'subtract' && subtractFromDanap) {
            const newDanap = Number(account.danap) - amount;
            updateData.danap = newDanap > 0 ? newDanap : 0;
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
