'use client';

import { useState, useEffect } from 'react';

interface DetailItem {
    temp_id: number;
    quantity: number;
    options?: Array<{
        id: number;
        param: number;
    }>;
    gold?: number;
    gem?: number;
}

interface ItemTemplate {
    id: number;
    NAME: string;
}

interface ItemOptionTemplate {
    id: number;
    NAME: string;
}

interface DetailDisplayProps {
    details: string;
    maxItems?: number;
}

export default function DetailDisplay({ details, maxItems = 10 }: DetailDisplayProps) {
    const [items, setItems] = useState<DetailItem[]>([]);
    const [itemTemplates, setItemTemplates] = useState<{ [key: number]: ItemTemplate }>({});
    const [optionTemplates, setOptionTemplates] = useState<{ [key: number]: ItemOptionTemplate }>({});

    useEffect(() => {
        try {
            const parsed = JSON.parse(details || '[]');
            setItems(parsed.slice(0, maxItems));
        } catch (e) {
            setItems([]);
        }
    }, [details, maxItems]);

    useEffect(() => {
        if (items.length > 0) {
            fetchTemplates();
        }
    }, [items]);

    const fetchTemplates = async () => {
        try {
            // Lấy danh sách item IDs cần fetch
            const itemIds = [...new Set(items.map(item => item.temp_id).filter(id => id > 0))];
            const optionIds = [...new Set(
                items.flatMap(item => item.options || [])
                    .map(opt => opt.id)
                    .filter(id => id > 0)
            )];

            if (itemIds.length > 0) {
                const itemResponse = await fetch('/api/item-template');
                const itemData = await itemResponse.json();
                if (itemData.success) {
                    const itemMap: { [key: number]: ItemTemplate } = {};
                    itemData.data.forEach((item: ItemTemplate) => {
                        if (itemIds.includes(item.id)) {
                            itemMap[item.id] = item;
                        }
                    });
                    setItemTemplates(itemMap);
                }
            }

            if (optionIds.length > 0) {
                const optionResponse = await fetch('/api/item-option-template');
                const optionData = await optionResponse.json();
                if (optionData.success) {
                    const optionMap: { [key: number]: ItemOptionTemplate } = {};
                    optionData.data.forEach((option: ItemOptionTemplate) => {
                        if (optionIds.includes(option.id)) {
                            optionMap[option.id] = option;
                        }
                    });
                    setOptionTemplates(optionMap);
                }
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    if (items.length === 0) {
        return <div style={{ color: '#999', fontSize: '12px' }}>Không có phần thưởng</div>;
    }

    return (
        <div style={{ maxWidth: 400 }}>
            {items.map((item, index) => (
                <div key={index} style={{ 
                    marginBottom: 8, 
                    padding: 8, 
                    backgroundColor: '#f5f5f5', 
                    borderRadius: 4,
                    fontSize: '12px'
                }}>
                    {item.temp_id > 0 && (
                        <>
                            <div>
                                <strong>Item ID:</strong> {item.temp_id}
                                {itemTemplates[item.temp_id] && (
                                    <span style={{ color: '#1890ff', marginLeft: 4 }}>
                                        ({itemTemplates[item.temp_id].NAME})
                                    </span>
                                )}
                            </div>
                            <div><strong>Số lượng:</strong> {item.quantity}</div>
                            {item.options && item.options.length > 0 && (
                                <div>
                                    <strong>Options:</strong>
                                    {item.options.map((opt, optIndex) => (
                                        <div key={optIndex} style={{ marginLeft: 10, fontSize: '11px' }}>
                                            • ID: {opt.id}
                                            {optionTemplates[opt.id] && (
                                                <span style={{ color: '#52c41a' }}>
                                                    ({optionTemplates[opt.id].NAME})
                                                </span>
                                            )}
                                            , Param: {opt.param}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                    {item.gold && <div><strong>Vàng:</strong> {item.gold.toLocaleString()}</div>}
                    {item.gem && <div><strong>Ngọc:</strong> {item.gem.toLocaleString()}</div>}
                </div>
            ))}
            {JSON.parse(details || '[]').length > maxItems && (
                <div style={{ fontSize: '11px', color: '#999', fontStyle: 'italic' }}>
                    ... và {JSON.parse(details || '[]').length - maxItems} item khác
                </div>
            )}
        </div>
    );
}