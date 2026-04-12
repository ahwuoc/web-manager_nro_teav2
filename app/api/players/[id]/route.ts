import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const account = await prisma.account.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                username: true,
                email: true,
                vang: true,
                cash: true,
                danap: true,
                ban: true,
                active: true,
                is_admin: true,
                create_time: true,
                last_time_login: true,
                last_time_logout: true,
                ip_address: true,
            }
        });

        if (!account) {
            return NextResponse.json({ error: 'Account not found' }, { status: 404 });
        }

        const player = await prisma.player.findUnique({
            where: { account_id: account.id },
            select: {
                name: true,
                gender: true
            }
        });

        return NextResponse.json({
            ...account,
            vang: account.vang.toString(),
            player: player || null
        });
    } catch (error) {
        console.error('Error fetching account:', error);
        return NextResponse.json({ error: 'Failed to fetch account' }, { status: 500 });
    }
}
