'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  Sparkles,
  Film,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Star,
  AlertCircle,
  Loader2,
  FileVideo,
} from 'lucide-react';
import { SellerProduct, HardwareCategory, ProductMediaItem } from '@/types/seller';
import { sellerProductAPI } from '@/lib/api';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<SellerProduct, 'id' | 'createdAt' | 'salesCount'>) => void;
  editingProduct?: SellerProduct | null;
}

interface MediaEntry extends ProductMediaItem {
  localFileName?: string;
  localFileSize?: string;
  uploading?: boolean;
}

export function ProductModal({
  isOpen,
  onClose,
  onSave,
  editingProduct,
}: ProductModalProps) {
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('ASUS ROG');
  const [category, setCategory] = useState<HardwareCategory>('monitors');
  const [price, setPrice] = useState(74999);
  const [costPrice, setCostPrice] = useState(52000);
  const [originalPrice, setOriginalPrice] = useState(89999);
  const [stockQuantity, setStockQuantity] = useState(20);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Resolution', value: '3840 x 2160' },
    { key: 'Refresh Rate', value: '144 Hz' },
  ]);

  // Media entries management
  const [mediaList, setMediaList] = useState<MediaEntry[]>([]);
  const [mediaTab, setMediaTab] = useState<'local' | 'url'>('local');
  const [inputUrl, setInputUrl] = useState('');
  const [inputUrlType, setInputUrlType] = useState<'image' | 'video'>('image');
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingProduct) {
      setTitle(editingProduct.title);
      setSku(editingProduct.sku);
      setBrand(editingProduct.brand);
      setCategory(editingProduct.category);
      setPrice(editingProduct.price);
      setCostPrice(editingProduct.costPrice);
      setOriginalPrice(editingProduct.originalPrice || editingProduct.price * 1.2);
      setStockQuantity(editingProduct.stockQuantity);
      setLowStockThreshold(editingProduct.lowStockThreshold);
      setDescription(editingProduct.description);
      setSpecs(
        Object.entries(editingProduct.specifications).map(([key, value]) => ({
          key,
          value,
        }))
      );

      // Reconstruct media list from editing product
      const entries: MediaEntry[] = [];
      if (editingProduct.media && editingProduct.media.length > 0) {
        editingProduct.media.forEach((m) => {
          entries.push({
            media_type: m.media_type,
            url: m.url,
            public_id: m.public_id,
            thumbnail_url: m.thumbnail_url,
            is_primary: m.is_primary || false,
            order: m.order || entries.length,
          });
        });
      } else {
        // Fallback to images and videos
        if (editingProduct.images) {
          editingProduct.images.forEach((img, idx) => {
            entries.push({
              media_type: 'image',
              url: img,
              is_primary: idx === 0,
              order: idx,
            });
          });
        }
        if (editingProduct.videos) {
          editingProduct.videos.forEach((vid, idx) => {
            entries.push({
              media_type: 'video',
              url: vid,
              is_primary: false,
              order: entries.length + idx,
            });
          });
        }
      }
      setMediaList(entries);
    } else {
      // Defaults for new product
      setTitle('');
      setSku(`SKU-${Math.floor(10000 + Math.random() * 90000)}`);
      setBrand('ASUS ROG');
      setCategory('monitors');
      setPrice(79999.0);
      setCostPrice(55000.0);
      setOriginalPrice(94999.0);
      setStockQuantity(25);
      setLowStockThreshold(5);
      setDescription('Premium high-performance computer hardware built for high throughput and durability.');
      setSpecs([
        { key: 'Warranty', value: '3 Years Limited' },
        { key: 'Form Factor', value: 'Standard Enterprise' },
      ]);
      setMediaList([
        {
          media_type: 'image',
          url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800',
          is_primary: true,
          order: 0,
        },
      ]);
    }
    setUploadError('');
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleAddSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecs(specs.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (idx: number, field: 'key' | 'value', text: string) => {
    const updated = [...specs];
    updated[idx][field] = text;
    setSpecs(updated);
  };

  // Helper: format bytes into readable KB/MB
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // Handle local image file upload from user device
  const handleLocalImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError('');
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isFirst = mediaList.length === 0 && i === 0;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        const newEntry: MediaEntry = {
          media_type: 'image',
          url: dataUrl,
          is_primary: isFirst,
          order: mediaList.length + i,
          localFileName: file.name,
          localFileSize: formatFileSize(file.size),
          uploading: true,
        };

        setMediaList((prev) => [...prev, newEntry]);

        // Attempt background upload to Cloudinary/Backend
        try {
          const uploadRes = await sellerProductAPI.uploadMedia({
            url: dataUrl,
            media_type: 'image',
            is_primary: isFirst,
            order: newEntry.order,
          });

          if (uploadRes && uploadRes.url) {
            setMediaList((prev) =>
              prev.map((item) =>
                item.localFileName === file.name
                  ? {
                    ...item,
                    url: uploadRes.url,
                    public_id: uploadRes.public_id,
                    uploading: false,
                  }
                  : item
              )
            );
          }
        } catch (err) {
          // Cloudinary upload failed or backend not reachable; keep local dataUrl for visual preview
          setMediaList((prev) =>
            prev.map((item) =>
              item.localFileName === file.name ? { ...item, uploading: false } : item
            )
          );
        }
      };

      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle local video/media file upload from user device
  const handleLocalVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError('');
    const file = files[0];

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const newEntry: MediaEntry = {
        media_type: 'video',
        url: dataUrl,
        is_primary: false,
        order: mediaList.length,
        localFileName: file.name,
        localFileSize: formatFileSize(file.size),
        uploading: true,
      };

      setMediaList((prev) => [...prev, newEntry]);

      // Attempt background upload to Cloudinary/Backend
      try {
        const uploadRes = await sellerProductAPI.uploadMedia({
          url: dataUrl,
          media_type: 'video',
          is_primary: false,
          order: newEntry.order,
        });

        if (uploadRes && uploadRes.url) {
          setMediaList((prev) =>
            prev.map((item) =>
              item.localFileName === file.name
                ? {
                  ...item,
                  url: uploadRes.url,
                  public_id: uploadRes.public_id,
                  thumbnail_url: uploadRes.thumbnail_url,
                  uploading: false,
                }
                : item
            )
          );
        }
      } catch (err) {
        setMediaList((prev) =>
          prev.map((item) =>
            item.localFileName === file.name ? { ...item, uploading: false } : item
          )
        );
      }
    };

    reader.readAsDataURL(file);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  // Add media item from Web URL
  const handleAddMediaFromUrl = () => {
    const trimmed = inputUrl.trim();
    if (!trimmed) {
      setUploadError('Please enter a valid media URL.');
      return;
    }

    // Auto-detect type if not explicitly set
    let type = inputUrlType;
    const lower = trimmed.toLowerCase();
    if (
      lower.endsWith('.mp4') ||
      lower.endsWith('.webm') ||
      lower.endsWith('.mov') ||
      lower.includes('video')
    ) {
      type = 'video';
    }

    const isFirstImage = type === 'image' && !mediaList.some((m) => m.media_type === 'image');

    const newEntry: MediaEntry = {
      media_type: type,
      url: trimmed,
      is_primary: isFirstImage,
      order: mediaList.length,
    };

    setMediaList([...mediaList, newEntry]);
    setInputUrl('');
    setUploadError('');
  };

  const handleRemoveMedia = (index: number) => {
    const updated = mediaList.filter((_, i) => i !== index);
    // If we removed the primary image, ensure another image becomes primary
    if (updated.length > 0 && !updated.some((m) => m.is_primary && m.media_type === 'image')) {
      const firstImage = updated.find((m) => m.media_type === 'image');
      if (firstImage) firstImage.is_primary = true;
    }
    setMediaList(updated);
  };

  const handleSetPrimary = (index: number) => {
    const updated = mediaList.map((m, i) => ({
      ...m,
      is_primary: i === index && m.media_type === 'image',
    }));
    setMediaList(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const specificationsObj: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specificationsObj[s.key.trim()] = s.value.trim();
      }
    });

    const categoryLabels: Record<HardwareCategory, string> = {
      monitors: 'MONITOR',
      laptops: 'LAPTOP',
      ssds: 'SSD & STORAGE',
      accessories: 'ACCESSORY',
    };

    // Extract images and videos from mediaList
    const images: string[] = [];
    const videos: string[] = [];

    // Prioritize primary image first
    const primaryEntry = mediaList.find((m) => m.is_primary && m.media_type === 'image');
    if (primaryEntry) {
      images.push(primaryEntry.url);
    }

    mediaList.forEach((m) => {
      if (m.media_type === 'image') {
        if (!images.includes(m.url)) images.push(m.url);
      } else if (m.media_type === 'video') {
        if (!videos.includes(m.url)) videos.push(m.url);
      }
    });

    // Fallback if no images were added
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800');
    }

    const payloadMedia: ProductMediaItem[] = mediaList.map((m, idx) => ({
      media_type: m.media_type,
      url: m.url,
      public_id: m.public_id,
      thumbnail_url: m.thumbnail_url,
      is_primary: m.is_primary || false,
      order: idx,
    }));

    onSave({
      sku: sku.trim() || `SKU-${Date.now()}`,
      title: title.trim(),
      brand,
      category,
      categoryLabel: categoryLabels[category],
      price: Number(price),
      costPrice: Number(costPrice),
      originalPrice: Number(originalPrice),
      stockQuantity: Number(stockQuantity),
      lowStockThreshold: Number(lowStockThreshold),
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewsCount: editingProduct ? editingProduct.reviewsCount : 0,
      images,
      videos,
      media: payloadMedia,
      description: description.trim(),
      specifications: specificationsObj,
      status: 'active',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl max-h-[92vh] flex flex-col border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {editingProduct ? 'Edit Hardware SKU & Media' : 'Add New Hardware Product (New Project)'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter hardware specifications, pricing, and upload pictures or video media from your local system or via web URL.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Title & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">Product Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. ROG Swift OLED 32-inch 4K UHD 240Hz Display"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">SKU Identifier</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-slate-600 font-bold"
              />
            </div>
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Hardware Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HardwareCategory)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer font-semibold"
              >
                <option value="monitors">Monitors & Displays</option>
                <option value="laptops">Laptops & Workstations</option>
                <option value="ssds">SSDs & Storage (SST)</option>
                <option value="accessories">Computer Accessories</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Manufacturer / Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer font-semibold"
              >
                <option value="ASUS ROG">ASUS ROG</option>
                <option value="Dell">Dell</option>
                <option value="Lenovo">Lenovo</option>
                <option value="Apple">Apple</option>
                <option value="Samsung">Samsung</option>
                <option value="Crucial">Crucial</option>
                <option value="Corsair">Corsair</option>
                <option value="Kingston">Kingston</option>
                <option value="HP">HP</option>
              </select>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Selling Price (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Cost Price (₹)</label>
              <input
                type="number"
                step="0.01"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">MSRP / Original (₹)</label>
              <input
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-500"
              />
            </div>
          </div>

          {/* Stock & Low Stock Threshold */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Warehouse Stock Units</label>
              <input
                type="number"
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Low-Stock Alert Level</label>
              <input
                type="number"
                required
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* ---------------- MEDIA UPLOAD & URL SECTION ---------------- */}
          <div className="space-y-4 p-5 bg-slate-50/80 border border-slate-200/90 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-extrabold text-slate-900 uppercase tracking-wide text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  Product Picture &amp; Media Management
                </span>
                <p className="text-[11px] text-slate-500">
                  Upload pictures and video demonstrations from your local device or provide direct web URLs.
                </p>
              </div>

              {/* Source Mode Switcher */}
              <div className="flex bg-slate-200/80 p-0.5 rounded-xl font-bold text-[11px] shrink-0">
                <button
                  type="button"
                  onClick={() => setMediaTab('local')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${mediaTab === 'local'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Local System Upload</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaTab('url')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${mediaTab === 'url'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>Enter Web URL</span>
                </button>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* TAB 1: LOCAL SYSTEM FILE UPLOAD */}
            {mediaTab === 'local' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Upload Image from Local System */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-4 bg-white border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center text-center group hover:bg-brand-50/30"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    multiple
                    onChange={handleLocalImageSelect}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-brand-50 group-hover:bg-brand-100 text-brand-600 flex items-center justify-center mb-2 transition-colors">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-800 text-xs">
                    Upload Picture from Local System
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Click to select JPG, PNG, WEBP, or SVG
                  </span>
                </div>

                {/* Upload Video from Local System */}
                <div
                  onClick={() => videoInputRef.current?.click()}
                  className="p-4 bg-white border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center text-center group hover:bg-purple-50/30"
                >
                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/*"
                    onChange={handleLocalVideoSelect}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-purple-50 group-hover:bg-purple-100 text-purple-600 flex items-center justify-center mb-2 transition-colors">
                    <FileVideo className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-800 text-xs">
                    Upload Video / Demo from Local System
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Click to select MP4, WebM, MOV, or MKV
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: ENTER WEB URL */}
            {mediaTab === 'url' && (
              <div className="space-y-3 pt-1">
                <div className="flex gap-2">
                  <select
                    value={inputUrlType}
                    onChange={(e) => setInputUrlType(e.target.value as any)}
                    className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="image">Picture (Image)</option>
                    <option value="video">Media (Video)</option>
                  </select>

                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder={
                      inputUrlType === 'image'
                        ? 'https://images.unsplash.com/... or Cloudinary image URL'
                        : 'https://res.cloudinary.com/.../demo.mp4 or direct video URL'
                    }
                    className="flex-1 px-3.5 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-xs"
                  />

                  <button
                    type="button"
                    onClick={handleAddMediaFromUrl}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add URL</span>
                  </button>
                </div>
              </div>
            )}

            {/* ATTACHED MEDIA GALLERY & PREVIEW LIST */}
            {mediaList.length > 0 && (
              <div className="pt-2 border-t border-slate-200/80">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-bold text-slate-700 uppercase text-[11px]">
                    Attached Media Gallery ({mediaList.length} items)
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Click star to set primary hero image
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mediaList.map((m, idx) => {
                    const isVideo = m.media_type === 'video';
                    return (
                      <div
                        key={idx}
                        className={`relative rounded-xl overflow-hidden border p-2 bg-white transition-all flex flex-col justify-between ${m.is_primary ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200'
                          }`}
                      >
                        {/* Media Visual Preview */}
                        <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-100 mb-2 flex items-center justify-center">
                          {isVideo ? (
                            <video
                              src={m.url}
                              className="w-full h-full object-cover"
                              controls={false}
                              muted
                              playsInline
                            />
                          ) : (
                            <img
                              src={m.url}
                              alt="Product Preview"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as any).src =
                                  'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400';
                              }}
                            />
                          )}

                          {/* Media Type Badge */}
                          <div className="absolute top-1 left-1 flex items-center gap-1">
                            {isVideo ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-600 text-white flex items-center gap-0.5 shadow-sm">
                                <Film className="w-2.5 h-2.5" />
                                Video
                              </span>
                            ) : m.is_primary ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-brand-600 text-white flex items-center gap-0.5 shadow-sm">
                                <Star className="w-2.5 h-2.5 fill-white" />
                                Primary
                              </span>
                            ) : null}
                          </div>

                          {/* Uploading Spinner */}
                          {m.uploading && (
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center text-white text-[10px] font-bold gap-1">
                              <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
                              <span>Uploading</span>
                            </div>
                          )}
                        </div>

                        {/* File Details & Actions */}
                        <div className="flex items-center justify-between text-[10px]">
                          <div className="truncate mr-1">
                            <div className="font-bold text-slate-800 truncate max-w-[110px]">
                              {m.localFileName || (isVideo ? 'Video Asset' : 'Image Asset')}
                            </div>
                            {m.localFileSize && (
                              <span className="text-slate-400">{m.localFileSize}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {!isVideo && !m.is_primary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimary(idx)}
                                title="Set as primary hero image"
                                className="p-1 hover:bg-brand-50 text-slate-400 hover:text-brand-600 rounded transition-colors"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRemoveMedia(idx)}
                              title="Remove media"
                              className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Hardware Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed font-medium"
            />
          </div>

          {/* Technical Specifications Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block font-bold text-slate-700 uppercase">
                Technical Specifications ({specs.length})
              </label>
              <button
                type="button"
                onClick={handleAddSpec}
                className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Specification</span>
              </button>
            </div>

            <div className="space-y-2">
              {specs.map((s, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Spec Name (e.g. Refresh Rate)"
                    value={s.key}
                    onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <input
                    type="text"
                    placeholder="Spec Value (e.g. 240Hz UHD)"
                    value={s.value}
                    onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold rounded-xl shadow-md shadow-brand-500/25 transition-all flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>{editingProduct ? 'Update Product & Media' : 'Publish Product & Media'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
