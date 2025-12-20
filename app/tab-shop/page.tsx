'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Space, Select, Tooltip, Form, InputNumber, message, Drawer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import ItemEditorV2 from './components/ItemEditorV2';

interface Shop {
    id: number;
    npc_template: {
        NAME: string;
    };
    tag_name: string | null;
}

interface TabShop {
    id: number;
    shop_id: number;
    tab_name: string;
    tab_index: number;
    items: string;
    shop: Shop;
}

interface ItemTemplate {
    id: number;
    NAME: string;
}

interface ItemOptionTemplate {
    id: number;
    NAME: string;
}

interface ShopItem {
    cost?: number;
    type_sell?: number;
    is_new?: boolean;
    temp_id: number;
    quantity?: number;
    item_spec?: number;
    options?: Array<{
        id: number;
        param: number;
    }>;
    is_sell?: boolean;
}

export default function TabShopManagement() {
    const [tabShops, setTabShops] = useState<TabShop[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [filterShopId, setFilterShopId] = useState<string>('all');
    const [itemTemplates, setItemTemplates] = useState<{ [key: number]: ItemTemplate }>({});
    const [optionTemplates, setOptionTemplates] = useState<{ [key: number]: ItemOptionTemplate }>({});
    const [viewDrawer, setViewDrawer] = useState<{ isOpen: boolean; items: string; tabName: string }>({
        isOpen: false,
        items: '[]',
        tabName: ''
    });
    const [form] = Form.useForm();
    const [search, setSearch] = useState('');

    const [formData, setFormData] = useState({
        shop_id: undefined as string | undefined,
        tab_name: '',
        tab_index: 0,
        items: '[]'
    });

    useEffect(() => {
        fetchShops();
        fetchAllTemplates();
    }, []);

    useEffect(() => {
        fetchTabShops();
    }, [filterShopId]);

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

    const parseItems = (itemsStr: string): ShopItem[] => {
        try {
            return JSON.parse(itemsStr);
        } catch {
            return [];
        }
    };

    const renderItemsSummary = (itemsStr: string) => {
        const items = parseItems(itemsStr);
        if (items.length === 0) return 'Không có items';
        return `${items.length} items`;
    };

    const renderFullItemsList = (itemsStr: string) => {
        const items = parseItems(itemsStr);

        if (items.length === 0) {
            return <div className="text-gray-500">Không có items</div>;
        }

        return (
            <div className="space-y-3">
                {items.map((item, index) => {
                    const itemTemplate = itemTemplates[item.temp_id];
                    return (
                        <div key={index} className="border-b pb-3 last:border-0">
                            <div className="font-medium">
                                {itemTemplate?.NAME || `Item #${item.temp_id}`}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1 mt-1">
                                {item.cost && <div>Giá: {item.cost.toLocaleString()} vàng</div>}
                                {item.quantity && <div>Số lượng: {item.quantity}</div>}
                                {item.options && item.options.length > 0 && (
                                    <div>
                                        <span className="font-medium">Options:</span>
                                        {item.options.map((opt, optIndex) => {
                                            const optionTemplate = optionTemplates[opt.id];
                                            return (
                                                <div key={optIndex} className="ml-2">
                                                    • {optionTemplate?.NAME || `Option #${opt.id}`}: {opt.param}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const fetchShops = async () => {
        try {
            const response = await fetch('/api/shops');
            const result = await response.json();
            if (result.success) {
                setShops(result.data);
            }
        } catch (error) {
            console.error('Error fetching shops:', error);
        }
    };

    const fetchTabShops = async () => {
        try {
            setLoading(true);
            const url = filterShopId && filterShopId !== 'all'
                ? `/api/tab-shop?shop_id=${filterShopId}`
                : '/api/tab-shop';
            const response = await fetch(url);
            const result = await response.json();
            if (result.success) {
                setTabShops(result.data);
            }
        } catch (error) {
            console.error('Error fetching tab shops:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const url = editingId ? `/api/tab-shop/${editingId}` : '/api/tab-shop';
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    shop_id: formData.shop_id || ''
                })
            });

            const result = await response.json();

            if (result.success) {
                message.success(editingId ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
                setIsModalOpen(false);
                resetForm();
                fetchTabShops();
            } else {
                message.error(result.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error saving tab shop:', error);
            message.error('Không thể lưu tab shop');
        }
    };

    const handleEdit = (tabShop: TabShop) => {
        setEditingId(tabShop.id);
        setFormData({
            shop_id: tabShop.shop_id.toString(),
            tab_name: tabShop.tab_name,
            tab_index: tabShop.tab_index,
            items: tabShop.items
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa tab shop này?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const response = await fetch(`/api/tab-shop/${id}`, {
                        method: 'DELETE'
                    });

                    const result = await response.json();

                    if (result.success) {
                        message.success('Xóa thành công!');
                        fetchTabShops();
                    } else {
                        message.error(result.error || 'Không thể xóa tab shop');
                    }
                } catch (error) {
                    console.error('Error deleting tab shop:', error);
                    message.error('Không thể xóa tab shop');
                }
            }
        });
    };

    const resetForm = () => {
        setFormData({
            shop_id: undefined,
            tab_name: '',
            tab_index: 0,
            items: '[]'
        });
        setEditingId(null);
        form.resetFields();
    };

    const columns: ColumnsType<TabShop> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Shop',
            key: 'shop',
            render: (_, record) => (
                <div>
                    <div className="font-medium">Shop #{record.shop_id}</div>
                    <div className="text-sm text-gray-600">{record.shop.npc_template.NAME}</div>
                </div>
            ),
        },
        {
            title: 'Tên Tab',
            dataIndex: 'tab_name',
            key: 'tab_name',
        },
        {
            title: 'Vị trí',
            dataIndex: 'tab_index',
            key: 'tab_index',
            align: 'center' as const,
            sorter: (a, b) => a.tab_index - b.tab_index,
        },
        {
            title: 'Items',
            dataIndex: 'items',
            key: 'items',
            render: (items) => renderItemsSummary(items),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center' as const,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => setViewDrawer({
                                isOpen: true,
                                items: record.items,
                                tabName: record.tab_name
                            })}
                        />
                    </Tooltip>
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

    const filteredTabShops = tabShops.filter(t =>
        t.tab_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Quản lý Tab Shop</h1>
                <p className="text-gray-600">Quản lý các tab trong shop của game</p>
            </div>

            <div className="mb-4 flex gap-4 items-center flex-wrap">
                <Input
                    placeholder="Tìm kiếm theo tên tab..."
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: '300px' }}
                />
                <Select
                    value={filterShopId}
                    onChange={setFilterShopId}
                    style={{ minWidth: '300px' }}
                    options={[
                        { label: 'Tất cả Shop', value: 'all' },
                        ...shops.map(shop => ({
                            label: `Shop #${shop.id} - ${shop.npc_template.NAME}`,
                            value: shop.id.toString()
                        }))
                    ]}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        resetForm();
                        setIsModalOpen(true);
                    }}
                >
                    Tạo Tab Mới
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredTabShops}
                loading={loading}
                rowKey="id"
                pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} tab`,
                }}
                scroll={{ x: 1200 }}
            />

            <Modal
                title={editingId ? 'Sửa Tab Shop' : 'Tạo Tab Shop Mới'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                okText="Lưu"
                cancelText="Hủy"
                width={700}
            >
                <Form layout="vertical" form={form}>
                    <Form.Item label="Shop" required>
                        <Select
                            value={formData.shop_id}
                            onChange={(value) => setFormData({ ...formData, shop_id: value })}
                            placeholder="Chọn shop..."
                            options={shops.map(shop => ({
                                label: `Shop #${shop.id} - ${shop.npc_template.NAME}`,
                                value: shop.id.toString()
                            }))}
                        />
                    </Form.Item>

                    <Form.Item label="Tên Tab" required>
                        <Input
                            value={formData.tab_name}
                            onChange={(e) => setFormData({ ...formData, tab_name: e.target.value })}
                            placeholder="Nhập tên tab..."
                            maxLength={50}
                        />
                    </Form.Item>

                    <Form.Item label="Vị trí (Tab Index)" required>
                        <InputNumber
                            value={formData.tab_index}
                            onChange={(val) => setFormData({ ...formData, tab_index: val || 0 })}
                            style={{ width: '100%' }}
                            min={0}
                        />
                    </Form.Item>

                    <Form.Item label="Items">
                        <ItemEditorV2
                            value={formData.items}
                            onChange={(value: string) => setFormData({ ...formData, items: value })}
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <Drawer
                title={`Danh sách Items - ${viewDrawer.tabName}`}
                onClose={() => setViewDrawer({ isOpen: false, items: '[]', tabName: '' })}
                open={viewDrawer.isOpen}
                size="large"
            >
                {renderFullItemsList(viewDrawer.items)}
            </Drawer>
        </div>
    );
}
