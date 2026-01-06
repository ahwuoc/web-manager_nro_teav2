'use client';

import { Button, InputNumber, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface HpEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function HpEditor({ value, onChange }: HpEditorProps) {
    const parseHp = (): number[] => {
        try {
            const arr = JSON.parse(value);
            return Array.isArray(arr) ? arr : [0];
        } catch {
            return [0];
        }
    };

    const hpBars = parseHp();

    const updateHp = (newHp: number[]) => {
        onChange(JSON.stringify(newHp));
    };

    const updateBar = (index: number, val: number) => {
        const newHp = [...hpBars];
        newHp[index] = val;
        updateHp(newHp);
    };

    const addBar = () => {
        updateHp([...hpBars, 0]);
    };

    const removeBar = (index: number) => {
        if (hpBars.length <= 1) return;
        updateHp(hpBars.filter((_, i) => i !== index));
    };

    const formatNumber = (val: number | undefined) => {
        if (val === undefined) return '';
        return val.toLocaleString();
    };

    const parseNumber = (val: string | undefined) => {
        if (!val) return 0;
        return parseInt(val.replace(/,/g, '')) || 0;
    };

    return (
        <div className="space-y-2">
            {hpBars.map((hp, index) => (
                <div key={index} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">Thanh {index + 1}:</span>
                    <InputNumber
                        value={hp}
                        onChange={(val) => updateBar(index, val ?? 0)}
                        formatter={formatNumber}
                        parser={parseNumber}
                        style={{ width: 200 }}
                        min={0}
                        placeholder="Nhập HP"
                    />
                    {hpBars.length > 1 && (
                        <Button
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeBar(index)}
                        />
                    )}
                </div>
            ))}
            <Button
                type="dashed"
                size="small"
                icon={<PlusOutlined />}
                onClick={addBar}
            >
                Thêm thanh HP
            </Button>
            <div className="text-xs text-gray-400">
                Kết quả: {JSON.stringify(hpBars)}
            </div>
        </div>
    );
}
