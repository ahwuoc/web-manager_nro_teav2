'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Space, Tooltip, Form, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

interface Setting {
    id: number;
    key_name: string;
    value: string | null;
    description: string | null;
    updated_at: string | null;
}

export default function SettingsManagement() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();
    const [search, setSearch] = useState('');

    const [formData, setFormData] = useState({
        key_name: '',
        value: '',
        description: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            const data = await response.json();
            if (data.success) {
                setSettings(data.data);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            message.error('Không thể tải danh sách cấu hình');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const url = editingId ? `/api/settings/${editingId}` : '/api/settings';
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });

            const data = await response.json();

            if (data.success) {
                message.success(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                await fetchSettings();
                handleCloseModal();
            } else {
                message.error(data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error saving setting:', error);
            message.error('Có lỗi xảy ra khi lưu dữ liệu');
        }
    };

    const handleEdit = (setting: Setting) => {
        setEditingId(setting.id);
        form.setFieldsValue({
            key_name: setting.key_name,
            value: setting.value || '',
            description: setting.description || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa cấu hình này?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const response = await fetch(`/api/settings/${id}`, {
                        method: 'DELETE'
                    });

                    const data = await response.json();

                    if (data.success) {
                        message.success('Xóa thành công!');
                        await fetchSettings();
                    } else {
                        message.error(data.error || 'Có lỗi xảy ra');
                    }
                } catch (error) {
                    console.error('Error deleting setting:', error);
                    message.error('Có lỗi xảy ra khi xóa');
                }
            }
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        form.resetFields();
    };

    const columns: ColumnsType<Setting> = [
        {
            title: 'Key Name',
            dataIndex: 'key_name',
            key: 'key_name',
            width: 200,
            render: (text) => <Tag color="blue">{text}</Tag>,
            sorter: (a, b) => a.key_name.localeCompare(b.key_name),
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (text) => (
                <div className="max-w-md break-all">
                    {text}
                </div>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            render: (text) => <span className="text-gray-500 italic">{text || 'N/A'}</span>,
        },
        {
            title: 'Cập nhật lúc',
            dataIndex: 'updated_at',
            key: 'updated_at',
            width: 180,
            render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : '-',
            sorter: (a, b) => {
                if (!a.updated_at) return -1;
                if (!b.updated_at) return 1;
                return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center' as const,
            width: 120,
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

    const filteredSettings = settings.filter(s =>
        s.key_name.toLowerCase().includes(search.toLowerCase()) ||
        (s.description?.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Quản lý Cấu hình</h1>
                <p className="text-gray-600">Quản lý các thông số cấu hình hệ thống (Settings)</p>
            </div>

            <div className="mb-4 flex justify-between items-center">
                <Input
                    placeholder="Tìm kiếm theo key hoặc mô tả..."
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: '400px' }}
                    allowClear
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingId(null);
                        form.resetFields();
                        setIsModalOpen(true);
                    }}
                >
                    Thêm cấu hình
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredSettings}
                loading={loading}
                rowKey="id"
                pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} cấu hình`,
                }}
            />

            <Modal
                title={editingId ? 'Chỉnh sửa cấu hình' : 'Thêm cấu hình mới'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={handleCloseModal}
                okText="Lưu"
                cancelText="Hủy"
                width={600}
                maskClosable={false}
            >
                <Form layout="vertical" form={form}>
                    <Form.Item 
                        name="key_name" 
                        label="Key Name" 
                        rules={[{ required: true, message: 'Vui lòng nhập Key Name' }]}
                    >
                        <Input placeholder="Ví dụ: SERVER_MAINTENANCE" disabled={!!editingId} />
                    </Form.Item>

                    <Form.Item 
                        name="value" 
                        label="Giá trị (Value)"
                    >
                        <Input.TextArea placeholder="Nhập giá trị của cấu hình..." rows={4} />
                    </Form.Item>

                    <Form.Item 
                        name="description" 
                        label="Mô tả"
                    >
                        <Input placeholder="Nhập mô tả cho cấu hình này..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
