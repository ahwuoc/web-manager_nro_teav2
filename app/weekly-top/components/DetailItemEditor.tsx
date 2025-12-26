'use client';

import { useState, useEffect } from 'react';
import { Button, Input, Select, Collapse, Space, InputNumber, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface DetailItem {
    temp_id: number;
    quantity: number;
    options: Array<{
        id: number;
        param: number;
    }>;
}

interface ItemTemplate {
    id: number;
    NAME: string;
    description: string;
}

interface ItemOptionTemplate {
    id: number;
    NAME: string;
}

interface DetailItemEditorProps {
    value?: string;
    onChange?: (value: string) => void;
}

export default function DetailItemEditor({ value = '[]', onChange = () => {} }: DetailItemEditorProps) {
    const [items, setItems] = useState<DetailItem[]>([]);
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
        } catch (e) {
            setItems([]);
        }
    }, [value]);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const itemResponse = await fetch('/api/item-template');
            const itemData = await itemResponse.json();
            if (itemData.success) {
                setAllItemTemplates(itemData.data);
                // Tạo map từ array
                const itemMap: { [key: number]: ItemTemplate } = {};
                itemData.data.forEach((item: ItemTemplate) => {
                    itemMap[item.id] = item;
                });
                setItemTemplates(itemMap);
            }

            const optionResponse = await fetch('/api/item-option-template');
            const optionData = await optionResponse.json();
            if (optionData.success) {
                setAllOptionTemplates(optionData.data);
                // Tạo map từ array
                const optionMap: { [key: number]: ItemOptionTemplate } = {};
                optionData.data.forEach((option: ItemOptionTemplate) => {
                    optionMap[option.id] = option;
                });
                setOptionTemplates(optionMap);
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const updateItems = (newItems: DetailItem[]) => {
        setItems(newItems);
        onChange(JSON.stringify(newItems, null, 2));
    };

    const addItem = () => {
        const newItem: DetailItem = {
            temp_id: 0,
            quantity: 1,
            options: []
        };
        updateItems([...items, newItem]);
    };

    const removeItem = (index: number) => {
        updateItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof DetailItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        updateItems(newItems);
    };

    const addOption = (itemIndex: number) => {
        const newItems = [...items];
        newItems[itemIndex].options.push({ id: 0, param: 0 });
        updateItems(newItems);
    };

    const removeOption = (itemIndex: number, optionIndex: number) => {
        const newItems = [...items];
        newItems[itemIndex].options = newItems[itemIndex].options.filter((_, i) => i !== optionIndex);
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

    return (
        <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>Chi tiết phần thưởng</span>
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={addItem}>
                    Thêm Item
                </Button>
            </div>

            {items.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    color: '#999', 
                    padding: '16px', 
                    border: '1px dashed #d9d9d9', 
                    borderRadius: '6px' 
                }}>
                    Chưa có item nào. Click "Thêm Item" để bắt đầu.
                </div>
            ) : (
                <Collapse
                    items={items.map((item, index) => ({
                        key: index,
                        label: (
                            <span>
                                Item #{index + 1}: {itemTemplates[item.temp_id]?.NAME || 'Chọn item'} x{item.quantity}
                            </span>
                        ),
                        extra: (
                            <Tooltip title="Xóa">
                                <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeItem(index);
                                    }}
                                />
                            </Tooltip>
                        ),
                        children: (
                            <div style={{ paddingTop: 16 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: 8, display: 'block' }}>
                                            Chọn Item
                                        </label>
                                        <Input
                                            placeholder="Tìm kiếm item..."
                                            value={searchTerm[index] || ''}
                                            onChange={(e) => setSearchTerm({ ...searchTerm, [index]: e.target.value })}
                                            size="small"
                                            style={{ marginBottom: 8 }}
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
                                            <div style={{ fontSize: '12px', color: '#666', marginTop: 4 }}>
                                                {itemTemplates[item.temp_id].description}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: 500, marginBottom: 8, display: 'block' }}>
                                            Số lượng
                                        </label>
                                        <InputNumber
                                            min={1}
                                            value={item.quantity}
                                            onChange={(val) => updateItem(index, 'quantity', val || 1)}
                                            style={{ width: '100%' }}
                                            size="small"
                                        />
                                    </div>
                                </div>

                                {/* Options section */}
                                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <span style={{ fontSize: '14px', fontWeight: 500 }}>
                                            Options ({item.options.length})
                                        </span>
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
                                        <div key={optIndex} style={{ display: 'flex', gap: 8, alignItems: 'end', marginBottom: 8 }}>
                                            <div style={{ flex: 1 }}>
                                                <Input
                                                    placeholder="Tìm option..."
                                                    value={optionSearchTerm[`${index}-${optIndex}`] || ''}
                                                    onChange={(e) => setOptionSearchTerm({
                                                        ...optionSearchTerm,
                                                        [`${index}-${optIndex}`]: e.target.value
                                                    })}
                                                    size="small"
                                                    style={{ marginBottom: 4 }}
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
                                            <div style={{ width: 96 }}>
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
                                                onClick={() => removeOption(index, optIndex)}
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