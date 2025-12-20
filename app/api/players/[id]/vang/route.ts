import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { amount, action } = await request.json();
        
        const account = await prisma.account.findUnique({
            where: { id: parseInt(id) },
            select: { vang: true }
        });

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        const currentVang = BigInt(account.vang);
        const amountBigInt = BigInt(amount);
        const newVang = action === 'add' 
            ? currentVang + amountBigInt 
            : currentVang > amountBigInt ? currentVang - amountBigInt : BigInt(0);

        await prisma.account.update({
            where: { id: parseInt(id) },
            data: { vang: newVang }
        });

        return NextResponse.json({ success: true, newVang: newVang.toString() });
    } catch (error) {
        console.error('Error updating vang:', error);
        return NextResponse.json({ error: 'Failed to update vang' }, { status: 500 });
    }
}
