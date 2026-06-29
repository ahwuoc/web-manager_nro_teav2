'use client';

import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Input, Modal, Space, Tag, Tooltip, Checkbox, message } from 'antd';
import { SearchOutlined, LockOutlined, UnlockOutlined, DollarOutlined, EyeOutlined, EyeInvisibleOutlined, KeyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Key } from 'react';

interface Account {
    id: number;
    username: string;
    password?: string;
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

const PasswordCell = ({ password }: { password?: string }) => {
    const [visible, setVisible] = useState(false);
    if (!password) return <span>-</span>;

    return (
        <Space>
            <span>{visible ? password : '••••••'}</span>
            <Button
                type="text"
                size="small"
                icon={visible ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setVisible(!visible)}
            />
        </Space>
    );
};

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
    const [subtractFromDanap, setSubtractFromDanap] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordTarget, setPasswordTarget] = useState<Account | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/players?search=${search}`);
            const data = await response.json();
            setAccounts(data);
            setSelectedRowKeys((current) => current.filter((key) => data.some((account: Account) => account.id === key)));
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

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

    const handleUpdateCash = async (action?: 'add' | 'subtract') => {
        if (!cashAmount || !selectedAccount) return;
        const finalAction = action || actionType;
        setProcessing(true);
        try {
            const response = await fetch(`/api/players/${selectedAccount.id}/cash`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseInt(cashAmount),
                    action: finalAction,
                    addToDanap: addToDanap && finalAction === 'add',
                    subtractFromDanap: subtractFromDanap && finalAction === 'subtract'
                }),
            });
            if (response.ok) {
                setCashAmount('');
                setShowModal(false);
                setAddToDanap(false);
                setSubtractFromDanap(false);
                fetchAccounts();
            }
        } catch (error) {
            console.error('Error updating cash:', error);
        } finally {
            setProcessing(false);
        }
    };

    const openPasswordModal = (account?: Account) => {
        setPasswordTarget(account || null);
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordModal(true);
    };

    const handleUpdatePassword = async () => {
        const accountIds = passwordTarget ? [passwordTarget.id] : selectedRowKeys.map((key) => Number(key));

        if (accountIds.length === 0) {
            message.warning('Vui lòng chọn tài khoản cần đổi mật khẩu');
            return;
        }

        if (!newPassword.trim()) {
            message.warning('Vui lòng nhập mật khẩu mới');
            return;
        }

        if (newPassword !== confirmPassword) {
            message.error('Mật khẩu xác nhận không khớp');
            return;
        }

        setProcessing(true);
        try {
            const response = await fetch('/api/players/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountIds, password: newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                message.error(data.error || 'Đổi mật khẩu thất bại');
                return;
            }

            message.success(`Đã đổi mật khẩu cho ${data.updated} tài khoản`);
            setShowPasswordModal(false);
            setPasswordTarget(null);
            setNewPassword('');
            setConfirmPassword('');
            if (!passwordTarget) {
                setSelectedRowKeys([]);
            }
            fetchAccounts();
        } catch (error) {
            console.error('Error updating password:', error);
            message.error('Đổi mật khẩu thất bại');
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
            title: 'Password',
            dataIndex: 'password',
            key: 'password',
            render: (text) => <PasswordCell password={text} />,
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
                                setAddToDanap(false);
                                setSubtractFromDanap(false);
                            }}
                            loading={processing}
                        >
                            Tiền
                        </Button>
                    </Tooltip>
                    <Tooltip title="Đổi mật khẩu">
                        <Button
                            size="small"
                            icon={<KeyOutlined />}
                            onClick={() => openPasswordModal(record)}
                            loading={processing}
                        >
                            Đổi MK
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
                <Space wrap>
                    <Input
                        placeholder="Tìm kiếm theo username, email hoặc tên nhân vật..."
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: '400px', maxWidth: '100%' }}
                    />
                    <Button
                        icon={<KeyOutlined />}
                        disabled={selectedRowKeys.length === 0}
                        onClick={() => openPasswordModal()}
                    >
                        Đổi mật khẩu đã chọn ({selectedRowKeys.length})
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={accounts}
                loading={loading}
                rowKey="id"
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                }}
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
                onOk={() => handleUpdateCash()}
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
                    <Checkbox
                        checked={actionType === 'add' ? addToDanap : subtractFromDanap}
                        onChange={(e) => {
                            if (actionType === 'add') {
                                setAddToDanap(e.target.checked);
                            } else {
                                setSubtractFromDanap(e.target.checked);
                            }
                        }}
                    >
                        Tác động đến tổng nạp (danap)
                    </Checkbox>
                    <div className="flex gap-2">
                        <Button
                            type="primary"
                            block
                            onClick={() => {
                                setActionType('add');
                                handleUpdateCash('add');
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
                                handleUpdateCash('subtract');
                            }}
                            disabled={!cashAmount}
                            loading={processing}
                        >
                            Trừ tiền
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                title={
                    passwordTarget
                        ? `Đổi mật khẩu - ${passwordTarget.username}`
                        : `Đổi mật khẩu ${selectedRowKeys.length} tài khoản`
                }
                open={showPasswordModal}
                onOk={handleUpdatePassword}
                onCancel={() => setShowPasswordModal(false)}
                confirmLoading={processing}
                okText="Đổi mật khẩu"
                cancelText="Hủy"
                okButtonProps={{ disabled: !newPassword || !confirmPassword }}
            >
                <div className="space-y-4 py-4">
                    {!passwordTarget && (
                        <p className="text-sm text-gray-600">
                            Mật khẩu mới sẽ áp dụng cho toàn bộ tài khoản đang được tick chọn.
                        </p>
                    )}
                    <Input.Password
                        placeholder="Nhập mật khẩu mới"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        maxLength={100}
                    />
                    <Input.Password
                        placeholder="Nhập lại mật khẩu mới"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        maxLength={100}
                        onPressEnter={handleUpdatePassword}
                    />
                </div>
            </Modal>
        </div>
    );
}
