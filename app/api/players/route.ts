import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search') || '';

        let whereClause = {};

        if (search) {
            const players = await prisma.player.findMany({
                where: { name: { contains: search } },
                select: { account_id: true }
            });
            const accountIdsWithPlayerName = players.map(p => p.account_id).filter(id => id !== null) as number[];

            whereClause = {
                OR: [
                    { username: { contains: search } },
                    { email: { contains: search } },
                    { id: { in: accountIdsWithPlayerName } }
                ]
            };
        }

        const accounts = await prisma.account.findMany({
            where: whereClause,
            select: {
                id: true,
                username: true,
                password: true,
                email: true,
                vang: true,
                cash: true,
                danap: true,
                ban: true,
                active: true,
                is_admin: true,
                create_time: true,
                last_time_login: true,
            },
            take: 50,
            orderBy: { id: 'desc' }
        });

        const accountIds = accounts.map(a => a.id);
        const playersForAccounts = await prisma.player.findMany({
            where: { account_id: { in: accountIds } },
            select: { account_id: true, name: true }
        });
        
        const playerMap: Record<number, any> = {};
        for (const p of playersForAccounts) {
            if (p.account_id) {
                playerMap[p.account_id] = { name: p.name };
            }
        }

        return NextResponse.json(accounts.map(acc => ({
            ...acc,
            vang: acc.vang.toString(),
            player: playerMap[acc.id] || null
        })));
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }
}
