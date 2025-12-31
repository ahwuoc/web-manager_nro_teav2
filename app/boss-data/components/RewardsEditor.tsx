'use client';

import { Button, InputNumber, Select, Space, Table, Switch, Input, Collapse } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

interface Reward {
    itemId?: number;
    type?: string;
    quantity: number[];
    chance: number;
    loop?: number[];
    playerOnly?: boolean;
    condition?: string;
    itemOptions?: number[][];
}

interface ItemTemplate {
    id: number;
    NAME: string;
}

interface ItemOptionTemplate {
    id: number;
    NAME: string;
}

interface RewardsEditorProps {
    value: string;
    onChange: (value: string) => void;
    itemTemplates: { [key: number]: ItemTemplate };
    optionTemplates: { [key: number]: ItemOptionTemplate };
}

const REWARD_TYPES = [
    { value: 'DO_THAN_LINH', label: 'Đồ Thần Linh' },
    { value: 'DOT_LIEN', label: 'Đồ Thần Linh (alias)' },
    { value: 'GOLD', label: 'Gold' },
    { value: 'EXP', label: 'EXP' },
    { value: 'RUBY', label: 'Ruby' },
];

const CONDITIONS = [
    { value: 'TASK_31', label: 'TASK_31' },
    { value: 'TASK_32', label: 'TASK_32' },
    { value: 'TASK_33', label: 'TASK_33' },
    { value: 'TOP_DAMAGE', label: 'TOP_DAMAGE' },
];

export default function RewardsEditor({ value, onChange, itemTemplates, optionTemplates }: RewardsEditorProps) {
    const parseRewards = (): Reward[] => {
        try {
            return JSON.parse(value) || [];
        } catch {
            return [];
        }
    };

    const rewards = parseRewards();

    const updateRewards = (newRewards: Reward[]) => {
        // Clean up undefined fields
        const cleaned = newRewards.map(r => {
            const result: any = { quantity: r.quantity, chance: r.chance };
            if (r.itemId !== undefined && r.itemId !== null) result.itemId = r.itemId;
            if (r.type) result.type = r.type;
            if (r.loop && r.loop.length > 0) result.loop = r.loop;
            if (r.playerOnly === false) result.playerOnly = false;
            if (r.condition) result.condition = r.condition;
            if (r.itemOptions && r.itemOptions.length > 0) result.itemOptions = r.itemOptions;
            return result;
        });
        onChange(JSON.stringify(cleaned));
    };

    const addReward = () => {
        updateRewards([...rewards, { itemId: 0, quantity: [1, 1], chance: 100 }]);
    };

    const removeReward = (index: number) => {
        updateRewards(rewards.filter((_, i) => i !== index));
    };

    const updateReward = (index: number, updates: Partial<Reward>) => {
        const newRewards = [...rewards];
        newRewards[index] = { ...newRewards[index], ...updates };
        // If switching to type, clear itemId
        if (updates.type) {
            delete newRewards[index].itemId;
        }
        // If switching to itemId, clear type
        if (updates.itemId !== undefined) {
            delete newRewards[index].type;
        }
        updateRewards(newRewards);
    };

    const itemOptions = Object.values(itemTemplates).map(item => ({
        value: item.id,
        label: `${item.id} - ${item.NAME}`
    }));

    const columns = [
        {
            title: 'Item/Type',
            key: 'itemOrType',
            width: 280,
            render: (_: any, record: Reward, index: number) => (
                <div className="space-y-1">
                    <Select
                        value={record.type ? 'type' : 'item'}
                        onChange={(val) => {
                            if (val === 'type') {
                                updateReward(index, { type: 'GOLD', itemId: undefined });
                            } else {
                                updateReward(index, { itemId: 0, type: undefined });
                            }
                        }}
                        options={[
                            { value: 'item', label: 'Item' },
                            { value: 'type', label: 'Type đặc biệt' },
                        ]}
                        size="small"
                        style={{ width: '100%' }}
                    />
                    {record.type ? (
                        <Select
                            value={record.type}
                            onChange={(val) => updateReward(index, { type: val })}
                            options={REWARD_TYPES}
                            size="small"
                            style={{ width: '100%' }}
                        />
                    ) : (
                        <Select
                            value={record.itemId}
                            onChange={(val) => updateReward(index, { itemId: val })}
                            options={itemOptions}
                            showSearch
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            size="small"
                            style={{ width: '100%' }}
                            placeholder="Chọn item"
                        />
                    )}
                </div>
            ),
        },
        {
            title: 'Số lượng',
            key: 'quantity',
            width: 140,
            render: (_: any, record: Reward, index: number) => (
                <Space size={2}>
                    <InputNumber
                        min={1}
                        value={record.quantity[0]}
                        onChange={(val) => updateReward(index, { quantity: [val ?? 1, record.quantity[1] ?? record.quantity[0]] })}
                        size="small"
                        style={{ width: 60 }}
                    />
                    <span>-</span>
                    <InputNumber
                        min={1}
                        value={record.quantity[1] ?? record.quantity[0]}
                        onChange={(val) => updateReward(index, { quantity: [record.quantity[0], val ?? 1] })}
                        size="small"
                        style={{ width: 60 }}
                    />
                </Space>
            ),
        },
        {
            title: '%',
            dataIndex: 'chance',
            key: 'chance',
            width: 70,
            render: (chance: number, _: Reward, index: number) => (
                <InputNumber
                    min={1}
                    max={100}
                    value={chance}
                    onChange={(val) => updateReward(index, { chance: val ?? 100 })}
                    size="small"
                    style={{ width: '100%' }}
                />
            ),
        },
        {
            title: 'Loop',
            key: 'loop',
            width: 140,
            render: (_: any, record: Reward, index: number) => (
                <Space size={2}>
                    <InputNumber
                        min={1}
                        value={record.loop?.[0] ?? 1}
                        onChange={(val) => updateReward(index, { loop: [val ?? 1, record.loop?.[1] ?? 1] })}
                        size="small"
                        style={{ width: 60 }}
                        placeholder="1"
                    />
                    <span>-</span>
                    <InputNumber
                        min={1}
                        value={record.loop?.[1] ?? 1}
                        onChange={(val) => updateReward(index, { loop: [record.loop?.[0] ?? 1, val ?? 1] })}
                        size="small"
                        style={{ width: 60 }}
                        placeholder="1"
                    />
                </Space>
            ),
        },
        {
            title: 'Public',
            key: 'playerOnly',
            width: 60,
            render: (_: any, record: Reward, index: number) => (
                <Switch
                    size="small"
                    checked={record.playerOnly === false}
                    onChange={(checked) => updateReward(index, { playerOnly: checked ? false : undefined })}
                />
            ),
        },
        {
            title: 'Condition',
            key: 'condition',
            width: 110,
            render: (_: any, record: Reward, index: number) => (
                <Select
                    value={record.condition}
                    onChange={(val) => updateReward(index, { condition: val })}
                    allowClear
                    size="small"
                    placeholder="None"
                    style={{ width: '100%' }}
                    options={CONDITIONS}
                />
            ),
        },
        {
            title: '',
            key: 'action',
            width: 40,
            render: (_: any, __: Reward, index: number) => (
                <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeReward(index)}
                />
            ),
        },
    ];

    return (
        <div>
            <Table
                dataSource={rewards}
                columns={columns}
                rowKey={(_, index) => index?.toString() ?? '0'}
                pagination={false}
                size="small"
                bordered
                expandable={{
                    expandedRowRender: (record, index) => (
                        <ItemOptionsEditor
                            value={record.itemOptions || []}
                            onChange={(opts) => updateReward(index, { itemOptions: opts })}
                            disabled={!!record.type}
                            optionTemplates={optionTemplates}
                        />
                    ),
                    rowExpandable: (record) => !record.type,
                }}
            />
            <Button
                type="dashed"
                onClick={addReward}
                icon={<PlusOutlined />}
                className="mt-2 w-full"
            >
                Thêm reward
            </Button>
        </div>
    );
}

