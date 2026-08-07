'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Modal, Select, Space, Switch, Table, Tabs, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface ItemTemplate { id: number; NAME: string; }
interface RodConfig {
    rod_item_id: number; item_name: string; cast_time_ms: number; wait_min_ms: number; wait_max_ms: number;
    pull_time_ms: number; success_rate_bps: number; durability_loss_success: number;
    durability_loss_fail: number; enabled: boolean; sort_order: number;
}
interface BaitConfig { bait_item_id: number; item_name: string; success_bonus_bps: number; priority: number; enabled: boolean; }
interface Recipe { id: number; name: string; result_item_id: number; result_name: string; result_quantity: number; ingredients: string; enabled: boolean; sort_order: number; }
type Kind = 'rod' | 'bait' | 'recipe';
type FormValues = Record<string, string | number | boolean | undefined>;

async function request(url: string, init?: RequestInit) {
    const response = await fetch(url, init);
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || 'Yêu cầu thất bại');
    return data;
}

export default function GearManagement() {
    const [rods, setRods] = useState<RodConfig[]>([]);
    const [baits, setBaits] = useState<BaitConfig[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [items, setItems] = useState<ItemTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(false);
    const [kind, setKind] = useState<Kind>('rod');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm<FormValues>();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await request('/api/fishing-event/gear');
            setRods(data.rods); setBaits(data.baits); setRecipes(data.recipes);
        } catch (error) { message.error((error as Error).message); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        load();
        fetch('/api/item-template').then((response) => response.json()).then((data) => {
            if (data.success) setItems(data.data);
        }).catch(() => message.error('Không thể tải item'));
    }, [load]);

    const itemOptions = useMemo(() => items.map((item) => ({ value: item.id, label: `#${item.id} - ${item.NAME}` })), [items]);

    const open = (targetKind: Kind, row?: RodConfig | BaitConfig | Recipe) => {
        setKind(targetKind);
        const id = targetKind === 'rod' ? (row as RodConfig | undefined)?.rod_item_id
            : targetKind === 'bait' ? (row as BaitConfig | undefined)?.bait_item_id
            : (row as Recipe | undefined)?.id;
        setEditingId(id ?? null);
        if (targetKind === 'rod') {
            const rod = row as RodConfig | undefined;
            form.setFieldsValue(rod ? { ...rod, success_rate_percent: rod.success_rate_bps / 100 } : {
                rod_item_id: undefined, cast_time_ms: 1000, wait_min_ms: 5000, wait_max_ms: 10000,
                pull_time_ms: 1500, success_rate_percent: 80, durability_loss_success: 15,
                durability_loss_fail: 30, enabled: true, sort_order: 0,
            });
        } else if (targetKind === 'bait') {
            const bait = row as BaitConfig | undefined;
            form.setFieldsValue(bait ? { ...bait, success_bonus_percent: bait.success_bonus_bps / 100 } : {
                bait_item_id: undefined, success_bonus_percent: 5, priority: 0, enabled: true,
            });
        } else {
            form.setFieldsValue(row ? { ...(row as Recipe) } : {
                name: '', result_item_id: undefined, result_quantity: 1,
                ingredients: '[{"item_id":2000,"quantity":10}]', enabled: true, sort_order: 0,
            });
        }
        setModal(true);
    };

    const save = async () => {
        try {
            const values = await form.validateFields();
            const body: FormValues & { kind: Kind; success_rate_bps?: number; success_bonus_bps?: number } = { ...values, kind };
            if (kind === 'rod') body.success_rate_bps = Math.round(Number(values.success_rate_percent) * 100);
            if (kind === 'bait') body.success_bonus_bps = Math.round(Number(values.success_bonus_percent) * 100);
            const url = editingId ? `/api/fishing-event/gear/${kind}/${editingId}` : '/api/fishing-event/gear';
            await request(url, { method: editingId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            message.success('Đã lưu. Game server nhận thay đổi trong tối đa 30 giây.');
            setModal(false); await load();
        } catch (error) {
            if (error instanceof Error) message.error(error.message);
        }
    };

    const remove = (targetKind: Kind, id: number) => Modal.confirm({
        title: 'Xóa cấu hình?', okText: 'Xóa', cancelText: 'Hủy', okButtonProps: { danger: true },
        onOk: async () => {
            try { await request(`/api/fishing-event/gear/${targetKind}/${id}`, { method: 'DELETE' }); await load(); }
            catch (error) { message.error((error as Error).message); }
        },
    });

    const rodColumns: ColumnsType<RodConfig> = [
        { title: 'Cần', render: (_, row) => <b>{row.item_name} (#{row.rod_item_id})</b> },
        { title: 'Chu kỳ câu', render: (_, row) => `Thả ${(row.cast_time_ms / 1000).toFixed(1)}s · chờ ${(row.wait_min_ms / 1000).toFixed(1)}-${(row.wait_max_ms / 1000).toFixed(1)}s · kéo ${(row.pull_time_ms / 1000).toFixed(1)}s` },
        { title: 'Tỷ lệ gốc', dataIndex: 'success_rate_bps', render: (value) => `${(value / 100).toFixed(1)}%` },
        { title: 'Mất độ bền', render: (_, row) => `Trúng ${row.durability_loss_success} · hụt ${row.durability_loss_fail}` },
        { title: 'Bật', dataIndex: 'enabled', render: (value) => <Tag color={value ? 'green' : 'default'}>{value ? 'Bật' : 'Tắt'}</Tag> },
        { title: 'Thao tác', render: (_, row) => <Space><Button onClick={() => open('rod', row)}>Sửa</Button><Button danger onClick={() => remove('rod', row.rod_item_id)}>Xóa</Button></Space> },
    ];
    const baitColumns: ColumnsType<BaitConfig> = [
        { title: 'Mồi', render: (_, row) => <b>{row.item_name} (#{row.bait_item_id})</b> },
        { title: 'Cộng tỷ lệ kéo', dataIndex: 'success_bonus_bps', render: (value) => `+${(value / 100).toFixed(1)}%` },
        { title: 'Ưu tiên tự dùng', dataIndex: 'priority' },
        { title: 'Bật', dataIndex: 'enabled', render: (value) => <Tag color={value ? 'green' : 'default'}>{value ? 'Bật' : 'Tắt'}</Tag> },
        { title: 'Thao tác', render: (_, row) => <Space><Button onClick={() => open('bait', row)}>Sửa</Button><Button danger onClick={() => remove('bait', row.bait_item_id)}>Xóa</Button></Space> },
    ];
    const recipeColumns: ColumnsType<Recipe> = [
        { title: 'Công thức', dataIndex: 'name' },
        { title: 'Kết quả', render: (_, row) => `${row.result_quantity} ${row.result_name}` },
        { title: 'Nguyên liệu JSON', dataIndex: 'ingredients', ellipsis: true },
        { title: 'Bật', dataIndex: 'enabled', render: (value) => <Tag color={value ? 'green' : 'default'}>{value ? 'Bật' : 'Tắt'}</Tag> },
        { title: 'Thao tác', render: (_, row) => <Space><Button onClick={() => open('recipe', row)}>Sửa</Button><Button danger onClick={() => remove('recipe', row.id)}>Xóa</Button></Space> },
    ];

    return <>
        <Tabs items={[
            { key: 'rods', label: `Cần câu (${rods.length})`, children: <Card extra={<Button type="primary" onClick={() => open('rod')}>Thêm cần</Button>}><Table rowKey="rod_item_id" loading={loading} dataSource={rods} columns={rodColumns} pagination={false} scroll={{ x: 1000 }}/></Card> },
            { key: 'baits', label: `Mồi (${baits.length})`, children: <Card extra={<Button type="primary" onClick={() => open('bait')}>Thêm mồi</Button>}><Table rowKey="bait_item_id" loading={loading} dataSource={baits} columns={baitColumns} pagination={false}/></Card> },
            { key: 'recipes', label: `Chế tạo (${recipes.length})`, children: <Card extra={<Button type="primary" onClick={() => open('recipe')}>Thêm công thức</Button>}><Table rowKey="id" loading={loading} dataSource={recipes} columns={recipeColumns} pagination={false} scroll={{ x: 900 }}/></Card> },
        ]}/>
        <Modal title={`${editingId ? 'Sửa' : 'Thêm'} ${kind === 'rod' ? 'cần câu' : kind === 'bait' ? 'mồi' : 'công thức'}`} open={modal} onCancel={() => setModal(false)} onOk={save} width={760} okText="Lưu" cancelText="Hủy">
            <Form form={form} layout="vertical">
                {kind === 'rod' && <div className="grid grid-cols-2 gap-x-4">
                    <Form.Item name="rod_item_id" label="Item cần" rules={[{ required: true }]}><Select showSearch optionFilterProp="label" options={itemOptions} disabled={editingId !== null}/></Form.Item>
                    <Form.Item name="success_rate_percent" label="Tỷ lệ kéo gốc (%)" rules={[{ required: true }]}><InputNumber min={0} max={100} className="w-full"/></Form.Item>
                    <Form.Item name="cast_time_ms" label="Thời gian thả (ms)"><InputNumber min={200} className="w-full"/></Form.Item>
                    <Form.Item name="pull_time_ms" label="Thời gian kéo (ms)"><InputNumber min={300} className="w-full"/></Form.Item>
                    <Form.Item name="wait_min_ms" label="Chờ cá tối thiểu (ms)"><InputNumber min={1000} className="w-full"/></Form.Item>
                    <Form.Item name="wait_max_ms" label="Chờ cá tối đa (ms)"><InputNumber min={1000} className="w-full"/></Form.Item>
                    <Form.Item name="durability_loss_success" label="Mất bền khi trúng"><InputNumber min={1} className="w-full"/></Form.Item>
                    <Form.Item name="durability_loss_fail" label="Mất bền khi hụt"><InputNumber min={1} className="w-full"/></Form.Item>
                    <Form.Item name="sort_order" label="Thứ tự"><InputNumber min={0} className="w-full"/></Form.Item>
                    <Form.Item name="enabled" label="Bật" valuePropName="checked"><Switch/></Form.Item>
                </div>}
                {kind === 'bait' && <div className="grid grid-cols-2 gap-x-4">
                    <Form.Item name="bait_item_id" label="Item mồi" rules={[{ required: true }]}><Select showSearch optionFilterProp="label" options={itemOptions} disabled={editingId !== null}/></Form.Item>
                    <Form.Item name="success_bonus_percent" label="Cộng tỷ lệ kéo (%)"><InputNumber min={0} max={100} className="w-full"/></Form.Item>
                    <Form.Item name="priority" label="Ưu tiên (cao dùng trước)"><InputNumber min={0} className="w-full"/></Form.Item>
                    <Form.Item name="enabled" label="Bật" valuePropName="checked"><Switch/></Form.Item>
                </div>}
                {kind === 'recipe' && <>
                    <div className="grid grid-cols-2 gap-x-4">
                        <Form.Item name="name" label="Tên công thức" rules={[{ required: true }]}><Input/></Form.Item>
                        <Form.Item name="result_item_id" label="Item kết quả" rules={[{ required: true }]}><Select showSearch optionFilterProp="label" options={itemOptions}/></Form.Item>
                        <Form.Item name="result_quantity" label="Số lượng kết quả"><InputNumber min={1} className="w-full"/></Form.Item>
                        <Form.Item name="sort_order" label="Thứ tự"><InputNumber min={0} className="w-full"/></Form.Item>
                    </div>
                    <Form.Item name="ingredients" label='Nguyên liệu JSON: [{"item_id":2000,"quantity":10}]' rules={[{ required: true }]}><Input.TextArea rows={5}/></Form.Item>
                    <Form.Item name="enabled" label="Bật" valuePropName="checked"><Switch/></Form.Item>
                </>}
            </Form>
        </Modal>
    </>;
}
