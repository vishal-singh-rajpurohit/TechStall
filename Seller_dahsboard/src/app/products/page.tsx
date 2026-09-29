'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  Download,
  Boxes,
  PlusCircle,
  MinusCircle,
  ExternalLink,
} from 'lucide-react';
import { useSeller } from '@/context/SellerContext';
import { SellerProduct, HardwareCategory } from '@/types/seller';
import { ProductModal } from '@/components/products/ProductModal';

export default function ProductsManagementPage() {
  const { products, addProduct, updateProduct, deleteProduct, restockProduct } = useSeller();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [productToDelete, setProductToDelete] = useState<SellerProduct | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0;
    } else if (stockFilter === 'out') {
      matchesStock = p.stockQuantity === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: SellerProduct) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (productData: any) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['SKU,Title,Brand,Category,Price,Cost,Stock'].join(',') +
      '\n' +
      products
        .map(
          (p) =>
            `"${p.sku}","${p.title.replace(/"/g, '""')}","${p.brand}","${p.category}",${p.price},${p.costPrice},${p.stockQuantity}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `techstall_hardware_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Hardware Products &amp; Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your store&apos;s computer accessories, technical specifications, and active pricing.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Inventory CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Hardware</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, SKU, brand..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 w-full md:w-auto">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              All Hardware ({products.length})
            </button>
            <button
              onClick={() => setSelectedCategory('monitors')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === 'monitors' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Monitors
            </button>
            <button
              onClick={() => setSelectedCategory('laptops')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === 'laptops' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Laptops
            </button>
            <button
              onClick={() => setSelectedCategory('ssds')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === 'ssds' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              SSDs (SST)
            </button>
            <button
              onClick={() => setSelectedCategory('accessories')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedCategory === 'accessories' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Accessories
            </button>
          </div>

          {/* Stock Filter Pills */}
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
              className={`px-3 py-1.5 rounded-xl font-bold border transition-colors flex items-center space-x-1.5 ${
                stockFilter === 'low'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Low Stock</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/70">
                <th className="py-3.5 px-4">Hardware Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Cost / Margin</th>
                <th className="py-3.5 px-4">Warehouse Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No hardware products found matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0;
                  const isOut = p.stockQuantity === 0;
                  const marginPercent = Math.round(((p.price - p.costPrice) / p.price) * 100);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Thumbnail & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60">
                            <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <h4 className="font-bold text-slate-900 truncate leading-snug">
                              {p.title}
                            </h4>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span>SKU: {p.sku} • {p.brand}</span>
                              {((p.videos && p.videos.length > 0) || (p.media && p.media.some(m => m.media_type === 'video'))) && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] bg-purple-50 text-purple-700 font-sans font-semibold rounded border border-purple-200">
                                  🎬 Video
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-700 uppercase text-[10px] bg-slate-100 px-2 py-0.5 rounded-md">
                          {p.categoryLabel}
                        </span>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">
                          ₹{p.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <div className="text-[10px] text-slate-400 line-through">
                            ₹{p.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </td>

                      {/* Cost / Margin */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-600">₹{p.costPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        <div className="text-[10px] text-emerald-600 font-bold">
                          {marginPercent}% margin
                        </div>
                      </td>

                      {/* Warehouse Stock Controls */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => restockProduct(p.id, -1)}
                            disabled={p.stockQuantity <= 0}
                            className="text-slate-400 hover:text-slate-700 disabled:opacity-30"
                            title="Decrease 1"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                          <span className="font-black text-slate-900 w-8 text-center">
                            {p.stockQuantity}
                          </span>
                          <button
                            onClick={() => restockProduct(p.id, 1)}
                            className="text-slate-400 hover:text-slate-700"
                            title="Increase 1"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        </div>
                        {isLow ? (
                          <span className="text-[10px] font-bold text-amber-600 flex items-center space-x-1 mt-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Low ({p.lowStockThreshold} min)</span>
                          </span>
                        ) : isOut ? (
                          <span className="text-[10px] font-bold text-red-600 block mt-0.5">
                            Out of stock
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 block mt-0.5">Healthy</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        editingProduct={editingProduct}
      />

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-900">Delete Hardware SKU?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete <strong>{productToDelete.title}</strong>? This action will remove it from the catalog.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
