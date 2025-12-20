'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Space, Tooltip, Form, InputNumber, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import DetailItemEditor from './components/DetailItemEditor';

interface MocNap {
    id: number;
    info: string;
    required_amount: number;
    detail: string;
}

interface ItemTemplate {
    id: number;
    NAME: string;
}

interface ItemOptionTemplate {
    id: number;
    NAME: string;
}

export default function MocNapManagement() {
    const [mocNaps, setMocNaps] = useState<MocNap[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [itemTemplates, setItemTemplates] = useState<{ [key: number]: ItemTemplate }>({});
    const [optionTemplates, setOptionTemplates] = useState<{ [key: number]: ItemOptionTemplate }>({});
    const [form] = Form.useForm();
    const [search, setSearch] = useState('');

    const [formData, setFormData] = useState({
        info: '',
        required_amount: 0,
        detail: '[]'
    });

    useEffect(() => {
        fetchMocNaps();
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

    const fetchMocNaps = async () => {
        try {
            const response = await fetch('/api/moc-nap');
            const data = await response.json();
            if (data.success) {
                setMocNaps(data.data);
            }
        } catch (error) {
            console.error('Error fetching moc_nap:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const url = editingId ? `/api/moc-nap/${editingId}` : '/api/moc-nap';
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                message.success(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                await fetchMocNaps();
                handleCloseModal();
            } else {
                message.error(data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error saving moc_nap:', error);
            message.error('Có lỗi xảy ra khi lưu dữ liệu');
        }
    };

    const handleEdit = (mocNap: MocNap) => {
        setEditingId(mocNap.id);
        setFormData({
            info: mocNap.info,
            required_amount: mocNap.required_amount || 0,
            detail: mocNap.detail
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa mốc nạp này?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const response = await fetch(`/api/moc-nap/${id}`, {
                        method: 'DELETE'
                    });

                    const data = await response.json();

                    if (data.success) {
                        message.success('Xóa thành công!');
                        await fetchMocNaps();
                    } else {
                        message.error(data.error || 'Có lỗi xảy ra');
                    }
                } catch (error) {
                    console.error('Error deleting moc_nap:', error);
                    message.error('Có lỗi xảy ra khi xóa');
                }
            }
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            info: '',
            required_amount: 0,
            detail: '[]'
        });
        form.resetFields();
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

    const columns: ColumnsType<MocNap> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Thông tin',
            dataIndex: 'info',
            key: 'info',
            render: (text) => (
                <div className="max-w-xs truncate" title={text}>
                    {text}
                </div>
            ),
        },
        {
            title: 'Số tiền yêu cầu',
            dataIndex: 'required_amount',
            key: 'required_amount',
            render: (amount) => amount ? amount.toLocaleString() : '-',
            sorter: (a, b) => (a.required_amount || 0) - (b.required_amount || 0),
        },
        {
            title: 'Chi tiết',
            dataIndex: 'detail',
            key: 'detail',
            render: (detail) => renderDetailItems(detail),
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

    const filteredMocNaps = mocNaps.filter(m =>
        m.info.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Quản lý Mốc Nạp</h1>
                <p className="text-gray-600">Quản lý danh sách các mốc nạp trong hệ thống</p>
            </div>

            <div className="mb-4 flex gap-4 items-center">
                <Input
                    placeholder="Tìm kiếm theo thông tin..."
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
                            info: '',
                            required_amount: 0,
                            detail: '[]'
                        });
                        setIsModalOpen(true);
                    }}
                >
                    Thêm mốc nạp
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredMocNaps}
                loading={loading}
                rowKey="id"
                pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} mốc nạp`,
                }}
                scroll={{ x: 1000 }}
            />

            <Modal
                title={editingId ? 'Chỉnh sửa mốc nạp' : 'Thêm mốc nạp mới'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={handleCloseModal}
                okText="Lưu"
                cancelText="Hủy"
                width={700}
            >
                <Form layout="vertical" form={form}>
                    <Form.Item label="Thông tin" required>
                        <Input.TextArea
                            value={formData.info}
                            onChange={(e) => setFormData({ ...formData, info: e.target.value })}
                            placeholder="Nhập thông tin mốc nạp..."
                            rows={4}
                        />
                    </Form.Item>

                    <Form.Item label="Số tiền yêu cầu">
                        <InputNumber
                            min={0}
                            value={formData.required_amount}
                            onChange={(val) => setFormData({ ...formData, required_amount: val || 0 })}
                            style={{ width: '100%' }}
                            placeholder="Nhập số tiền yêu cầu..."
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
