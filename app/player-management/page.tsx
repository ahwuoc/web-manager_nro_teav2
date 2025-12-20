'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Space, Tag, Tooltip, Checkbox } from 'antd';
import { SearchOutlined, LockOutlined, UnlockOutlined, DollarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Account {
    id: number;
    username: string;
    email: string | null;
    cash: number;
    danap: number;
    ban: boolean;
    active: boolean;
    is_admin: boolean;
    create_time: string;
    last_time_login: string;
    player: {
        name: string;
    } | null;
}

export default function PlayerManagementPage() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [cashAmount, setCashAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [actionType, setActionType] = useState<'add' | 'subtract'>('add');
    const [addToDanap, setAddToDanap] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, [search]);

    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/players?search=${search}`);
            const data = await response.json();
            setAccounts(data);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBanToggle = async (accountId: number, currentBan: boolean) => {
        setProcessing(true);
        try {
            const response = await fetch(`/api/players/${accountId}/ban`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ban: !currentBan }),
            });
            if (response.ok) {
                fetchAccounts();
            }
        } catch (error) {
            console.error('Error toggling ban:', error);
        } finally {
            setProcessing(false);
        }
    };

    const handleUpdateCash = async () => {
        if (!cashAmount || !selectedAccount) return;
        setProcessing(true);
        try {
            const response = await fetch(`/api/players/${selectedAccount.id}/cash`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseInt(cashAmount),
                    action: actionType,
                    addToDanap: addToDanap && actionType === 'add'
                }),
            });
            if (response.ok) {
                setCashAmount('');
                setShowModal(false);
                setAddToDanap(false);
                fetchAccounts();
            }
        } catch (error) {
            console.error('Error updating cash:', error);
        } finally {
            setProcessing(false);
        }
    };

    const columns: ColumnsType<Account> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            render: (text, record) => (
                <Space>
                    <span className="font-semibold">{text}</span>
                    {record.is_admin && <Tag color="purple">Admin</Tag>}
                </Space>
            ),
        },
        {
            title: 'Nhân vật',
            dataIndex: ['player', 'name'],
            key: 'player',
            render: (text) => text ? text : <Tag color="orange">Chưa tạo</Tag>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text) => text || '-',
        },
        {
            title: 'Cash',
            dataIndex: 'cash',
            key: 'cash',
            align: 'right' as const,
            render: (cash) => <span className="font-semibold">{cash.toLocaleString()}</span>,
            sorter: (a, b) => a.cash - b.cash,
        },
        {
            title: 'Tổng nạp',
            dataIndex: 'danap',
            key: 'danap',
            align: 'right' as const,
            render: (danap) => danap.toLocaleString(),
            sorter: (a, b) => a.danap - b.danap,
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => (
                <Space>
                    {!record.active && <Tag color="warning">Chưa kích hoạt</Tag>}
                    {record.ban && <Tag color="red">Đã khóa</Tag>}
                    {record.active && !record.ban && <Tag color="green">Hoạt động</Tag>}
                </Space>
            ),
        },
        {
            title: 'Đăng nhập cuối',
            dataIndex: 'last_time_login',
            key: 'last_time_login',
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center' as const,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Cộng/Trừ tiền">
                        <Button
                            type="primary"
                            size="small"
                            icon={<DollarOutlined />}
                            onClick={() => {
                                setSelectedAccount(record);
                                setShowModal(true);
                                setCashAmount('');
                                setActionType('add');
                            }}
                            loading={processing}
                        >
                            Tiền
                        </Button>
                    </Tooltip>
                    <Tooltip title={record.ban ? 'Mở khóa' : 'Khóa'}>
                        <Button
                            danger={!record.ban}
                            size="small"
                            icon={record.ban ? <UnlockOutlined /> : <LockOutlined />}
                            onClick={() => handleBanToggle(record.id, record.ban)}
                            loading={processing}
                        >
                            {record.ban ? 'Mở' : 'Khóa'}
                        </Button>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Quản lý Tài khoản</h1>
                <p className="text-gray-600">
                    Quản lý tài khoản người chơi, ban/unban, cộng/trừ tiền
                </p>
            </div>

            <div className="mb-4">
                <Input
                    placeholder="Tìm kiếm theo username, email hoặc tên nhân vật..."
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: '400px' }}
                />
            </div>

            <Table
                columns={columns}
                dataSource={accounts}
                loading={loading}
                rowKey="id"
                pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} tài khoản`,
                }}
                scroll={{ x: 1200 }}
            />

            <Modal
                title={`Cộng/Trừ tiền - ${selectedAccount?.username}`}
                open={showModal}
                onOk={handleUpdateCash}
                onCancel={() => setShowModal(false)}
                confirmLoading={processing}
                okText="Xác nhận"
                cancelText="Hủy"
            >
                <div className="space-y-4 py-4">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">
                            Cash hiện tại:{' '}
                            <span className="font-bold text-lg">
                                {(selectedAccount?.cash || 0).toLocaleString()}
                            </span>
                        </p>
                        <Input
                            type="number"
                            placeholder="Nhập số tiền"
                            value={cashAmount}
                            onChange={(e) => setCashAmount(e.target.value)}
                            min="0"
                        />
                    </div>
                    {actionType === 'add' && (
                        <Checkbox
                            checked={addToDanap}
                            onChange={(e) => setAddToDanap(e.target.checked)}
                        >
                            Cộng vào tổng nạp (danap)
                        </Checkbox>
                    )}
                    <div className="flex gap-2">
                        <Button
                            type="primary"
                            block
                            onClick={() => {
                                setActionType('add');
                                handleUpdateCash();
                            }}
                            disabled={!cashAmount}
                            loading={processing}
                        >
                            Cộng tiền
                        </Button>
                        <Button
                            block
                            onClick={() => {
                                setActionType('subtract');
                                handleUpdateCash();
                            }}
                            disabled={!cashAmount}
                            loading={processing}
                        >
                            Trừ tiền
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
