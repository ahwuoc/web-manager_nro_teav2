'use client';

import { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Space, Tooltip, Form, InputNumber, Select, Switch, message, Tag, Collapse } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CopyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import RewardsEditor from './components/RewardsEditor';
import SkillsEditor from './components/SkillsEditor';
import OutfitEditor from './components/OutfitEditor';

interface BossData {
    id: number;
    level_index: number;
    boss_name: string;
    display_name: string;
    level_name: string;
    gender: number;
    dame: string;
    hp: string;
    outfit: string;
    map_join: string;
    appear_type: string;
    seconds_rest: number;
    skills: string;
    text_start: string | null;
    text_mid: string | null;
    text_end: string | null;
    rewards: string | null;
    bosses_appear_together: string | null;
    is_notify_disabled: boolean | null;
    is_zone01_spawn_disabled: boolean | null;
    special_class: string | null;
    auto_spawn: boolean | null;
    damage_divisor: number | null;
}

const APPEAR_TYPES = [
    { value: 'DEFAULT_APPEAR', label: 'Default Appear' },
    { value: 'APPEAR_WITH_ANOTHER', label: 'Appear With Another' },
    { value: 'ANOTHER_LEVEL', label: 'Another Level' },
    { value: 'CALL_BY_ANOTHER', label: 'Call By Another' },
];

const GENDERS = [
    { value: 0, label: 'Trái Đất' },
    { value: 1, label: 'Namek' },
    { value: 2, label: 'Xayda' },
];

const defaultFormData = {
    id: 0,
    level_index: 0,
    boss_name: '',
    display_name: '',
    level_name: '',
    gender: 0,
    dame: '0',
    hp: '[0]',
    outfit: '[-1,-1,-1,-1,-1,-1]',
    map_join: '[]',
    appear_type: 'DEFAULT_APPEAR',
    seconds_rest: 0,
    skills: '[]',
    text_start: '[]',
    text_mid: '[]',
    text_end: '[]',
    rewards: '[]',
    bosses_appear_together: '',
    is_notify_disabled: false,
    is_zone01_spawn_disabled: true,
    special_class: '',
    auto_spawn: true,
    damage_divisor: 1,
};

interface ItemTemplate {
    id: number;
    NAME: string;
    TYPE?: number;
    head?: number;
    body?: number;
    leg?: number;
}

interface MapTemplate {
    id: number;
    NAME: string;
}

interface ItemOptionTemplate {
    id: number;
    NAME: string;
}

interface SkillTemplate {
    id: number;
    NAME: string;
    nclass_id: number;
}

