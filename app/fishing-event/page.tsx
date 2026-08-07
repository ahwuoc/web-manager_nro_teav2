'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Alert, Button, Card, Form, Input, InputNumber, Modal, Select, Space, Switch,
    Table, Tabs, Tag, Typography, message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import DetailItemEditor from '../moc-nap/components/DetailItemEditor';

interface ItemTemplate { id: number; NAME: string; }
interface FishConfig {
    item_id: number; item_name: string; icon_id: number; catch_weight: number;
    min_weight_grams: number; max_weight_grams: number; base_points: string;
    points_per_kg: number; enabled: boolean; sort_order: number;
}
interface Milestone {
    id: number; season_id: string; name: string; description: string | null;
    required_points: string; reward_items: string; reward_gold: string;
    reward_gem: number; reward_ruby: number; enabled: boolean; sort_order: number;
}
type FishForm = Omit<FishConfig, 'item_name' | 'icon_id' | 'base_points'> & { base_points: number };
type MilestoneForm = Omit<Milestone, 'id' | 'required_points' | 'reward_gold'> & {
    required_points: number; reward_gold: number;
};

const emptyFish: FishForm = {
    item_id: 0, catch_weight: 1, min_weight_grams: 100, max_weight_grams: 1000,
    base_points: 0, points_per_kg: 1, enabled: true, sort_order: 0,
};
const emptyMilestone = (season: string): MilestoneForm => ({
    season_id: season, name: '', description: '', required_points: 100,
    reward_items: '[]', reward_gold: 0, reward_gem: 0, reward_ruby: 0,
    enabled: true, sort_order: 0,
});

async function apiRequest(url: string, init?: RequestInit) {
    const response = await fetch(url, init);
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Yêu cầu thất bại');
    return data;
}

