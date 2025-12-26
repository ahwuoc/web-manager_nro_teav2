'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

interface WeeklyTopType {
    id: number;
    name: string;
    order_index: number;
    column_name: string;
    created_at: string;
    weekly_top_rewards: WeeklyTopReward[];
}

interface WeeklyTopReward {
    id: number;
    top_type_id: number;
    rank_from: number;
    rank_to: number;
    details: string;
    description?: string;
    created_at: string;
}

export default function WeeklyTopPage() {
    const [types, setTypes] = useState<WeeklyTopType[]>([]);
    const [loading, setLoading] = useState(false);
    const [typeModalVisible, setTypeModalVisible] = useState(false);
    const [editingType, setEditingType] = useState<WeeklyTopType | null>(null);
    const [typeForm] = Form.useForm();

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/weekly-top-types');
            const data = await response.json();
            if (data.success) {
                setTypes(data.data);
            }
        } catch (error) {
            message.error('Không thể tải danh sách loại top');
        }
        setLoading(false);
    };

    const handleTypeSubmit = async (values: any) => {
        try {
            const url = editingType ? `/api/weekly-top-types/${editingType.id}` : '/api/weekly-top-types';
            const method = editingType ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });

            const data = await response.json();
            if (data.success) {
                message.success(editingType ? 'Cập nhật thành công' : 'Tạo mới thành công');
                setTypeModalVisible(false);
                setEditingType(null);
                typeForm.resetFields();
                fetchTypes();
            } else {
                message.error(data.error);
            }
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const handleDeleteType = async (id: number) => {
        try {
            const response = await fetch(`/api/weekly-top-types/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                message.success('Xóa thành công');
                fetchTypes();
            } else {
                message.error(data.error);
            }
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const typeColumns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Thứ tự',
            dataIndex: 'order_index',
            key: 'order_index',
            width: 100,
        },
        {
            title: 'Cột dữ liệu',
            dataIndex: 'column_name',
            key: 'column_name',
        },
        {
            title: 'Số phần thưởng',
            key: 'rewards_count',
            render: (record: WeeklyTopType) => record.weekly_top_rewards?.length || 0,
            width: 120,
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 200,
            render: (record: WeeklyTopType) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => {
                            window.location.href = `/weekly-top/${record.id}`;
                        }}
                    >
                        Quản lý reward
                    </Button>
                    <Button
                        size="small"
                        onClick={() => {
                            setEditingType(record);
                            typeForm.setFieldsValue(record);
                            setTypeModalVisible(true);
                        }}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa?"
                        onConfirm={() => handleDeleteType(record.id)}
                    >
                        <Button
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <h1>Quản lý Weekly Top</h1>
            
            <div style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingType(null);
                        typeForm.resetFields();
                        setTypeModalVisible(true);
                    }}
                >
                    Thêm loại top
                </Button>
            </div>
            <Table
                columns={typeColumns}
                dataSource={types}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            {/* Modal loại top */}
            <Modal
                title={editingType ? 'Sửa loại top' : 'Thêm loại top'}
                open={typeModalVisible}
                onCancel={() => {
                    setTypeModalVisible(false);
                    setEditingType(null);
                    typeForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={typeForm}
                    layout="vertical"
                    onFinish={handleTypeSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Tên loại top"
                        rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="order_index"
                        label="Thứ tự"
                        rules={[{ required: true, message: 'Vui lòng nhập thứ tự' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        name="column_name"
                        label="Tên cột dữ liệu"
                        rules={[{ required: true, message: 'Vui lòng nhập tên cột' }]}
                    >
                        <Input placeholder="vd: power, vang, coin..." />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingType ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                            <Button onClick={() => {
                                setTypeModalVisible(false);
                                setEditingType(null);
                                typeForm.resetFields();
                            }}>
                                Hủy
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}