export default function BossDataManagement() {
    const [bosses, setBosses] = useState<BossData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBoss, setEditingBoss] = useState<{ id: number; levelIndex: number } | null>(null);
    const [form] = Form.useForm();
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState(defaultFormData);
    const [itemTemplates, setItemTemplates] = useState<{ [key: number]: ItemTemplate }>({});
    const [mapTemplates, setMapTemplates] = useState<{ [key: number]: MapTemplate }>({});
    const [optionTemplates, setOptionTemplates] = useState<{ [key: number]: ItemOptionTemplate }>({});
    const [skillTemplates, setSkillTemplates] = useState<{ [key: number]: SkillTemplate }>({});

    useEffect(() => {
        fetchBosses();
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const [itemRes, mapRes, optionRes, skillRes] = await Promise.all([
                fetch('/api/item-template'),
                fetch('/api/map-template'),
                fetch('/api/item-option-template'),
                fetch('/api/skill-template')
            ]);
            const itemData = await itemRes.json();
            const mapData = await mapRes.json();
            const optionData = await optionRes.json();
            const skillData = await skillRes.json();
            if (itemData.success) setItemTemplates(itemData.map);
            if (mapData.success) setMapTemplates(mapData.map);
            if (optionData.success) setOptionTemplates(optionData.map);
            if (skillData.success) setSkillTemplates(skillData.map);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const fetchBosses = async () => {
        try {
            const response = await fetch('/api/boss-data');
            const data = await response.json();
            if (data.success) {
                setBosses(data.data);
            }
        } catch (error) {
            console.error('Error fetching boss_data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const url = editingBoss
                ? `/api/boss-data/${editingBoss.id}/${editingBoss.levelIndex}`
                : '/api/boss-data';
            const method = editingBoss ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    bosses_appear_together: formData.bosses_appear_together || null,
                    special_class: formData.special_class || null,
                })
            });

            const data = await response.json();

            if (data.success) {
                message.success(editingBoss ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                await fetchBosses();
                handleCloseModal();
            } else {
                message.error(data.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error saving boss_data:', error);
            message.error('Có lỗi xảy ra khi lưu dữ liệu');
        }
    };

    const handleEdit = (boss: BossData) => {
        setEditingBoss({ id: boss.id, levelIndex: boss.level_index });
        setFormData({
            id: boss.id,
            level_index: boss.level_index,
            boss_name: boss.boss_name,
            display_name: boss.display_name,
            level_name: boss.level_name,
            gender: boss.gender,
            dame: boss.dame,
            hp: boss.hp,
            outfit: boss.outfit,
            map_join: boss.map_join,
            appear_type: boss.appear_type,
            seconds_rest: boss.seconds_rest,
            skills: boss.skills,
            text_start: boss.text_start || '[]',
            text_mid: boss.text_mid || '[]',
            text_end: boss.text_end || '[]',
            rewards: boss.rewards || '[]',
            bosses_appear_together: boss.bosses_appear_together || '',
            is_notify_disabled: boss.is_notify_disabled ?? false,
            is_zone01_spawn_disabled: boss.is_zone01_spawn_disabled ?? true,
            special_class: boss.special_class || '',
            auto_spawn: boss.auto_spawn ?? true,
            damage_divisor: boss.damage_divisor ?? 1,
        });
        setIsModalOpen(true);
    };

    const handleDuplicate = (boss: BossData) => {
        setEditingBoss(null);
        setFormData({
            id: boss.id,
            level_index: boss.level_index + 1,
            boss_name: boss.boss_name,
            display_name: boss.display_name,
            level_name: boss.level_name + ' (Copy)',
            gender: boss.gender,
            dame: boss.dame,
            hp: boss.hp,
            outfit: boss.outfit,
            map_join: boss.map_join,
            appear_type: 'ANOTHER_LEVEL',
            seconds_rest: 0,
            skills: boss.skills,
            text_start: boss.text_start || '[]',
            text_mid: boss.text_mid || '[]',
            text_end: boss.text_end || '[]',
            rewards: boss.rewards || '[]',
            bosses_appear_together: boss.bosses_appear_together || '',
            is_notify_disabled: boss.is_notify_disabled ?? false,
            is_zone01_spawn_disabled: boss.is_zone01_spawn_disabled ?? true,
            special_class: boss.special_class || '',
            auto_spawn: boss.auto_spawn ?? true,
            damage_divisor: boss.damage_divisor ?? 1,
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number, levelIndex: number) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa boss này?',
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: { danger: true },
            onOk: async () => {
                try {
                    const response = await fetch(`/api/boss-data/${id}/${levelIndex}`, {
                        method: 'DELETE'
                    });
                    const data = await response.json();
                    if (data.success) {
                        message.success('Xóa thành công!');
                        await fetchBosses();
                    } else {
                        message.error(data.error || 'Có lỗi xảy ra');
                    }
                } catch (error) {
                    console.error('Error deleting boss_data:', error);
                    message.error('Có lỗi xảy ra khi xóa');
                }
            }
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBoss(null);
        setFormData(defaultFormData);
        form.resetFields();
    };

    const getMapNames = (mapJoinStr: string) => {
        try {
            const mapIds = JSON.parse(mapJoinStr);
            return mapIds.map((id: number) => mapTemplates[id]?.NAME || `Map ${id}`).join(', ');
        } catch {
            return mapJoinStr;
        }
    };

    const getRewardsSummary = (rewardsStr: string | null) => {
        try {
            const rewards = JSON.parse(rewardsStr || '[]');
            if (rewards.length === 0) return 'Không có';
            return rewards.map((r: any) => {
                const itemName = itemTemplates[r.itemId]?.NAME || `Item ${r.itemId}`;
                return `${itemName} (${r.chance}%)`;
            }).join(', ');
        } catch {
            return rewardsStr || 'Không có';
        }
    };

    const columns: ColumnsType<BossData> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'Level',
            dataIndex: 'level_index',
            key: 'level_index',
            width: 70,
            render: (val) => <Tag color="blue">{val}</Tag>,
        },
        {
            title: 'Boss Name',
            dataIndex: 'boss_name',
            key: 'boss_name',
            width: 150,
            render: (text) => <span className="font-mono text-xs">{text}</span>,
        },
        {
            title: 'Level Name',
            dataIndex: 'level_name',
            key: 'level_name',
            width: 150,
        },
        {
            title: 'Loại',
            key: 'type',
            width: 120,
            render: (_, record) => (
                record.special_class ? (
                    <Tooltip title={record.special_class}>
                        <Tag color="magenta">Đặc biệt</Tag>
                    </Tooltip>
                ) : (
                    <Tag color="default">Thường</Tag>
                )
            ),
            filters: [
                { text: 'Boss đặc biệt', value: 'special' },
                { text: 'Boss thường', value: 'normal' },
            ],
            onFilter: (value, record) => 
                value === 'special' ? !!record.special_class : !record.special_class,
        },
        {
            title: 'Chủng tộc',
            dataIndex: 'gender',
            key: 'gender',
            width: 100,
            render: (val) => GENDERS.find(g => g.value === val)?.label || val,
        },
        {
            title: 'Damage',
            dataIndex: 'dame',
            key: 'dame',
            width: 100,
            render: (val) => Number(val).toLocaleString(),
        },
        {
            title: 'Maps',
            dataIndex: 'map_join',
            key: 'map_join',
            width: 200,
            render: (val) => (
                <Tooltip title={getMapNames(val)}>
                    <span className="text-xs truncate block max-w-[180px]">{getMapNames(val)}</span>
                </Tooltip>
            ),
        },
        {
            title: 'Appear Type',
            dataIndex: 'appear_type',
            key: 'appear_type',
            width: 140,
            render: (val) => {
                const colors: Record<string, string> = {
                    'DEFAULT_APPEAR': 'green',
                    'ANOTHER_LEVEL': 'orange',
                    'APPEAR_WITH_ANOTHER': 'purple',
                    'CALL_BY_ANOTHER': 'cyan',
                };
                return <Tag color={colors[val] || 'default'}>{val}</Tag>;
            },
        },
        {
            title: 'Auto Spawn',
            dataIndex: 'auto_spawn',
            key: 'auto_spawn',
            width: 100,
            render: (val) => val ? <Tag color="green">Yes</Tag> : <Tag color="red">No</Tag>,
        },
        {
            title: 'Rewards',
            dataIndex: 'rewards',
            key: 'rewards',
            width: 200,
            render: (val) => (
                <Tooltip title={getRewardsSummary(val)}>
                    <span className="text-xs truncate block max-w-[180px]">{getRewardsSummary(val)}</span>
                </Tooltip>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                    <Tooltip title="Duplicate Level">
                        <Button size="small" icon={<CopyOutlined />} onClick={() => handleDuplicate(record)} />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id, record.level_index)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const filteredBosses = bosses.filter(b =>
        b.boss_name.toLowerCase().includes(search.toLowerCase()) ||
        b.display_name.toLowerCase().includes(search.toLowerCase()) ||
        b.level_name.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toString().includes(search)
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Quản lý Boss Data</h1>
                <p className="text-gray-600">Quản lý danh sách boss trong hệ thống</p>
            </div>

            <div className="mb-4 flex gap-4 items-center">
                <Input
                    placeholder="Tìm kiếm theo ID, tên boss..."
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ maxWidth: '300px' }}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditingBoss(null);
                        setFormData(defaultFormData);
                        setIsModalOpen(true);
                    }}
                >
                    Thêm Boss
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={filteredBosses}
                loading={loading}
                rowKey={(r) => `${r.id}-${r.level_index}`}
                pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Tổng ${total} boss levels` }}
                scroll={{ x: 1200 }}
                size="small"
            />

            <Modal
                title={editingBoss ? 'Chỉnh sửa Boss' : 'Thêm Boss mới'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={handleCloseModal}
                okText="Lưu"
                cancelText="Hủy"
                width={900}
            >
                <BossForm 
                    formData={formData} 
                    setFormData={setFormData} 
                    isEditing={!!editingBoss}
                    mapTemplates={mapTemplates}
                    itemTemplates={itemTemplates}
                    optionTemplates={optionTemplates}
                    skillTemplates={skillTemplates}
                />
            </Modal>
        </div>
    );
}


function BossForm({ formData, setFormData, isEditing, mapTemplates, itemTemplates, optionTemplates, skillTemplates }: { 
    formData: typeof defaultFormData; 
    setFormData: (data: typeof defaultFormData) => void; 
    isEditing: boolean;
    mapTemplates: { [key: number]: MapTemplate };
    itemTemplates: { [key: number]: ItemTemplate };
    optionTemplates: { [key: number]: ItemOptionTemplate };
    skillTemplates: { [key: number]: SkillTemplate };
}) {
    const mapOptions = Object.values(mapTemplates).map(m => ({
        value: m.id,
        label: `${m.id} - ${m.NAME}`
    }));

    const getSelectedMaps = () => {
        try {
            return JSON.parse(formData.map_join);
        } catch {
            return [];
        }
    };

    const setSelectedMaps = (ids: number[]) => {
        setFormData({ ...formData, map_join: JSON.stringify(ids) });
    };

    const collapseItems = [
        {
            key: 'basic',
            label: 'Thông tin cơ bản',
            children: (
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="Boss ID" required>
                        <InputNumber
                            value={formData.id}
                            onChange={(val) => setFormData({ ...formData, id: val ?? 0 })}
                            disabled={isEditing}
                            style={{ width: '100%' }}
                            placeholder="VD: -20, -203"
                        />
                    </Form.Item>
                    <Form.Item label="Level Index" required>
                        <InputNumber
                            min={0}
                            value={formData.level_index}
                            onChange={(val) => setFormData({ ...formData, level_index: val ?? 0 })}
                            disabled={isEditing}
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                    <Form.Item label="Boss Name (định danh)" required>
                        <Input
                            value={formData.boss_name}
                            onChange={(e) => setFormData({ ...formData, boss_name: e.target.value.toUpperCase() })}
                            placeholder="VD: KUKU, BLACK_GOKU"
                        />
                    </Form.Item>
                    <Form.Item label="Display Name" required>
                        <Input
                            value={formData.display_name}
                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                            placeholder="VD: Kuku, Black Goku"
                        />
                    </Form.Item>
                    <Form.Item label="Level Name" required>
                        <Input
                            value={formData.level_name}
                            onChange={(e) => setFormData({ ...formData, level_name: e.target.value })}
                            placeholder="VD: Super Black Goku"
                        />
                    </Form.Item>
                    <Form.Item label="Chủng tộc">
                        <Select
                            value={formData.gender}
                            onChange={(val) => setFormData({ ...formData, gender: val })}
                            options={GENDERS}
                        />
                    </Form.Item>
                </div>
            ),
        },
        {
            key: 'stats',
            label: 'Stats & Combat',
            children: (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item label="Damage">
                            <Input
                                value={formData.dame}
                                onChange={(e) => setFormData({ ...formData, dame: e.target.value })}
                                placeholder="VD: 9000, 80000"
                            />
                        </Form.Item>
                        <Form.Item label="Damage Divisor">
                            <InputNumber
                                min={1}
                                value={formData.damage_divisor}
                                onChange={(val) => setFormData({ ...formData, damage_divisor: val ?? 1 })}
                                style={{ width: '100%' }}
                                placeholder="Hệ số chia damage (mặc định 1)"
                            />
                        </Form.Item>
                        <Form.Item label="HP (JSON array)" className="col-span-2">
                            <Input
                                value={formData.hp}
                                onChange={(e) => setFormData({ ...formData, hp: e.target.value })}
                                placeholder='VD: [2000000] hoặc [1000000, 2000000]'
                            />
                        </Form.Item>
                    </div>
                    <Form.Item label="Skills">
                        <SkillsEditor
                            value={formData.skills}
                            onChange={(val) => setFormData({ ...formData, skills: val })}
                            skillTemplates={skillTemplates}
                        />
                    </Form.Item>
                </div>
            ),
        },
        {
            key: 'appearance',
            label: 'Appearance & Spawn',
            children: (
                <div className="space-y-4">
                    <Form.Item label="Outfit">
                        <OutfitEditor
                            value={formData.outfit}
                            onChange={(val) => setFormData({ ...formData, outfit: val })}
                            itemTemplates={itemTemplates}
                        />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item label="Map Join">
                            <Select
                                mode="multiple"
                                value={getSelectedMaps()}
                                onChange={setSelectedMaps}
                                options={mapOptions}
                                placeholder="Chọn maps boss spawn"
                                showSearch
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                        <Form.Item label="Appear Type">
                            <Select
                                value={formData.appear_type}
                                onChange={(val) => setFormData({ ...formData, appear_type: val })}
                                options={APPEAR_TYPES}
                            />
                        </Form.Item>
                        <Form.Item label="Seconds Rest">
                            <InputNumber
                                min={0}
                                value={formData.seconds_rest}
                                onChange={(val) => setFormData({ ...formData, seconds_rest: val ?? 0 })}
                                style={{ width: '100%' }}
                                placeholder="VD: 600 (10 phút)"
                            />
                        </Form.Item>
                        <Form.Item label="Bosses Appear Together (JSON array)">
                            <Input
                                value={formData.bosses_appear_together}
                                onChange={(e) => setFormData({ ...formData, bosses_appear_together: e.target.value })}
                                placeholder='VD: [-100] hoặc để trống'
                            />
                        </Form.Item>
                        <Form.Item label="Special Class" className="col-span-2">
                            <Input
                                value={formData.special_class}
                                onChange={(e) => setFormData({ ...formData, special_class: e.target.value })}
                                placeholder='VD: boss.boss_manifest.Black.BlackGoku'
                            />
                        </Form.Item>
                    </div>
                </div>
            ),
        },
        {
            key: 'chat',
            label: 'Chat Messages',
            children: (
                <div className="space-y-4">
                    <Form.Item label="Text Start (khi spawn)">
                        <Input.TextArea
                            value={formData.text_start}
                            onChange={(e) => setFormData({ ...formData, text_start: e.target.value })}
                            placeholder='VD: ["|-1|Ta sẽ tàn sát khu này"]'
                            rows={2}
                        />
                    </Form.Item>
                    <Form.Item label="Text Mid (khi đánh)">
                        <Input.TextArea
                            value={formData.text_mid}
                            onChange={(e) => setFormData({ ...formData, text_mid: e.target.value })}
                            placeholder='VD: ["|-1|Các ngươi chỉ có vậy thôi sao?"]'
                            rows={2}
                        />
                    </Form.Item>
                    <Form.Item label="Text End (khi chết/biến hình)">
                        <Input.TextArea
                            value={formData.text_end}
                            onChange={(e) => setFormData({ ...formData, text_end: e.target.value })}
                            placeholder='VD: ["|-1|Biến hình!"]'
                            rows={2}
                        />
                    </Form.Item>
                </div>
            ),
        },
        {
            key: 'rewards',
            label: 'Rewards',
            children: (
                <Form.Item label="Rewards">
                    <RewardsEditor
                        value={formData.rewards}
                        onChange={(val) => setFormData({ ...formData, rewards: val })}
                        itemTemplates={itemTemplates}
                        optionTemplates={optionTemplates}
                    />
                </Form.Item>
            ),
        },
        {
            key: 'flags',
            label: 'Flags',
            children: (
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="Auto Spawn">
                        <Switch
                            checked={formData.auto_spawn}
                            onChange={(val) => setFormData({ ...formData, auto_spawn: val })}
                        />
                        <span className="ml-2 text-gray-500">Tự động spawn khi server start</span>
                    </Form.Item>
                    <Form.Item label="Notify Disabled">
                        <Switch
                            checked={formData.is_notify_disabled}
                            onChange={(val) => setFormData({ ...formData, is_notify_disabled: val })}
                        />
                        <span className="ml-2 text-gray-500">Tắt thông báo khi spawn</span>
                    </Form.Item>
                    <Form.Item label="Zone 01 Spawn Disabled">
                        <Switch
                            checked={formData.is_zone01_spawn_disabled}
                            onChange={(val) => setFormData({ ...formData, is_zone01_spawn_disabled: val })}
                        />
                        <span className="ml-2 text-gray-500">Không spawn ở zone 01</span>
                    </Form.Item>
                </div>
            ),
        },
    ];

    return (
        <Form layout="vertical">
            <Collapse items={collapseItems} defaultActiveKey={['basic', 'stats']} />
        </Form>
    );
}
