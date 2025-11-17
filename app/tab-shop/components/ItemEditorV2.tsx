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

export default function ItemEditorV2({ value, onChange }: ItemEditorProps) {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [error, setError] = useState<string | null>(null);

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
                                                Item #{index + 1} - ID: {item.temp_id} | Giá: {item.cost}
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
                                                <Label>Item Template ID</Label>
                                                <Input
                                                    type="number"
                                                    value={item.temp_id}
                                                    onChange={(e) => updateItem(index, 'temp_id', parseInt(e.target.value) || 0)}
                                                />
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
                                                <div key={optIndex} className="flex gap-2 items-end">
                                                    <div className="flex-1 space-y-2">
                                                        <Label className="text-xs">Option ID</Label>
                                                        <Input
                                                            type="number"
                                                            value={option.id}
                                                            onChange={(e) => updateOption(index, optIndex, 'id', parseInt(e.target.value) || 0)}
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <Label className="text-xs">Param</Label>
                                                        <Input
                                                            type="number"
                                                            value={option.param}
                                                            onChange={(e) => updateOption(index, optIndex, 'param', parseInt(e.target.value) || 0)}
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