function ItemOptionsEditor({ value, onChange, disabled, optionTemplates }: { 
    value: number[][]; 
    onChange: (v: number[][]) => void; 
    disabled: boolean;
    optionTemplates: { [key: number]: ItemOptionTemplate };
}) {
    if (disabled) return <div className="text-gray-400 text-sm">Item options không áp dụng cho type</div>;

    const optionSelectOptions = Object.values(optionTemplates).map(opt => ({
        value: opt.id,
        label: `${opt.id} - ${opt.NAME}`
    }));

    const addOption = () => {
        onChange([...value, [0, 1, 1]]);
    };

    const removeOption = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    const updateOption = (index: number, optIndex: number, val: number) => {
        const newOpts = [...value];
        newOpts[index] = [...newOpts[index]];
        newOpts[index][optIndex] = val;
        onChange(newOpts);
    };

    return (
        <div className="p-2 bg-gray-50 rounded">
            <div className="text-sm font-medium mb-2">Item Options: [[optionId, min, max], ...]</div>
            {value.map((opt, index) => (
                <Space key={index} className="mb-1">
                    <Select
                        value={opt[0]}
                        onChange={(v) => updateOption(index, 0, v ?? 0)}
                        options={optionSelectOptions}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        size="small"
                        placeholder="Option"
                        style={{ width: 180 }}
                    />
                    <InputNumber
                        value={opt[1]}
                        onChange={(v) => updateOption(index, 1, v ?? 1)}
                        size="small"
                        placeholder="Min"
                        style={{ width: 70 }}
                    />
                    <InputNumber
                        value={opt[2] ?? opt[1]}
                        onChange={(v) => updateOption(index, 2, v ?? 1)}
                        size="small"
                        placeholder="Max"
                        style={{ width: 70 }}
                    />
                    <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removeOption(index)} />
                </Space>
            ))}
            <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={addOption}>
                Thêm option
            </Button>
        </div>
    );
}
