'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Space, Tag, Tooltip, Form, InputNumber, DatePicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, GiftOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import DetailItemEditor from './components/DetailItemEditor';

interface Giftcode {
    id: number;
    code: string;
    count_left: number;
    detail: string;
    datecreate: string;
    expired: string;
    type: number;
}

interface ItemTemplate {
    id: number;
    NAME: string;
}

interface ItemOptionTemplate {
    id: number;
    NAME: string;
}

export default function GiftcodeManagement() {
    const [giftcodes, setGiftcodes] = useState<Giftcode[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [itemTemplates, setItemTemplates] = useState<{ [key: number]: ItemTemplate }>({});
    const [optionTemplates, setOptionTemplates] = useState<{ [key: number]: ItemOptionTemplate }>({});
    const [form] = Form.useForm();
    const [search, setSearch] = useState('');

    const [formData, setFormData] = useState({
        code: '',
        count_left: 0,
        detail: '[]',
        expired: dayjs(),
        type: 0
    });

    useEffect(() => {
        fetchGiftcodes();
        fetchAllTemplates();
    }, []);

    const fetchAllTemplates = async () => {
        try {
            const itemResponse = await fetch('/api/item-template');
            const itemData = await itemResponse.json();
            if (itemData.success) {
                setItemTemplates(itemData.map);
            }

            const optionResponse = await fetch('/api/item-option-template');
            const optionData = await optionResponse.json();
            if (optionData.success) {
                setOptionTemplates(optionData.map);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const fetchGiftcodes = async () => {
        try {
            const response = await fetch('/api/giftcode');
            const data = await response.json();
            if (data.success) {
                setGiftcodes(data.data);
            }
        } catch (error) {
            console.error('Error fetching giftcodes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const url = editingId ? `/api/giftcode/${editingId}` : '/api/giftcode';
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: formData.code,
                    count_left: formData.count_left,
                    detail: formData.detail,
                    expired: formData.expired.toISOString(),
                    type: formData.type
                })
            });

            const data = await response.json();

            if (data.success) {
                message.success(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                await fetchGiftcodes();
                handleCloseModal();
            } else {
                message.error(data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error saving giftcode:', error);
            message.error('Có lỗi xảy ra khi lưu dữ liệu');
        }
    };

    const handleEdit = (giftcode: Giftcode) => {
        setEditingId(giftcode.id);
        setFormData({
            code: giftcode.code,
            count_left: giftcode.count_left,
            detail: giftcode.detail,
            expired: dayjs(giftcode.expired),
            type: giftcode.type
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa giftcode này?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const response = await fetch(`/api/giftcode/${id}`, {
                        method: 'DELETE'
                    });

                    const data = await response.json();

                    if (data.success) {
                        message.success('Xóa thành công!');
                        await fetchGiftcodes();
                    } else {
                        message.error(data.error || 'Có lỗi xảy ra');
                    }
                } catch (error) {
                    console.error('Error deleting giftcode:', error);
                    message.error('Có lỗi xảy ra khi xóa');
                }
            }
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            code: '',
            count_left: 0,
            detail: '[]',
            expired: dayjs(),
            type: 0
        });
        form.resetFields();
    };

    const isExpired = (expiredDate: string) => {
        return new Date(expiredDate) < new Date();
    };

    const parseDetailItems = (detail: string) => {
        try {
            return JSON.parse(detail);
        } catch {
            return [];
        }
    };

    const renderDetailItems = (detail: string) => {
        const items = parseDetailItems(detail);
        if (items.length === 0) return 'Không có items';
        return `${items.length} items`;
    };

    const columns: ColumnsType<Giftcode> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Mã Code',
            dataIndex: 'code',
            key: 'code',
            render: (text) => <span className="font-mono font-bold text-blue-600">{text}</span>,
        },
        {
            title: 'Lượt còn lại',
            dataIndex: 'count_left',
            key: 'count_left',
            align: 'center' as const,
            render: (count) => (
                <Tag color={count > 0 ? 'green' : 'red'}>
                    {count}
                </Tag>
            ),
            sorter: (a, b) => a.count_left - b.count_left,
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            align: 'center' as const,
            render: (type) => <Tag>Type {type}</Tag>,
        },
        {
            title: 'Chi tiết',
            dataIndex: 'detail',
            key: 'detail',
            render: (detail) => renderDetailItems(detail),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => {
                if (isExpired(record.expired)) {
                    return <Tag color="red">Hết hạn</Tag>;
                }
                if (record.count_left === 0) {
                    return <Tag color="default">Hết lượt</Tag>;
                }
                return <Tag color="green">Còn dùng</Tag>;
            },
        },
        {
            title: 'Hết hạn',
            dataIndex: 'expired',
            key: 'expired',
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
            sorter: (a, b) => new Date(a.expired).getTime() - new Date(b.expired).getTime(),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center' as const,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record.id)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const filteredGiftcodes = giftcodes.filter(g =>
        g.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                    <GiftOutlined />
                    Quản lý Giftcode
                </h1>
                <p className="text-gray-600">Quản lý danh sách các giftcode trong hệ thống</p>
            </div>

            <div className="mb-4 flex gap-4 items-center">
                <Input
                    placeholder="Tìm kiếm theo mã code..."
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: '300px' }}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
                            code: '',
                            count_left: 0,
                            detail: '[]',
                            expired: dayjs(),
                            type: 0
                        });
                        setIsModalOpen(true);
                    }}
                >
                    Thêm giftcode
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredGiftcodes}
                loading={loading}
                rowKey="id"
                pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} giftcode`,
                }}
                scroll={{ x: 1200 }}
            />

            <Modal
                title={editingId ? 'Chỉnh sửa giftcode' : 'Thêm giftcode mới'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={handleCloseModal}
                okText="Lưu"
                cancelText="Hủy"
                width={700}
            >
                <Form layout="vertical" form={form}>
                    <Form.Item label="Mã giftcode" required>
                        <Input
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="Nhập mã giftcode..."
                        />
                    </Form.Item>

                    <Form.Item label="Số lượt sử dụng" required>
                        <InputNumber
                            min={0}
                            value={formData.count_left}
                            onChange={(val) => setFormData({ ...formData, count_left: val || 0 })}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="Loại giftcode" required>
                        <InputNumber
                            min={0}
                            value={formData.type}
                            onChange={(val) => setFormData({ ...formData, type: val || 0 })}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="Ngày hết hạn" required>
                        <DatePicker
                            value={formData.expired}
                            onChange={(date) => setFormData({ ...formData, expired: date || dayjs() })}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>

                    <Form.Item label="Chi tiết items">
                        <DetailItemEditor
                            value={formData.detail}
                            onChange={(newValue) => setFormData({ ...formData, detail: newValue })}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
