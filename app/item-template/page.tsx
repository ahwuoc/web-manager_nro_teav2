'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Space, Tooltip, Form, InputNumber, Select, Checkbox, Row, Col, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface ItemTemplate {
    id: number;
    TYPE: number;
    gender: number;
    NAME: string;
    description: string;
    level: number;
    icon_id: number;
    part: number;
    is_up_to_up: boolean;
    power_require: string;
    gold: number;
    gem: number;
    head: number;
    body: number;
    leg: number;
    is_up_to_up_over_99: boolean;
    can_trade: boolean;
    comment: string | null;
}

export default function ItemTemplateManagement() {
    const [items, setItems] = useState<ItemTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async (searchValue = '') => {
        setLoading(true);
        try {
            const url = searchValue ? `/api/item-template?search=${encodeURIComponent(searchValue)}` : '/api/item-template';
            const response = await fetch(url);
            const data = await response.json();
            if (data.success) {
                setItems(data.data);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
            message.error('Không thể tải danh sách item template');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchItems(search);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const url = editingId ? `/api/item-template/${editingId}` : '/api/item-template';
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values)
            });

            const data = await response.json();

            if (data.success) {
                message.success(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                await fetchItems(search);
                handleCloseModal();
            } else {
                message.error(data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error saving item template:', error);
            message.error('Có lỗi xảy ra khi lưu dữ liệu');
        }
    };

    const handleEdit = (item: ItemTemplate) => {
        setEditingId(item.id);
        form.setFieldsValue({
            ...item,
            power_require: item.power_require.toString()
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa item template này?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const response = await fetch(`/api/item-template/${id}`, {
                        method: 'DELETE'
                    });

                    const data = await response.json();

                    if (data.success) {
                        message.success('Xóa thành công!');
                        await fetchItems(search);
                    } else {
                        message.error(data.error || 'Có lỗi xảy ra');
                    }
                } catch (error) {
                    console.error('Error deleting item template:', error);
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

    const columns: ColumnsType<ItemTemplate> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Tên',
            dataIndex: 'NAME',
            key: 'NAME',
            render: (text) => <strong>{text}</strong>,
            sorter: (a, b) => a.NAME.localeCompare(b.NAME),
        },
        {
            title: 'Loại',
            dataIndex: 'TYPE',
            key: 'TYPE',
            width: 80,
            render: (type) => <Tag color="blue">Type {type}</Tag>,
        },
        {
            title: 'Cấp',
            dataIndex: 'level',
            key: 'level',
            width: 60,
        },
        {
            title: 'Icon ID',
            dataIndex: 'icon_id',
            key: 'icon_id',
            width: 80,
        },
        {
            title: 'Vàng/Ngọc',
            key: 'price',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    {record.gold > 0 && <span className="text-yellow-600">{record.gold.toLocaleString()} Vàng</span>}
                    {record.gem > 0 && <span className="text-green-600">{record.gem.toLocaleString()} Ngọc</span>}
                    {record.gold === 0 && record.gem === 0 && <span className="text-gray-400">Miễn phí</span>}
                </Space>
            ),
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

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Quản lý Item Template</h1>
                <p className="text-gray-600">Quản lý danh mục trang bị và vật phẩm gốc trong game</p>
            </div>

            <div className="mb-4 flex justify-between items-center">
                <Space>
                    <Input
                        placeholder="Tìm theo tên, ID, mô tả..."
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 300 }}
                        allowClear
                    />
                    <Button type="primary" onClick={handleSearch}>Tìm kiếm</Button>
                </Space>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingId(null);
                        form.resetFields();
                        // Set defaults
                        form.setFieldsValue({
                            TYPE: 0,
                            gender: 3,
                            level: 0,
                            icon_id: 0,
                            part: 0,
                            is_up_to_up: false,
                            power_require: "0",
                            gold: 0,
                            gem: 0,
                            head: -1,
                            body: -1,
                            leg: -1,
                            is_up_to_up_over_99: false,
                            can_trade: true
                        });
                        setIsModalOpen(true);
                    }}
                >
                    Thêm Item Template
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={items}
                loading={loading}
                rowKey="id"
                pagination={{
                    pageSize: 50,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} items`,
                }}
            />

            <Modal
                title={editingId ? 'Chỉnh sửa Item Template' : 'Thêm Item Template mới'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={handleCloseModal}
                okText="Lưu"
                cancelText="Hủy"
                width={800}
                maskClosable={false}
            >
                <Form layout="vertical" form={form}>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="id" label="ID" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} disabled={!!editingId} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="NAME" label="Tên Item" rules={[{ required: true }]}>
                                <Input placeholder="Nhập tên item..." />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="TYPE" label="Loại (Type)" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="Mô tả">
                        <Input.TextArea rows={2} placeholder="Nhập mô tả..." />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="gender" label="Giới tính">
                                <Select options={[
                                    { value: 0, label: 'Trái đất' },
                                    { value: 1, label: 'Namek' },
                                    { value: 2, label: 'Xayda' },
                                    { value: 3, label: 'Tất cả' },
                                ]} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="level" label="Cấp độ">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="icon_id" label="Icon ID">
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="part" label="Part">
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="power_require" label="Sức mạnh yêu cầu">
                                <Input placeholder="Ví dụ: 2000000000" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="gold" label="Vàng">
                                <InputNumber 
                                    style={{ width: '100%' }} 
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="gem" label="Ngọc">
                                <InputNumber 
                                    style={{ width: '100%' }} 
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="head" label="Head Part">
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="body" label="Body Part">
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="leg" label="Leg Part">
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="is_up_to_up" valuePropName="checked">
                                <Checkbox>Dùng chung (Up to up)</Checkbox>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="is_up_to_up_over_99" valuePropName="checked">
                                <Checkbox>Up to up over 99</Checkbox>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="can_trade" valuePropName="checked">
                                <Checkbox>Có thể giao dịch</Checkbox>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="comment" label="Ghi chú">
                        <Input placeholder="Ghi chú nội bộ..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
