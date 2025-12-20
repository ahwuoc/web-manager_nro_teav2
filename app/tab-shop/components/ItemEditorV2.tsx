'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2, Copy, ChevronUp, ChevronDown } from 'lucide-react';

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

    // Fetch all item templates and option templates on mount
    useEffect(() => {
        fetchItemTemplates();
        fetchOptionTemplates();
    }, []);

    // Fetch specific item templates when items change
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
        if (confirm('Xóa item này?')) {
            updateItems(items.filter((_, i) => i !== index));
        }
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
            <Card className="border-red-500">
                <CardContent className="pt-6">
                    <p className="text-red-500 text-sm">❌ JSON Error: {error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Danh sách Items ({items.length})</p>
                <Button onClick={addNewItem} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm Item
                </Button>
            </div>

            {items.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground text-sm">
                            Chưa có items. Click "Thêm Item" để bắt đầu.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <Accordion type="multiple" className="space-y-3">
                    {items.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg">
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <AccordionTrigger className="hover:no-underline flex-1">
                                            <CardTitle className="text-base">
                                                Item #{index + 1} - {itemTemplates[item.temp_id]?.NAME || `ID: ${item.temp_id}`} | Giá: {item.cost}
                                            </CardTitle>
                                        </AccordionTrigger>
                                        <div className="flex gap-1 ml-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => moveItem(index, 'up')}
                                                disabled={index === 0}
                                            >
                                                <ChevronUp className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => moveItem(index, 'down')}
                                                disabled={index === items.length - 1}
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => duplicateItem(index)}
                                            >
                                                <Copy className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteItem(index)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <AccordionContent>
                                    <CardContent className="space-y-4 pt-0">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Item Template</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="text"
                                                        placeholder="Tìm kiếm item..."
                                                        value={searchTerm[index] || ''}
                                                        onChange={(e) => {
                                                            setSearchTerm({ ...searchTerm, [index]: e.target.value });
                                                        }}
                                                        className="mb-2"
                                                    />
                                                    <select
                                                        className="w-full p-2 border rounded"
                                                        value={item.temp_id}
                                                        onChange={(e) => {
                                                            updateItem(index, 'temp_id', parseInt(e.target.value) || 0);
                                                            setSearchTerm({ ...searchTerm, [index]: '' });
                                                        }}
                                                    >
                                                        <option value="0">Chọn item...</option>
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
                                                        <div className="text-xs text-gray-600 mt-1">
                                                            Mô tả: {itemTemplates[item.temp_id].description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Giá (Cost)</Label>
                                                <Input
                                                    type="number"
                                                    value={item.cost}
                                                    onChange={(e) => updateItem(index, 'cost', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Loại bán</Label>
                                                <Select
                                                    value={item.type_sell.toString()}
                                                    onValueChange={(val) => updateItem(index, 'type_sell', parseInt(val))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0">Vàng</SelectItem>
                                                        <SelectItem value="1">Ngọc</SelectItem>
                                                        <SelectItem value="3">Hồng Ngọc</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Item Spec</Label>
                                                <Input
                                                    type="number"
                                                    value={item.item_spec}
                                                    onChange={(e) => updateItem(index, 'item_spec', parseInt(e.target.value) || 0)}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-6">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`new-${index}`}
                                                    checked={item.is_new}
                                                    onCheckedChange={(checked) => updateItem(index, 'is_new', checked)}
                                                />
                                                <Label htmlFor={`new-${index}`} className="cursor-pointer">
                                                    Mới (is_new)
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`sell-${index}`}
                                                    checked={item.is_sell}
                                                    onCheckedChange={(checked) => updateItem(index, 'is_sell', checked)}
                                                />
                                                <Label htmlFor={`sell-${index}`} className="cursor-pointer">
                                                    Có bán (is_sell)
                                                </Label>
                                            </div>
                                        </div>

                                        {/* Options */}
                                        <div className="border-t pt-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Label>Options ({item.options.length})</Label>
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
                                                <div key={optIndex} className="space-y-2">
                                                    <div className="flex gap-2 items-start">
                                                        <div className="flex-1">
                                                            <Label className="text-xs">Option</Label>
                                                            <div className="space-y-2">
                                                                <Input
                                                                    type="text"
                                                                    placeholder="Tìm kiếm option..."
                                                                    value={optionSearchTerm[`${index}-${optIndex}`] || ''}
                                                                    onChange={(e) => {
                                                                        setOptionSearchTerm({
                                                                            ...optionSearchTerm,
                                                                            [`${index}-${optIndex}`]: e.target.value
                                                                        });
                                                                    }}
                                                                    className="text-sm"
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
                                                                    <option value="0">Chọn option...</option>
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
                                                        </div>
                                                        <div className="flex-1">
                                                            <Label className="text-xs">Giá trị (Param)</Label>
                                                            <Input
                                                                type="number"
                                                                value={option.param}
                                                                onChange={(e) => updateOption(index, optIndex, 'param', parseInt(e.target.value) || 0)}
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => deleteOption(index, optIndex)}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                    {optionTemplates[option.id] && (
                                                        <div className="text-xs text-gray-600 pl-2">
                                                            Hiện tại: {optionTemplates[option.id].NAME} = {option.param}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </AccordionContent>
                            </Card>
                        </AccordionItem>
                    ))}
                </Accordion>
            )}
        </div>
    );
}
