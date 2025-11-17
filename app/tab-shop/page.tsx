'use client';

import { useState, useEffect } from 'react';
import ItemEditorV2 from './components/ItemEditorV2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Shop {
    id: number;
    npc_template: {
        NAME: string;
    };
    tag_name: string | null;
}

interface TabShop {
    id: number;
    shop_id: number;
    tab_name: string;
    tab_index: number;
    items: string;
    shop: Shop;
}

export default function TabShopManagement() {
    const [tabShops, setTabShops] = useState<TabShop[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [filterShopId, setFilterShopId] = useState<string | undefined>('all');

    const [formData, setFormData] = useState({
        shop_id: undefined as string | undefined,
        tab_name: '',
        tab_index: '0',
        items: '[]'
    });

    useEffect(() => {
        fetchShops();
    }, []);

    useEffect(() => {
        fetchTabShops();
    }, [filterShopId]);

    const fetchShops = async () => {
        try {
            const response = await fetch('/api/shops');
            const result = await response.json();
            if (result.success) {
                setShops(result.data);
            }
        } catch (error) {
            console.error('Error fetching shops:', error);
        }
    };

    const fetchTabShops = async () => {
        try {
            setLoading(true);
            const url = filterShopId && filterShopId !== 'all'
                ? `/api/tab-shop?shop_id=${filterShopId}`
                : '/api/tab-shop';
            const response = await fetch(url);
            const result = await response.json();
            if (result.success) {
                setTabShops(result.data);
            }
        } catch (error) {
            console.error('Error fetching tab shops:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingId ? `/api/tab-shop/${editingId}` : '/api/tab-shop';
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    shop_id: formData.shop_id || ''
                })
            });

            const result = await response.json();

            if (result.success) {
                alert(editingId ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
                setIsModalOpen(false);
                resetForm();
                fetchTabShops();
            } else {
                alert(result.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error saving tab shop:', error);
            alert('Không thể lưu tab shop');
        }
    };

    const handleEdit = (tabShop: TabShop) => {
        setEditingId(tabShop.id);
        setFormData({
            shop_id: tabShop.shop_id.toString(),
            tab_name: tabShop.tab_name,
            tab_index: tabShop.tab_index.toString(),
            items: tabShop.items
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa tab shop này?')) return;

        try {
            const response = await fetch(`/api/tab-shop/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                alert('Xóa thành công!');
                fetchTabShops();
            } else {
                alert(result.error || 'Không thể xóa tab shop');
            }
        } catch (error) {
            console.error('Error deleting tab shop:', error);
            alert('Không thể xóa tab shop');
        }
    };

    const resetForm = () => {
        setFormData({
            shop_id: undefined,
            tab_name: '',
            tab_index: '0',
            items: '[]'
        });
        setEditingId(null);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-3xl">Quản lý Tab Shop</CardTitle>
                                <CardDescription>Quản lý các tab trong shop của game</CardDescription>
                            </div>
                            <Button onClick={openCreateModal}>
                                <Plus className="w-4 h-4 mr-2" />
                                Tạo Tab Mới
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 items-center">
                            <Label className="whitespace-nowrap">Lọc theo Shop:</Label>
                            <Select value={filterShopId} onValueChange={setFilterShopId}>
                                <SelectTrigger className="w-[300px]">
                                    <SelectValue placeholder="Tất cả" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    {shops.map((shop) => (
                                        <SelectItem key={shop.id} value={shop.id.toString()}>
                                            Shop #{shop.id} - {shop.npc_template.NAME} ({shop.tag_name || 'N/A'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Table Card */}
                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                <p className="mt-4 text-muted-foreground">Đang tải...</p>
                            </div>
                        ) : tabShops.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                Không có dữ liệu
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Shop</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Tên Tab</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Vị trí</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Items</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {tabShops.map((tabShop) => (
                                            <tr key={tabShop.id} className="hover:bg-muted/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {tabShop.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <div>
                                                        <div className="font-medium">Shop #{tabShop.shop_id}</div>
                                                        <div className="text-xs text-muted-foreground">{tabShop.shop.npc_template.NAME}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    {tabShop.tab_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {tabShop.tab_index}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    <div className="max-w-xs truncate">
                                                        {tabShop.items.substring(0, 50)}...
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEdit(tabShop)}
                                                    >
                                                        <Pencil className="w-4 h-4 mr-1" />
                                                        Sửa
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(tabShop.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1 text-red-500" />
                                                        Xóa
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingId ? 'Sửa Tab Shop' : 'Tạo Tab Shop Mới'}
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>
                                Shop <span className="text-red-500">*</span>
                            </Label>
                            <Select
                                value={formData.shop_id}
                                onValueChange={(value) => setFormData({ ...formData, shop_id: value })}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn shop..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="placeholder" disabled>
                                        Chọn shop...
                                    </SelectItem>
                                    {shops.map((shop) => (
                                        <SelectItem key={shop.id} value={shop.id.toString()}>
                                            Shop #{shop.id} - {shop.npc_template.NAME} ({shop.tag_name || 'N/A'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>
                                Tên Tab <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={formData.tab_name}
                                onChange={(e) => setFormData({ ...formData, tab_name: e.target.value })}
                                maxLength={50}
                                required
                                placeholder="Nhập tên tab..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>
                                Vị trí (Tab Index) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                type="number"
                                value={formData.tab_index}
                                onChange={(e) => setFormData({ ...formData, tab_index: e.target.value })}
                                required
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <ItemEditorV2
                                value={formData.items}
                                onChange={(value: string) => setFormData({ ...formData, items: value })}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                Hủy
                            </Button>
                            <Button type="submit">
                                {editingId ? 'Cập nhật' : 'Tạo mới'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
