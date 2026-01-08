
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = parseInt((await params).id);
    if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    try {
        await prisma.history_transaction.delete({
            where: { id }
        });
        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
