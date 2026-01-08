import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search') || '';

        const accounts = await prisma.account.findMany({
            where: search ? {
                OR: [
                    { username: { contains: search } },
                    { email: { contains: search } },
                    { player: { name: { contains: search } } }
                ]
            } : {},
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
                player: {
                    select: {
                        name: true
                    }
                }
            },
            take: 50,
            orderBy: { id: 'desc' }
        });

        return NextResponse.json(accounts.map(acc => ({
            ...acc,
            vang: acc.vang.toString()
        })));
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }
}
