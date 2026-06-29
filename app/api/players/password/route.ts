import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { accountIds, password } = await request.json();

        if (!Array.isArray(accountIds) || accountIds.length === 0) {
            return NextResponse.json({ error: 'Vui lòng chọn tài khoản' }, { status: 400 });
        }

        if (typeof password !== 'string' || !password.trim()) {
            return NextResponse.json({ error: 'Vui lòng nhập mật khẩu mới' }, { status: 400 });
        }

        const normalizedIds = Array.from(
            new Set(
                accountIds
                    .map((id) => Number(id))
                    .filter((id) => Number.isInteger(id) && id > 0)
            )
        );

        if (normalizedIds.length === 0) {
            return NextResponse.json({ error: 'Danh sách tài khoản không hợp lệ' }, { status: 400 });
        }

        const newPassword = password.trim();

        if (newPassword.length > 100) {
            return NextResponse.json({ error: 'Mật khẩu tối đa 100 ký tự' }, { status: 400 });
        }

        const result = await prisma.account.updateMany({
            where: { id: { in: normalizedIds } },
            data: { password: newPassword }
        });

        return NextResponse.json({ success: true, updated: result.count });
    } catch (error) {
        console.error('Error updating account password:', error);
        return NextResponse.json({ error: 'Failed to update account password' }, { status: 500 });
    }
}
