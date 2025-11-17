'use client';

import { useState, useEffect } from 'react';
import ItemEditorV2 from './components/ItemEditorV2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [filterShopId, setFilterShopId] = useState<string>('');

  const [formData, setFormData] = useState({
    shop_id: '',
    tab_name: '',
    tab_index: '0',
    items: '[]'
  });

  // Tải danh sách shops
  useEffect(() => {
    fetchShops();
  }, []);

  // Tải danh sách tab_shop
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
      alert('Không thể tải danh sách shop');
    }
  };

  const fetchTabShops = async () => {
    try {
      setLoading(true);
      const url = filterShopId
        ? `/api/tab-shop?shop_id=${filterShopId}`
        : '/api/tab-shop';
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setTabShops(result.data);
      }
    } catch (error) {
      console.error('Error fetching tab shops:', error);
      alert('Không thể tải danh sách tab shop');
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
        body: JSON.stringify(formData)
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
      shop_id: '',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Quản lý Tab Shop
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Quản lý các tab trong shop của game
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors shadow-md"
            >
              + Tạo Tab Mới
            </button>
          </div>

          {/* Filter */}
          <div className="flex gap-4 items-center">
            <label className="text-gray-700 dark:text-gray-300 font-medium">
              Lọc theo Shop:
            </label>
            <select
              value={filterShopId}
              onChange={(e) => setFilterShopId(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id}>
                  Shop #{shop.id} - {shop.npc_template.NAME} ({shop.tag_name || 'N/A'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
            </div>
          ) : tabShops.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              Không có dữ liệu
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Shop
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tên Tab
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Vị trí
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tabShops.map((tabShop) => (
                    <tr key={tabShop.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {tabShop.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        <div>
                          <div className="font-medium">Shop #{tabShop.shop_id}</div>
                          <div className="text-xs text-gray-500">{tabShop.shop.npc_template.NAME}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                        {tabShop.tab_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {tabShop.tab_index}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="max-w-xs truncate">
                          {tabShop.items.substring(0, 50)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEdit(tabShop)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-semibold"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(tabShop.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-semibold"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {editingId ? 'Sửa Tab Shop' : 'Tạo Tab Shop Mới'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Shop <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.shop_id}
                    onChange={(e) => setFormData({ ...formData, shop_id: e.target.value })}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Chọn shop...</option>
                    {shops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        Shop #{shop.id} - {shop.npc_template.NAME} ({shop.tag_name || 'N/A'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tên Tab <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.tab_name}
                    onChange={(e) => setFormData({ ...formData, tab_name: e.target.value })}
                    maxLength={50}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên tab..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vị trí (Tab Index) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.tab_index}
                    onChange={(e) => setFormData({ ...formData, tab_index: e.target.value })}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label>
                    Items <span className="text-red-500">*</span>
                  </Label>
                  <ItemEditorV2
                    value={formData.items}
                    onChange={(value: string) => setFormData({ ...formData, items: value })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    {editingId ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
