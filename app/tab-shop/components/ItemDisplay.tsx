'use client';

import { useState, useEffect } from 'react';

interface ItemOption {
    id: number;
    param: number;
    option_name?: string;
    option_type?: number;
}

interface ShopItem {
    cost: number;
    type_sell: number;
    is_new: boolean;
    temp_id: number;
    item_spec: number;
    options: ItemOption[];
    is_sell: boolean;
    // Enriched data
    item_name?: string;
    item_description?: string;
    item_icon_id?: number;
    item_type?: number;
    item_level?: number;
}

interface ItemDisplayProps {
    itemsJson: string;
}

export default function ItemDisplay({ itemsJson }: ItemDisplayProps) {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [enrichedItems, setEnrichedItems] = useState<ShopItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        parseItems();
    }, [itemsJson]);

    useEffect(() => {
        if (items.length > 0) {
            enrichItems();
        }
    }, [items]);

    const parseItems = () => {
        try {
            const parsed = JSON.parse(itemsJson);
            setItems(parsed);
            setError(null);
        } catch (e: any) {
            setError(`JSON Error: ${e.message}`);
            setItems([]);
        }
    };

    const enrichItems = async () => {
        setLoading(true);
        try {
            const enriched = await Promise.all(
                items.map(async (item) => {
                    // Fetch item template
                    const itemTemplateRes = await fetch(`/api/item-template/${item.temp_id}`);
                    const itemTemplate = itemTemplateRes.ok ? await itemTemplateRes.json() : null;

                    // Fetch option templates
                    const enrichedOptions = await Promise.all(
                        (item.options || []).map(async (opt) => {
                            if (!opt.id) return opt;

                            const optRes = await fetch(`/api/item-option-template/${opt.id}`);
                            const optTemplate = optRes.ok ? await optRes.json() : null;

                            return {
                                ...opt,
                                option_name: optTemplate?.data?.NAME || `Option #${opt.id}`,
                                option_type: optTemplate?.data?.type || 0
                            };
                        })
                    );

                    return {
                        ...item,
                        item_name: itemTemplate?.data?.NAME || `Item #${item.temp_id}`,
                        item_description: itemTemplate?.data?.description || '',
                        item_icon_id: itemTemplate?.data?.icon_id || 0,
                        item_type: itemTemplate?.data?.TYPE || 0,
                        item_level: itemTemplate?.data?.level || 0,
                        options: enrichedOptions
                    };
                })
            );

            setEnrichedItems(enriched);
        } catch (e: any) {
            console.error('Error enriching items:', e);
        } finally {
            setLoading(false);
        }
    };

    if (error) {
        return (
            <div className="text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded">
                ❌ {error}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="text-gray-500 text-sm p-2">
                ⏳ Đang tải thông tin items...
            </div>
        );
    }

    if (enrichedItems.length === 0) {
        return (
            <div className="text-gray-400 text-sm p-2">
                Không có items
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {enrichedItems.map((item, idx) => (
                <div
                    key={idx}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50"
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white">
                                {item.item_name}
                                {item.is_new && (
                                    <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                                        NEW
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {item.item_description}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {item.cost} {item.type_sell === 0 ? 'Vàng' : item.type_sell === 1 ? 'Ngọc' : 'Hồng Ngọc'}
                            </div>
                            <div className="text-xs text-gray-500">
                                Lv.{item.item_level}
                            </div>
                        </div>
                    </div>

                    {item.options && item.options.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Thuộc tính:
                            </div>
                            <div className="space-y-1">
                                {item.options.map((opt, optIdx) => (
                                    <div
                                        key={optIdx}
                                        className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2"
                                    >
                                        <span className="text-green-600 dark:text-green-400">+{opt.param}</span>
                                        <span>{opt.option_name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
