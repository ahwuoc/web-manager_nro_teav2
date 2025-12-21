'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Select, Checkbox, Collapse, Space, InputNumber, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, CopyOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

interface ItemOption {
    id: number;
    param: number;
}

interface ShopItem {
    cost: number;
    type_sell: number;
    is_new: boolean;
    temp_id: number;
    item_spec: number;
    options: ItemOption[];
    is_sell: boolean;
}

interface ItemEditorProps {
    value: string;
    onChange: (value: string) => void;
}

interface ItemTemplate {
    id: number;
    NAME: string;
    description: string;
    TYPE: number;
    level: number;
    gold: number;
    gem: number;
}

interface ItemOptionTemplate {
    id: number;
    NAME: string;
    type: number;
}

export default function ItemEditorV2({ value, onChange }: ItemEditorProps) {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [itemTemplates, setItemTemplates] = useState<{ [key: number]: ItemTemplate }>({});
    const [optionTemplates, setOptionTemplates] = useState<{ [key: number]: ItemOptionTemplate }>({});
    const [allItemTemplates, setAllItemTemplates] = useState<ItemTemplate[]>([]);
    const [allOptionTemplates, setAllOptionTemplates] = useState<ItemOptionTemplate[]>([]);
    const [searchTerm, setSearchTerm] = useState<{ [key: number]: string }>({});
    const [optionSearchTerm, setOptionSearchTerm] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        try {
            const parsed = JSON.parse(value || '[]');
            setItems(parsed);
            setError(null);
        } catch (e: any) {
            setError(e.message);
            setItems([]);
        }
    }, [value]);

    useEffect(() => {
        fetchItemTemplates();
        fetchOptionTemplates();
    }, []);

    useEffect(() => {
        if (items.length > 0) {
            const itemIds = items.map(item => item.temp_id).filter(id => id > 0);
            if (itemIds.length > 0) {
                fetchSpecificItemTemplates(itemIds);
            }

            const optionIds = items.flatMap(item =>
                item.options.map(opt => opt.id)
            ).filter(id => id > 0);
            if (optionIds.length > 0) {
                fetchSpecificOptionTemplates(optionIds);
            }
        }
    }, [items]);

    const fetchItemTemplates = async () => {
        try {
            const response = await fetch('/api/item-template');
            const data = await response.json();
            if (data.success) {
                setAllItemTemplates(data.data);
                setItemTemplates(data.map);
            }
        } catch (error) {
            console.error('Error fetching item templates:', error);
        }
    };

    const fetchOptionTemplates = async () => {
        try {
            const response = await fetch('/api/item-option-template');
            const data = await response.json();
            if (data.success) {
                setAllOptionTemplates(data.data);
                setOptionTemplates(data.map);
            }
        } catch (error) {
            console.error('Error fetching option templates:', error);
        }
    };

    const fetchSpecificItemTemplates = async (ids: number[]) => {
        try {
            const response = await fetch(`/api/item-template?ids=${ids.join(',')}`);
            const data = await response.json();
            if (data.success) {
                setItemTemplates(prev => ({ ...prev, ...data.map }));
            }
        } catch (error) {
            console.error('Error fetching specific item templates:', error);
        }
    };

    const fetchSpecificOptionTemplates = async (ids: number[]) => {
        try {
            const response = await fetch(`/api/item-option-template?ids=${ids.join(',')}`);
            const data = await response.json();
            if (data.success) {
                setOptionTemplates(prev => ({ ...prev, ...data.map }));
            }
        } catch (error) {
            console.error('Error fetching specific option templates:', error);
        }
    };

    const updateItems = (newItems: ShopItem[]) => {
        setItems(newItems);
        onChange(JSON.stringify(newItems, null, 2));
    };

    const addNewItem = () => {
        const newItem: ShopItem = {
            cost: 0,
            type_sell: 1,
            is_new: false,
            temp_id: 0,
            item_spec: 0,
            options: [],
            is_sell: true
        };
        updateItems([...items, newItem]);
    };

    const deleteItem = (index: number) => {
        updateItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof ShopItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        updateItems(newItems);
    };

    const addOption = (itemIndex: number) => {
        const newItems = [...items];
        newItems[itemIndex].options.push({ id: 0, param: 0 });
        updateItems(newItems);
    };

    const updateOption = (itemIndex: number, optionIndex: number, field: 'id' | 'param', value: number) => {
        const newItems = [...items];
        newItems[itemIndex].options[optionIndex] = {
            ...newItems[itemIndex].options[optionIndex],
            [field]: value
        };
        updateItems(newItems);
    };

    const deleteOption = (itemIndex: number, optionIndex: number) => {
        const newItems = [...items];
        newItems[itemIndex].options = newItems[itemIndex].options.filter((_, i) => i !== optionIndex);
        updateItems(newItems);
    };

    const duplicateItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index + 1, 0, { ...items[index] });
        updateItems(newItems);
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === items.length - 1) return;

        const newItems = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        updateItems(newItems);
    };

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                ❌ JSON Error: {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Danh sách Items ({items.length})</span>
                <Button type="primary" icon={<PlusOutlined />} onClick={addNewItem} size="small">
                    Thêm Item
                </Button>
            </div>

            {items.length === 0 ? (
                <div className="p-4 text-center text-gray-500 border border-dashed rounded">
                    Chưa có items. Click "Thêm Item" để bắt đầu.
                </div>
            ) : (
                <Collapse
                    items={items.map((item, index) => ({
                        key: index,
                        label: (
                            <span>
                                Item #{index + 1} - {itemTemplates[item.temp_id]?.NAME || `ID: ${item.temp_id}`} | Giá: {item.cost}
                            </span>
                        ),
                        extra: (
                            <Space size="small" onClick={(e) => e.stopPropagation()}>
                                <Tooltip title="Lên">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<ArrowUpOutlined />}
                                        onClick={() => moveItem(index, 'up')}
                                        disabled={index === 0}
                                    />
                                </Tooltip>
                                <Tooltip title="Xuống">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<ArrowDownOutlined />}
                                        onClick={() => moveItem(index, 'down')}
                                        disabled={index === items.length - 1}
                                    />
                                </Tooltip>
                                <Tooltip title="Nhân bản">
                                    <Button
                                        type="text"
                                        size="small"
                                        icon={<CopyOutlined />}
                                        onClick={() => duplicateItem(index)}
                                    />
                                </Tooltip>
                                <Tooltip title="Xóa">
                                    <Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<DeleteOutlined />}
                                        onClick={() => deleteItem(index)}
                                    />
                                </Tooltip>
                            </Space>
                        ),
                        children: (
                            <div className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Item Template</label>
                                        <Input
                                            placeholder="Tìm kiếm item..."
                                            value={searchTerm[index] || ''}
                                            onChange={(e) => {
                                                setSearchTerm({ ...searchTerm, [index]: e.target.value });
                                            }}
                                            size="small"
                                            className="mb-2"
                                        />
                                        <Select
                                            value={item.temp_id || undefined}
                                            onChange={(val) => {
                                                updateItem(index, 'temp_id', val || 0);
                                                setSearchTerm({ ...searchTerm, [index]: '' });
                                            }}
                                            placeholder="Chọn item..."
                                            size="small"
                                            style={{ width: '100%' }}
                                            options={allItemTemplates
                                                .filter(template =>
                                                    !searchTerm[index] ||
                                                    template.NAME.toLowerCase().includes(searchTerm[index].toLowerCase()) ||
                                                    template.id.toString().includes(searchTerm[index])
                                                )
                                                .slice(0, 100)
                                                .map(template => ({
                                                    label: `${template.id} - ${template.NAME}`,
                                                    value: template.id
                                                }))}
                                        />
                                        {itemTemplates[item.temp_id] && (
                                            <div className="text-xs text-gray-600 mt-1">
                                                {itemTemplates[item.temp_id].description}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Giá (Cost)</label>
                                        <InputNumber
                                            value={item.cost}
                                            onChange={(val) => updateItem(index, 'cost', val || 0)}
                                            style={{ width: '100%' }}
                                            size="small"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Loại bán</label>
                                        <Select
                                            value={item.type_sell}
                                            onChange={(val) => updateItem(index, 'type_sell', val)}
                                            size="small"
                                            style={{ width: '100%' }}
                                            options={[
                                                { label: 'Vàng', value: 0 },
                                                { label: 'Ngọc', value: 1 },
                                                { label: 'Hồng Ngọc', value: 3 }
                                            ]}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Item Spec</label>
                                        <InputNumber
                                            value={item.item_spec}
                                            onChange={(val) => updateItem(index, 'item_spec', val || 0)}
                                            style={{ width: '100%' }}
                                            size="small"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-6">
                                    <Checkbox
                                        checked={item.is_new}
                                        onChange={(e) => updateItem(index, 'is_new', e.target.checked)}
                                    >
                                        Mới (is_new)
                                    </Checkbox>
                                    <Checkbox
                                        checked={item.is_sell}
                                        onChange={(e) => updateItem(index, 'is_sell', e.target.checked)}
                                    >
                                        Có bán (is_sell)
                                    </Checkbox>
                                </div>

                                {/* Options */}
                                <div className="border-t pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-medium">Options ({item.options.length})</span>
                                        <Button
                                            type="dashed"
                                            size="small"
                                            icon={<PlusOutlined />}
                                            onClick={() => addOption(index)}
                                        >
                                            Thêm Option
                                        </Button>
                                    </div>

                                    {item.options.map((option, optIndex) => (
                                        <div key={optIndex} className="flex gap-2 items-end mb-2">
                                            <div className="flex-1">
                                                <Input
                                                    placeholder="Tìm kiếm option..."
                                                    value={optionSearchTerm[`${index}-${optIndex}`] || ''}
                                                    onChange={(e) => {
                                                        setOptionSearchTerm({
                                                            ...optionSearchTerm,
                                                            [`${index}-${optIndex}`]: e.target.value
                                                        });
                                                    }}
                                                    size="small"
                                                    className="mb-1"
                                                />
                                                <Select
                                                    value={option.id || undefined}
                                                    onChange={(val) => {
                                                        updateOption(index, optIndex, 'id', val || 0);
                                                        setOptionSearchTerm({
                                                            ...optionSearchTerm,
                                                            [`${index}-${optIndex}`]: ''
                                                        });
                                                    }}
                                                    placeholder="Chọn option..."
                                                    size="small"
                                                    style={{ width: '100%' }}
                                                    options={allOptionTemplates
                                                        .filter(template =>
                                                            !optionSearchTerm[`${index}-${optIndex}`] ||
                                                            template.NAME.toLowerCase().includes(optionSearchTerm[`${index}-${optIndex}`].toLowerCase()) ||
                                                            template.id.toString().includes(optionSearchTerm[`${index}-${optIndex}`])
                                                        )
                                                        .slice(0, 50)
                                                        .map(template => ({
                                                            label: `${template.id} - ${template.NAME}`,
                                                            value: template.id
                                                        }))}
                                                />
                                            </div>
                                            <div className="w-24">
                                                <InputNumber
                                                    placeholder="Giá trị"
                                                    value={option.param}
                                                    onChange={(val) => updateOption(index, optIndex, 'param', val || 0)}
                                                    size="small"
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                            <Button
                                                type="text"
                                                danger
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                onClick={() => deleteOption(index, optIndex)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    }))}
                />
            )}
        </div>
    );
}