export default function FishingEventManagement() {
    const [fish, setFish] = useState<FishConfig[]>([]);
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [items, setItems] = useState<ItemTemplate[]>([]);
    const [season, setSeason] = useState('2026-08');
    const [loadingFish, setLoadingFish] = useState(false);
    const [loadingMilestones, setLoadingMilestones] = useState(false);
    const [fishModal, setFishModal] = useState(false);
    const [milestoneModal, setMilestoneModal] = useState(false);
    const [editingFishId, setEditingFishId] = useState<number | null>(null);
    const [editingMilestoneId, setEditingMilestoneId] = useState<number | null>(null);
    const [fishForm, setFishForm] = useState<FishForm>(emptyFish);
    const [milestoneForm, setMilestoneForm] = useState<MilestoneForm>(emptyMilestone('2026-08'));
    const [saving, setSaving] = useState(false);

    const loadFish = useCallback(async () => {
        setLoadingFish(true);
        try { setFish((await apiRequest('/api/fishing-event/fish')).data); }
        catch (error) { message.error((error as Error).message); }
        finally { setLoadingFish(false); }
    }, []);

    const loadMilestones = useCallback(async () => {
        setLoadingMilestones(true);
        try { setMilestones((await apiRequest(`/api/fishing-event/milestones?season=${encodeURIComponent(season)}`)).data); }
        catch (error) { message.error((error as Error).message); }
        finally { setLoadingMilestones(false); }
    }, [season]);

    useEffect(() => {
        loadFish();
        fetch('/api/item-template').then((response) => response.json()).then((data) => {
            if (data.success) setItems(data.data);
        }).catch(() => message.error('Không thể tải item template'));
    }, [loadFish]);
    useEffect(() => { loadMilestones(); }, [loadMilestones]);

    const totalWeight = useMemo(
        () => fish.filter((row) => row.enabled).reduce((sum, row) => sum + row.catch_weight, 0), [fish],
    );
    const itemOptions = useMemo(() => items.map((item) => ({
        value: item.id, label: `#${item.id} - ${item.NAME}`,
    })), [items]);

    const openFish = (row?: FishConfig) => {
        setEditingFishId(row?.item_id ?? null);
        setFishForm(row ? { ...row, base_points: Number(row.base_points) } : { ...emptyFish });
        setFishModal(true);
    };
    const openMilestone = (row?: Milestone) => {
        setEditingMilestoneId(row?.id ?? null);
        setMilestoneForm(row ? {
            season_id: row.season_id, name: row.name, description: row.description ?? '',
            required_points: Number(row.required_points), reward_items: row.reward_items,
            reward_gold: Number(row.reward_gold), reward_gem: row.reward_gem,
            reward_ruby: row.reward_ruby, enabled: row.enabled, sort_order: row.sort_order,
        } : emptyMilestone(season));
        setMilestoneModal(true);
    };

    const saveFish = async () => {
        if (!fishForm.item_id) return message.warning('Hãy chọn item cá');
        setSaving(true);
        try {
            await apiRequest(editingFishId ? `/api/fishing-event/fish/${editingFishId}` : '/api/fishing-event/fish', {
                method: editingFishId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fishForm),
            });
            message.success('Đã lưu cấu hình cá. Game server nhận thay đổi trong tối đa 30 giây.');
            setFishModal(false); await loadFish();
        } catch (error) { message.error((error as Error).message); }
        finally { setSaving(false); }
    };
    const saveMilestone = async () => {
        if (!milestoneForm.name.trim()) return message.warning('Hãy nhập tên mốc');
        setSaving(true);
        try {
            await apiRequest(editingMilestoneId
                ? `/api/fishing-event/milestones/${editingMilestoneId}` : '/api/fishing-event/milestones', {
                method: editingMilestoneId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(milestoneForm),
            });
            message.success('Đã lưu mốc câu cá');
            setMilestoneModal(false); await loadMilestones();
        } catch (error) { message.error((error as Error).message); }
        finally { setSaving(false); }
    };

    const remove = (type: 'fish' | 'milestone', id: number) => Modal.confirm({
        title: 'Xác nhận xóa', content: type === 'fish'
            ? 'Loài cá này sẽ không còn được câu.'
            : 'Mốc đã có người nhận sẽ không thể xóa; hãy tắt mốc nếu cần giữ lịch sử.',
        okText: 'Xóa', okButtonProps: { danger: true }, cancelText: 'Hủy',
        onOk: async () => {
            try {
                await apiRequest(type === 'fish' ? `/api/fishing-event/fish/${id}` : `/api/fishing-event/milestones/${id}`, { method: 'DELETE' });
                message.success('Đã xóa');
                if (type === 'fish') await loadFish(); else await loadMilestones();
            } catch (error) { message.error((error as Error).message); }
        },
    });

    const fishColumns: ColumnsType<FishConfig> = [
        { title: 'Cá', key: 'fish', render: (_, row) => <><b>{row.item_name}</b><br/><Typography.Text type="secondary">#{row.item_id} · icon {row.icon_id}</Typography.Text></> },
        { title: 'Trọng số / tỷ lệ', dataIndex: 'catch_weight', render: (value, row) => <>{value}<br/><Tag color="blue">{row.enabled && totalWeight ? (value * 100 / totalWeight).toFixed(2) : '0.00'}%</Tag></> },
        { title: 'Cân nặng', key: 'weight', render: (_, row) => `${row.min_weight_grams.toLocaleString()} - ${row.max_weight_grams.toLocaleString()} g` },
        { title: 'Điểm', key: 'points', render: (_, row) => `${Number(row.base_points).toLocaleString()} cơ bản + ${row.points_per_kg}/kg` },
        { title: 'Trạng thái', dataIndex: 'enabled', render: (enabled) => <Tag color={enabled ? 'green' : 'default'}>{enabled ? 'Đang câu được' : 'Đã tắt'}</Tag> },
        { title: 'Thứ tự', dataIndex: 'sort_order', width: 80 },
        { title: 'Thao tác', key: 'actions', render: (_, row) => <Space><Button onClick={() => openFish(row)}>Sửa</Button><Button danger onClick={() => remove('fish', row.item_id)}>Xóa</Button></Space> },
    ];
    const milestoneColumns: ColumnsType<Milestone> = [
        { title: 'Mốc', key: 'name', render: (_, row) => <><b>{row.name}</b><br/><Typography.Text type="secondary">#{row.id} · thứ tự {row.sort_order}</Typography.Text></> },
        { title: 'Điểm yêu cầu', dataIndex: 'required_points', render: (value) => Number(value).toLocaleString() },
        { title: 'Item thưởng', dataIndex: 'reward_items', render: (value) => { try { const parsed = JSON.parse(value); return `${parsed.length} item`; } catch { return <Tag color="red">JSON lỗi</Tag>; } } },
        { title: 'Tiền thưởng', key: 'money', render: (_, row) => `Vàng ${Number(row.reward_gold).toLocaleString()} · Ngọc ${row.reward_gem.toLocaleString()} · Hồng ngọc ${row.reward_ruby.toLocaleString()}` },
        { title: 'Trạng thái', dataIndex: 'enabled', render: (enabled) => <Tag color={enabled ? 'green' : 'default'}>{enabled ? 'Đang bật' : 'Đã tắt'}</Tag> },
        { title: 'Thao tác', key: 'actions', render: (_, row) => <Space><Button onClick={() => openMilestone(row)}>Sửa</Button><Button danger onClick={() => remove('milestone', row.id)}>Xóa</Button></Space> },
    ];

    return <main className="min-h-screen bg-slate-50 p-6 lg:p-10">
        <div className="mx-auto max-w-7xl">
            <Space className="mb-4"><Link href="/">← Trang chủ</Link></Space>
            <div className="mb-6">
                <Typography.Title level={2} style={{ marginBottom: 4 }}>Quản lý sự kiện câu cá</Typography.Title>
                <Typography.Text type="secondary">Cấu hình xác suất, cân nặng, điểm và số mốc thưởng không giới hạn.</Typography.Text>
            </div>
            <Alert className="mb-5" type="info" showIcon message="Công thức điểm"
                description="Điểm mỗi lượt = điểm cơ bản + cân nặng (kg) × điểm/kg. Cá càng nặng và càng hiếm có thể được cấu hình cho nhiều điểm hơn." />
            <Tabs items={[
                { key: 'fish', label: `Loài cá (${fish.length})`, children: <Card extra={<Button type="primary" onClick={() => openFish()}>Thêm loài cá</Button>}>
                    <Table rowKey="item_id" loading={loadingFish} dataSource={fish} columns={fishColumns} scroll={{ x: 1000 }} pagination={false} />
                </Card> },
                { key: 'milestones', label: `Mốc thưởng (${milestones.length})`, children: <Card title={<Space>Mùa <Input value={season} maxLength={32} onChange={(event) => setSeason(event.target.value)} onPressEnter={loadMilestones} style={{ width: 150 }}/><Button onClick={loadMilestones}>Tải</Button></Space>}
                    extra={<Button type="primary" onClick={() => openMilestone()}>Thêm mốc bất kỳ</Button>}>
                    <Table rowKey="id" loading={loadingMilestones} dataSource={milestones} columns={milestoneColumns} scroll={{ x: 1100 }} pagination={false} />
                </Card> },
            ]} />
        </div>

        <Modal title={editingFishId ? 'Sửa cấu hình cá' : 'Thêm loài cá'} open={fishModal} onCancel={() => setFishModal(false)} onOk={saveFish} confirmLoading={saving} width={720} okText="Lưu" cancelText="Hủy">
            <Form layout="vertical">
                <Form.Item label="Item cá" required><Select showSearch optionFilterProp="label" options={itemOptions} value={fishForm.item_id || undefined} disabled={editingFishId !== null} onChange={(item_id) => setFishForm({ ...fishForm, item_id })}/></Form.Item>
                <div className="grid grid-cols-2 gap-x-4">
                    <Form.Item label="Trọng số xác suất" required><InputNumber min={1} className="w-full" value={fishForm.catch_weight} onChange={(value) => setFishForm({ ...fishForm, catch_weight: value ?? 1 })}/></Form.Item>
                    <Form.Item label="Thứ tự"><InputNumber min={0} className="w-full" value={fishForm.sort_order} onChange={(value) => setFishForm({ ...fishForm, sort_order: value ?? 0 })}/></Form.Item>
                    <Form.Item label="Cân nặng nhỏ nhất (g)" required><InputNumber min={1} className="w-full" value={fishForm.min_weight_grams} onChange={(value) => setFishForm({ ...fishForm, min_weight_grams: value ?? 1 })}/></Form.Item>
                    <Form.Item label="Cân nặng lớn nhất (g)" required><InputNumber min={1} className="w-full" value={fishForm.max_weight_grams} onChange={(value) => setFishForm({ ...fishForm, max_weight_grams: value ?? 1 })}/></Form.Item>
                    <Form.Item label="Điểm cơ bản"><InputNumber min={0} className="w-full" value={fishForm.base_points} onChange={(value) => setFishForm({ ...fishForm, base_points: value ?? 0 })}/></Form.Item>
                    <Form.Item label="Điểm mỗi kg"><InputNumber min={0} className="w-full" value={fishForm.points_per_kg} onChange={(value) => setFishForm({ ...fishForm, points_per_kg: value ?? 0 })}/></Form.Item>
                </div>
                <Form.Item label="Cho phép câu"><Switch checked={fishForm.enabled} onChange={(enabled) => setFishForm({ ...fishForm, enabled })}/></Form.Item>
            </Form>
        </Modal>

        <Modal title={editingMilestoneId ? 'Sửa mốc thưởng' : 'Thêm mốc thưởng'} open={milestoneModal} onCancel={() => setMilestoneModal(false)} onOk={saveMilestone} confirmLoading={saving} width={900} okText="Lưu" cancelText="Hủy">
            <Form layout="vertical">
                <div className="grid grid-cols-2 gap-x-4">
                    <Form.Item label="Mùa" required><Input value={milestoneForm.season_id} disabled={editingMilestoneId !== null} onChange={(event) => setMilestoneForm({ ...milestoneForm, season_id: event.target.value })}/></Form.Item>
                    <Form.Item label="Tên mốc" required><Input value={milestoneForm.name} onChange={(event) => setMilestoneForm({ ...milestoneForm, name: event.target.value })}/></Form.Item>
                    <Form.Item label="Điểm yêu cầu" required><InputNumber min={0} className="w-full" value={milestoneForm.required_points} onChange={(value) => setMilestoneForm({ ...milestoneForm, required_points: value ?? 0 })}/></Form.Item>
                    <Form.Item label="Thứ tự"><InputNumber min={0} className="w-full" value={milestoneForm.sort_order} onChange={(value) => setMilestoneForm({ ...milestoneForm, sort_order: value ?? 0 })}/></Form.Item>
                </div>
                <Form.Item label="Mô tả"><Input value={milestoneForm.description ?? ''} maxLength={255} onChange={(event) => setMilestoneForm({ ...milestoneForm, description: event.target.value })}/></Form.Item>
                <Card size="small" className="mb-4"><DetailItemEditor value={milestoneForm.reward_items} onChange={(reward_items) => setMilestoneForm((current) => ({ ...current, reward_items }))}/></Card>
                <div className="grid grid-cols-3 gap-x-4">
                    <Form.Item label="Vàng"><InputNumber min={0} className="w-full" value={milestoneForm.reward_gold} onChange={(value) => setMilestoneForm({ ...milestoneForm, reward_gold: value ?? 0 })}/></Form.Item>
                    <Form.Item label="Ngọc"><InputNumber min={0} className="w-full" value={milestoneForm.reward_gem} onChange={(value) => setMilestoneForm({ ...milestoneForm, reward_gem: value ?? 0 })}/></Form.Item>
                    <Form.Item label="Hồng ngọc"><InputNumber min={0} className="w-full" value={milestoneForm.reward_ruby} onChange={(value) => setMilestoneForm({ ...milestoneForm, reward_ruby: value ?? 0 })}/></Form.Item>
                </div>
                <Form.Item label="Bật mốc"><Switch checked={milestoneForm.enabled} onChange={(enabled) => setMilestoneForm({ ...milestoneForm, enabled })}/></Form.Item>
            </Form>
        </Modal>
    </main>;
}
