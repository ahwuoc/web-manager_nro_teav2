'use client';

import { InputNumber, Select, Space } from 'antd';

interface ItemTemplate {
    id: number;
    NAME: string;
    TYPE?: number;
    head?: number;
    body?: number;
    leg?: number;
}

interface OutfitEditorProps {
    value: string;
    onChange: (value: string) => void;
    itemTemplates: { [key: number]: ItemTemplate };
}

// Format: [head, body, leg, weapon, slot5, slot6]
export default function OutfitEditor({ value, onChange, itemTemplates }: OutfitEditorProps) {
    const parseOutfit = (): number[] => {
        try {
            const arr = JSON.parse(value);
            // Ensure 6 slots
            while (arr.length < 6) arr.push(-1);
            return arr;
        } catch {
            return [-1, -1, -1, -1, -1, -1];
        }
    };

    const outfit = parseOutfit();

    const updateSlot = (index: number, val: number) => {
        const newOutfit = [...outfit];
        newOutfit[index] = val;
        onChange(JSON.stringify(newOutfit));
    };

    // Filter items by TYPE == 5 (trang phục)
    const costumeItems = Object.values(itemTemplates).filter(item => item.TYPE === 5);
    
    // Group by part (head, body, leg)
    const headItems = costumeItems.filter(item => item.head !== undefined && item.head !== -1);
    const bodyItems = costumeItems.filter(item => item.body !== undefined && item.body !== -1);
    const legItems = costumeItems.filter(item => item.leg !== undefined && item.leg !== -1);

    const createOptions = (items: ItemTemplate[], field: 'head' | 'body' | 'leg') => {
        return [
            { value: -1, label: 'Không có (-1)' },
            ...items.map(item => ({
                value: item[field] as number,
                label: `${item[field]} - ${item.NAME}`
            }))
        ];
    };

    const headOptions = createOptions(headItems, 'head');
    const bodyOptions = createOptions(bodyItems, 'body');
    const legOptions = createOptions(legItems, 'leg');

    // Weapon options - all items or manual input
    const weaponOptions = [
        { value: -1, label: 'Không có (-1)' },
        ...Object.values(itemTemplates)
            .filter(item => item.TYPE === 0) // TYPE 0 = weapon
            .slice(0, 100) // Limit for performance
            .map(item => ({
                value: item.id,
                label: `${item.id} - ${item.NAME}`
            }))
    ];

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Head (slot 0)</label>
                    <Select
                        value={outfit[0]}
                        onChange={(val) => updateSlot(0, val)}
                        options={headOptions}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                        }
                        style={{ width: '100%' }}
                        size="small"
                        placeholder="Chọn head"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Body (slot 1)</label>
                    <Select
                        value={outfit[1]}
                        onChange={(val) => updateSlot(1, val)}
                        options={bodyOptions}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                        }
                        style={{ width: '100%' }}
                        size="small"
                        placeholder="Chọn body"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Leg (slot 2)</label>
                    <Select
                        value={outfit[2]}
                        onChange={(val) => updateSlot(2, val)}
                        options={legOptions}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                        }
                        style={{ width: '100%' }}
                        size="small"
                        placeholder="Chọn leg"
                    />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Weapon (slot 3)</label>
                    <InputNumber
                        value={outfit[3]}
                        onChange={(val) => updateSlot(3, val ?? -1)}
                        style={{ width: '100%' }}
                        size="small"
                        placeholder="-1"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Slot 4</label>
                    <InputNumber
                        value={outfit[4]}
                        onChange={(val) => updateSlot(4, val ?? -1)}
                        style={{ width: '100%' }}
                        size="small"
                        placeholder="-1"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Slot 5</label>
                    <InputNumber
                        value={outfit[5]}
                        onChange={(val) => updateSlot(5, val ?? -1)}
                        style={{ width: '100%' }}
                        size="small"
                        placeholder="-1"
                    />
                </div>
            </div>
            <div className="text-xs text-gray-400">
                Kết quả: {JSON.stringify(outfit)}
            </div>
        </div>
    );
}
