'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Space, Tooltip, Form, InputNumber, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import DetailItemEditor from '../moc-nap/components/DetailItemEditor';

interface MocOnline {
    id: number;
    info: string;
    required_online: number;
    detail: string;
}

export default function MocOnlineManagement() {
    const [data, setData] = useState<MocOnline[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [form] = Form.useForm();

    const [formData, setFormData] = useState({
        info: '',
        required_online: 0,
        detail: '[]'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('/api/moc-online');
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const url = editingId ? `/api/moc-online/${editingId}` : '/api/moc-online';
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                message.success(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                await fetchData();
                handleCloseModal();
            } else {
                message.error(result.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error saving:', error);
            message.error('Có lỗi xảy ra');
        }
    };

    const handleEdit = (record: MocOnline) => {
        setEditingId(record.id);
        setFormData({
            info: record.info,
            required_online: record.required_online || 0,
            detail: record.detail
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const response = await fetch(`/api/moc-online/${id}`, { method: 'DELETE' });
                    const result = await response.json();
                    if (result.success) {
                        message.success('Xóa thành công!');
                        await fetchData();
                    } else {
                        message.error(result.error || 'Có lỗi xảy ra');
                    }
                } catch (error) {
                    message.error('Có lỗi xảy ra');
                }
            }
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({ info: '', required_online: 0, detail: '[]' });
        form.resetFields();
    };

    const columns: ColumnsType<MocOnline> = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 60, sorter: (a, b) => a.id - b.id },
        {
            title: 'Thông tin',
            dataIndex: 'info',
            key: 'info',
            render: (text) => <div className="max-w-xs truncate" title={text}>{text}</div>
        },
        {
            title: 'Thời gian online (phút)',
            dataIndex: 'required_online',
            key: 'required_online',
            render: (val) => val?.toLocaleString() || 0,
            sorter: (a, b) => (a.required_online || 0) - (b.required_online || 0)
        },
        {
            title: 'Chi tiết',
            dataIndex: 'detail',
            key: 'detail',
            render: (detail) => {
                try {
                    const items = JSON.parse(detail);
                    return `${items.length} items`;
                } catch {
                    return 'Không có items';
                }
            }
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
                    </Tooltip>
                </Space>
            )
        }
    ];

    const filteredData = data.filter(d => d.info.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Quản lý Mốc Online</h1>
                <p className="text-gray-600">Quản lý phần thưởng theo thời gian online</p>
            </div>

            <div className="mb-4 flex gap-4 items-center">
                <Input
                    placeholder="Tìm kiếm..."
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
                        setFormData({ info: '', required_online: 0, detail: '[]' });
                        setIsModalOpen(true);
                    }}
                >
                    Thêm mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredData}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Tổng ${total}` }}
            />

            <Modal
                title={editingId ? 'Chỉnh sửa' : 'Thêm mới'}
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
                            placeholder="Nhập thông tin..."
                            rows={3}
                        />
                    </Form.Item>

                    <Form.Item label="Thời gian online yêu cầu (phút)">
                        <InputNumber
                            min={0}
                            value={formData.required_online}
                            onChange={(val) => setFormData({ ...formData, required_online: val || 0 })}
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
