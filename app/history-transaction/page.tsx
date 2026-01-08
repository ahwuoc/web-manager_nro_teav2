'use client';

import { useState, useEffect } from 'react';
import { Table, Input, Button, Popconfirm, message, Space, Tooltip } from 'antd';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface Transaction {
    id: number;
    player_1: string;
    player_2: string;
    item_player_1: string;
    item_player_2: string;
    bag_1_before_tran: string;
    bag_2_before_tran: string;
    bag_1_after_tran: string;
    bag_2_after_tran: string;
    time_tran: string;
}

export default function HistoryTransactionPage() {
    const [data, setData] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 20,
        total: 0
    });

    const fetchData = async (page = 1, pageSize = 20) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/history-transaction?page=${page}&pageSize=${pageSize}&search=${search}`);
            const result = await res.json();
            if (result.data) {
                setData(result.data);
                setPagination({
                    current: result.page,
                    pageSize: result.pageSize,
                    total: result.total
                });
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            message.error('Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/history-transaction/${id}`, { method: 'DELETE' });
            if (res.ok) {
                message.success('Xóa thành công');
                fetchData(pagination.current, pagination.pageSize);
            } else {
                message.error('Xóa thất bại');
            }
        } catch (error) {
            console.error('Error deleting:', error);
            message.error('Lỗi khi xóa');
        }
    };

    const handleDeleteAll = async () => {
        try {
            const res = await fetch(`/api/history-transaction`, { method: 'DELETE' });
            if (res.ok) {
                message.success('Đã xóa toàn bộ lịch sử');
                fetchData(1, pagination.pageSize);
            } else {
                message.error('Xóa thất bại');
            }
        } catch (error) {
            console.error('Error deleting all:', error);
            message.error('Lỗi khi xóa tất cả');
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData(1, pagination.pageSize);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const itemsColumn = (title: string, dataIndex: string) => ({
        title,
        dataIndex,
        key: dataIndex,
        ellipsis: true,
        render: (text: string) => (
            <div className="max-w-xs truncate" title={text}>
                {text || <span className="text-gray-400 italic">Không có</span>}
            </div>
        )
    });

    const columns: ColumnsType<Transaction> = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 80,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Người chơi 1',
            dataIndex: 'player_1',
            key: 'player_1',
            render: (text) => <span className="font-semibold text-blue-600">{text}</span>
        },
        itemsColumn('Items P1', 'item_player_1'),
        {
            title: 'Người chơi 2',
            dataIndex: 'player_2',
            key: 'player_2',
            render: (text) => <span className="font-semibold text-purple-600">{text}</span>
        },
        itemsColumn('Items P2', 'item_player_2'),
        {
            title: 'Thời gian',
            dataIndex: 'time_tran',
            width: 180,
            render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm:ss')
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 100,
            align: 'center',
            render: (_, record) => (
                <Popconfirm
                    title="Xóa bản ghi này?"
                    description="Hành động này không thể hoàn tác"
                    onConfirm={(e) => {
                        e?.stopPropagation();
                        handleDelete(record.id);
                    }}
                    onCancel={(e) => e?.stopPropagation()}
                    okText="Xóa"
                    cancelText="Hủy"
                >
                    <Button
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={(e) => e.stopPropagation()}
                    />
                </Popconfirm>
            )
        }
    ];

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-800">Lịch sử giao dịch</h1>
                    <p className="text-gray-600">Quản lý và tra cứu lịch sử giao dịch giữa các người chơi.</p>
                </div>
                {data.length > 0 && (
                    <Popconfirm
                        title="Xóa TOÀN BỘ lịch sử?"
                        description="CẢNH BÁO: Tất cả dữ liệu giao dịch sẽ bị xóa vĩnh viễn!"
                        onConfirm={handleDeleteAll}
                        okText="Xóa tất cả"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger type="primary" icon={<DeleteOutlined />}>
                            Xóa tất cả
                        </Button>
                    </Popconfirm>
                )}
            </div>

            <div className="mb-6">
                <Input
                    placeholder="Tìm kiếm tên người chơi hoặc tên vật phẩm..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-md h-10"
                    allowClear
                />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} giao dịch`,
                        onChange: (page, pageSize) => fetchData(page, pageSize)
                    }}
                    expandable={{
                        expandedRowRender: (record) => (
                            <div className="p-4 bg-gray-50 rounded-lg space-y-4 m-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded border border-blue-100 shadow-sm">
                                        <h4 className="font-bold mb-2 text-blue-700 flex items-center">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                            {record.player_1}
                                        </h4>
                                        <div className="mb-2">
                                            <span className="text-xs font-semibold uppercase text-gray-500">Items giao dịch:</span>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded text-gray-700 break-words">{record.item_player_1 || "(Không có)"}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold uppercase text-gray-500">Túi sau giao dịch:</span>
                                            <div className="mt-1 p-2 bg-gray-50 rounded text-xs text-gray-600 max-h-40 overflow-y-auto break-words font-mono">
                                                {record.bag_1_after_tran}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded border border-purple-100 shadow-sm">
                                        <h4 className="font-bold mb-2 text-purple-700 flex items-center">
                                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                            {record.player_2}
                                        </h4>
                                        <div className="mb-2">
                                            <span className="text-xs font-semibold uppercase text-gray-500">Items giao dịch:</span>
                                            <p className="text-sm mt-1 p-2 bg-gray-50 rounded text-gray-700 break-words">{record.item_player_2 || "(Không có)"}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-semibold uppercase text-gray-500">Túi sau giao dịch:</span>
                                            <div className="mt-1 p-2 bg-gray-50 rounded text-xs text-gray-600 max-h-40 overflow-y-auto break-words font-mono">
                                                {record.bag_2_after_tran}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right text-xs text-gray-400">
                                    ID Giao dịch: #{record.id} • Thời gian: {dayjs(record.time_tran).format('DD/MM/YYYY HH:mm:ss')}
                                </div>
                            </div>
                        ),
                        expandRowByClick: true
                    }}
                />
            </div>
        </div>
    );
}
