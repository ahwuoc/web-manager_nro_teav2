'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import DetailItemEditor from '../components/DetailItemEditor';
import DetailDisplay from '../components/DetailDisplay';

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

export default function WeeklyTopRewardsPage({ params }: { params: Promise<{ typeId: string }> }) {
    const router = useRouter();
    const [type, setType] = useState<WeeklyTopType | null>(null);
    const [rewards, setRewards] = useState<WeeklyTopReward[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingReward, setEditingReward] = useState<WeeklyTopReward | null>(null);
    const [form] = Form.useForm();
    const [typeId, setTypeId] = useState<string>('');

    useEffect(() => {
        const getParams = async () => {
            const resolvedParams = await params;
            setTypeId(resolvedParams.typeId);
        };
        getParams();
    }, [params]);

    useEffect(() => {
        if (typeId) {
            fetchType();
            fetchRewards();
        }
    }, [typeId]);

    const fetchType = async () => {
        try {
            const response = await fetch(`/api/weekly-top-types/${typeId}`);
            const data = await response.json();
            if (data.success) {
                setType(data.data);
            }
        } catch (error) {
            message.error('Không thể tải thông tin loại top');
        }
    };

    const fetchRewards = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/weekly-top-rewards?top_type_id=${typeId}`);
            const data = await response.json();
            if (data.success) {
                setRewards(data.data);
            }
        } catch (error) {
            message.error('Không thể tải danh sách phần thưởng');
        }
        setLoading(false);
    };

    const handleSubmit = async (values: any) => {
        try {
            const url = editingReward ? `/api/weekly-top-rewards/${editingReward.id}` : '/api/weekly-top-rewards';
            const method = editingReward ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    top_type_id: parseInt(typeId)
                })
            });

            const data = await response.json();
            if (data.success) {
                message.success(editingReward ? 'Cập nhật thành công' : 'Tạo mới thành công');
                setModalVisible(false);
                setEditingReward(null);
                form.resetFields();
                fetchRewards();
            } else {
                message.error(data.error);
            }
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/weekly-top-rewards/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                message.success('Xóa thành công');
                fetchRewards();
            } else {
                message.error(data.error);
            }
        } catch (error) {
            message.error('Có lỗi xảy ra');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Hạng từ',
            dataIndex: 'rank_from',
            key: 'rank_from',
            width: 100,
        },
        {
            title: 'Hạng đến',
            dataIndex: 'rank_to',
            key: 'rank_to',
            width: 100,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Chi tiết phần thưởng',
            dataIndex: 'details',
            key: 'details',
            render: (text: string) => <DetailDisplay details={text} maxItems={3} />,
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 150,
            render: (record: WeeklyTopReward) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditingReward(record);
                            form.setFieldsValue(record);
                            setModalVisible(true);
                        }}
                    />
                    <Popconfirm
                        title="Bạn có chắc muốn xóa?"
                        onConfirm={() => handleDelete(record.id)}
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
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => router.push('/weekly-top')}
                >
                    Quay lại
                </Button>
                <div>
                    <h1 style={{ margin: 0 }}>
                        Quản lý phần thưởng: {type?.name}
                    </h1>
                    <p style={{ margin: 0, color: '#666' }}>
                        Cột dữ liệu: {type?.column_name} | Thứ tự: {type?.order_index}
                    </p>
                </div>
            </div>

            <div style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingReward(null);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                >
                    Thêm phần thưởng
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={rewards}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingReward ? 'Sửa phần thưởng' : 'Thêm phần thưởng'}
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingReward(null);
                    form.resetFields();
                }}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item
                            name="rank_from"
                            label="Hạng từ"
                            rules={[{ required: true, message: 'Vui lòng nhập hạng từ' }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                            name="rank_to"
                            label="Hạng đến"
                            rules={[{ required: true, message: 'Vui lòng nhập hạng đến' }]}
                            style={{ flex: 1 }}
                        >
                            <InputNumber min={1} style={{ width: '100%' }} />
                        </Form.Item>
                    </div>
                    <Form.Item
                        name="description"
                        label="Mô tả"
                    >
                        <Input placeholder="Mô tả ngắn gọn về phần thưởng" />
                    </Form.Item>
                    <Form.Item
                        name="details"
                        label="Chi tiết phần thưởng"
                        rules={[{ required: true, message: 'Vui lòng nhập chi tiết' }]}
                    >
                        <DetailItemEditor />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                {editingReward ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                            <Button onClick={() => {
                                setModalVisible(false);
                                setEditingReward(null);
                                form.resetFields();
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