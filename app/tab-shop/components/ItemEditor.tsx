'use client';

import { useState, useEffect } from 'react';

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

export default function ItemEditor({ value, onChange }: ItemEditorProps) {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

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
        setEditingIndex(items.length);
    };

    const deleteItem = (index: number) => {
        if (confirm('Xóa item này?')) {
            const newItems = items.filter((_, i) => i !== index);
            updateItems(newItems);
            if (editingIndex === index) setEditingIndex(null);
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
            <div className="text-red-500 text-sm p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                ❌ JSON Error: {error}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Danh sách Items ({items.length})
                </div>
                <button
                    type="button"
                    onClick={addNewItem}
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-1.5 px-4 rounded-lg transition-colors"
                >
                    + Thêm Item
                </button>
            </div>

            {/* Items List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {items.map((item, index) => (
                    <div
                        key={index}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700"
                    >
                        {/* Item Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="font-semibold text-gray-900 dark:text-white">
                                Item #{index + 1}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => moveItem(index, 'up')}
                                    disabled={index === 0}
                                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
                                    title="Di chuyển lên"
                                >
                                    ↑
                                </button>
                                <button
                                    type="button"
                                    onClick={() => moveItem(index, 'down')}
                                    disabled={index === items.length - 1}
                                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30"
                                    title="Di chuyển xuống"
                                >
                                    ↓
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                                >
                                    {editingIndex === index ? 'Thu gọn' : 'Mở rộng'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => duplicateItem(index)}
                                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm"
                                >
                                    Sao chép
                                </button>
                                <button
                                    type="button"
                                    onClick={() => deleteItem(index)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>

                        {/* Item Fields */}
                        {editingIndex === index && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Item Template ID
                                        </label>
                                        <input
                                            type="number"
                                            value={item.temp_id}
                                            onChange={(e) => updateItem(index, 'temp_id', parseInt(e.target.value) || 0)}
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Giá (Cost)
                                        </label>
                                        <input
                                            type="number"
                                            value={item.cost}
                                            onChange={(e) => updateItem(index, 'cost', parseInt(e.target.value) || 0)}
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Loại bán (Type Sell)
                                        </label>
                                        <select
                                            value={item.type_sell}
                                            onChange={(e) => updateItem(index, 'type_sell', parseInt(e.target.value))}
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                            <option value={0}>Vàng</option>
                                            <option value={1}>Ngọc</option>
                                            <option value={3}>Hồng Ngọc</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Item Spec
                                        </label>
                                        <input
                                            type="number"
                                            value={item.item_spec}
                                            onChange={(e) => updateItem(index, 'item_spec', parseInt(e.target.value) || 0)}
                                            className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={item.is_new}
                                            onChange={(e) => updateItem(index, 'is_new', e.target.checked)}
                                            className="rounded"
                                        />
                                        Mới (is_new)
                                    </label>
                                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                        <input
                                            type="checkbox"
                                            checked={item.is_sell}
                                            onChange={(e) => updateItem(index, 'is_sell', e.target.checked)}
                                            className="rounded"
                                        />
                                        Có bán (is_sell)
                                    </label>
                                </div>

                                {/* Options */}
                                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 mt-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Options ({item.options.length})
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => addOption(index)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1 px-3 rounded transition-colors"
                                        >
                                            + Thêm Option
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {item.options.map((option, optIndex) => (
                                            <div key={optIndex} className="flex gap-2 items-center bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                                <div className="flex-1">
                                                    <input
                                                        type="number"
                                                        value={option.id}
                                                        onChange={(e) => updateOption(index, optIndex, 'id', parseInt(e.target.value) || 0)}
                                                        placeholder="Option ID"
                                                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="number"
                                                        value={option.param}
                                                        onChange={(e) => updateOption(index, optIndex, 'param', parseInt(e.target.value) || 0)}
                                                        placeholder="Param"
                                                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteOption(index, optIndex)}
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                                                >
                                                    Xóa
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Collapsed View */}
                        {editingIndex !== index && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">ID:</span> {item.temp_id} |
                                <span className="font-medium"> Giá:</span> {item.cost} |
                                <span className="font-medium"> Options:</span> {item.options.length}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {items.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    Chưa có items. Click "Thêm Item" để bắt đầu.
                </div>
            )}
        </div>
    );
}
