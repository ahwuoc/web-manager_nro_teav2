
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    try {
        const where = search ? {
            OR: [
                { player_1: { contains: search } },
                { player_2: { contains: search } },
                { item_player_1: { contains: search } },
                { item_player_2: { contains: search } }
            ]
        } : {};

        const [total, data] = await Promise.all([
            prisma.history_transaction.count({ where }),
            prisma.history_transaction.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { time_tran: 'desc' }
            })
        ]);

        return NextResponse.json({
            data,
            total,
            page,
            pageSize
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await prisma.history_transaction.deleteMany({});
        return NextResponse.json({ message: 'Deleted all history' });
    } catch (error) {
        console.error('Error deleting all history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
