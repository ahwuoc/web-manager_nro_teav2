'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Package } from 'lucide-react';

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
    value: string;
    onChange: (value: string) => void;
}

export default function DetailItemEditor({ value, onChange }: DetailItemEditorProps) {
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
            // Fetch item templates
            const itemResponse = await fetch('/api/item-template');
            const itemData = await itemResponse.json();
            if (itemData.success) {
                setAllItemTemplates(itemData.data);
                setItemTemplates(itemData.map);
            }

            // Fetch option templates
            const optionResponse = await fetch('/api/item-option-template');
            const optionData = await optionResponse.json();
            if (optionData.success) {
                setAllOptionTemplates(optionData.data);
                setOptionTemplates(optionData.map);
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
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label>Chi tiết phần thưởng</Label>
                <Button type="button" size="sm" onClick={addItem}>
                    <Plus className="w-4 h-4 mr-1" />
                    Thêm Item
                </Button>
            </div>

            {items.length === 0 ? (
                <div className="text-center text-gray-500 py-4 border rounded">
                    Chưa có item nào. Click "Thêm Item" để bắt đầu.
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-gray-500" />
                                    <span className="font-medium">
                                        Item #{index + 1}: {itemTemplates[item.temp_id]?.NAME || 'Chọn item'}
                                    </span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItem(index)}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs">Chọn Item</Label>
                                    <Input
                                        type="text"
                                        placeholder="Tìm kiếm item..."
                                        value={searchTerm[index] || ''}
                                        onChange={(e) => setSearchTerm({ ...searchTerm, [index]: e.target.value })}
                                        className="text-sm"
                                    />
                                    <select
                                        className="w-full p-2 border rounded text-sm"
                                        value={item.temp_id}
                                        onChange={(e) => {
                                            updateItem(index, 'temp_id', parseInt(e.target.value) || 0);
                                            setSearchTerm({ ...searchTerm, [index]: '' });
                                        }}
                                    >
                                        <option value="0">-- Chọn item --</option>
                                        {allItemTemplates
                                            .filter(template => 
                                                !searchTerm[index] || 
                                                template.NAME.toLowerCase().includes(searchTerm[index].toLowerCase()) ||
                                                template.id.toString().includes(searchTerm[index])
                                            )
                                            .slice(0, 100)
                                            .map(template => (
                                                <option key={template.id} value={template.id}>
                                                    {template.id} - {template.NAME}
                                                </option>
                                            ))}
                                    </select>
                                    {itemTemplates[item.temp_id] && (
                                        <div className="text-xs text-gray-600">
                                            {itemTemplates[item.temp_id].description}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs">Số lượng</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                    />
                                </div>
                            </div>

                            {/* Options section */}
                            <div className="border-t pt-3">
                                <div className="flex justify-between items-center mb-2">
                                    <Label className="text-xs">Options ({item.options.length})</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addOption(index)}
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Thêm Option
                                    </Button>
                                </div>

                                {item.options.map((option, optIndex) => (
                                    <div key={optIndex} className="flex gap-2 items-end mb-2">
                                        <div className="flex-1">
                                            <Input
                                                type="text"
                                                placeholder="Tìm option..."
                                                value={optionSearchTerm[`${index}-${optIndex}`] || ''}
                                                onChange={(e) => setOptionSearchTerm({
                                                    ...optionSearchTerm,
                                                    [`${index}-${optIndex}`]: e.target.value
                                                })}
                                                className="text-sm mb-1"
                                            />
                                            <select
                                                className="w-full p-2 border rounded text-sm"
                                                value={option.id}
                                                onChange={(e) => {
                                                    updateOption(index, optIndex, 'id', parseInt(e.target.value) || 0);
                                                    setOptionSearchTerm({
                                                        ...optionSearchTerm,
                                                        [`${index}-${optIndex}`]: ''
                                                    });
                                                }}
                                            >
                                                <option value="0">-- Chọn option --</option>
                                                {allOptionTemplates
                                                    .filter(template =>
                                                        !optionSearchTerm[`${index}-${optIndex}`] ||
                                                        template.NAME.toLowerCase().includes(optionSearchTerm[`${index}-${optIndex}`].toLowerCase()) ||
                                                        template.id.toString().includes(optionSearchTerm[`${index}-${optIndex}`])
                                                    )
                                                    .slice(0, 50)
                                                    .map(template => (
                                                        <option key={template.id} value={template.id}>
                                                            {template.id} - {template.NAME}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                        <div className="w-32">
                                            <Input
                                                type="number"
                                                placeholder="Giá trị"
                                                value={option.param}
                                                onChange={(e) => updateOption(index, optIndex, 'param', parseInt(e.target.value) || 0)}
                                                className="text-sm"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeOption(index, optIndex)}
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
