import { useEffect, useState } from 'react';
import { Package, Plus, Edit2, Trash2, AlertCircle, Image as ImageIcon, CheckCircle2, ChevronLeft, ChevronRight, Star, X } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newProduct, setNewProduct] = useState({ name: '', price: 0, image: '', images: [], brand: '', category: '', description: '', stock: 0 });
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const fetchData = async () => {
        try {
            const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
                axiosClient.get('/api/products'),
                axiosClient.get('/api/categories'),
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
        try {
            await axiosClient.delete(`/api/products/${id}`);
            setProducts(products.filter((product) => product._id !== id));
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            setSuccess(null);
            if (editingId) {
                const { data } = await axiosClient.put(`/api/products/${editingId}`, newProduct);
                setProducts(products.map((p) => (p._id === editingId ? data : p)));
                setSuccess('Cập nhật sản phẩm thành công!');
            } else {
                const { data } = await axiosClient.post('/api/products', newProduct);
                setProducts([...products, data]);
                setSuccess('Thêm sản phẩm thành công!');
            }
            setTimeout(() => {
                setEditingId(null);
                setIsFormOpen(false);
                setNewProduct({ name: '', price: 0, image: '', images: [], brand: '', category: '', description: '', stock: 0 });
                setSuccess(null);
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    };

    const handleEdit = (product) => {
        setEditingId(product._id);
        setNewProduct({
            name: product.name || '',
            price: product.price || 0,
            image: product.image || '',
            images: product.images || [],
            brand: product.brand || '',
            category: product.category?._id || '',
            description: product.description || '',
            stock: product.stock || 0,
        });
        setIsFormOpen(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleFiles = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        const form = new FormData();
        files.forEach((f) => form.append('images', f));
        try {
            setUploading(true);
            const { data } = await axiosClient.post('/api/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
            const paths = data.paths || [];
            setNewProduct({ ...newProduct, images: [...(newProduct.images || []), ...paths], image: (newProduct.image || paths[0] || '') });
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const moveImage = (idx, delta) => {
        const imgs = [...(newProduct.images || [])];
        const to = idx + delta;
        if (to < 0 || to >= imgs.length) return;
        const tmp = imgs[to];
        imgs[to] = imgs[idx];
        imgs[idx] = tmp;
        setNewProduct({ ...newProduct, images: imgs, image: imgs[0] || newProduct.image });
    };

    const setCover = (idx) => {
        const imgs = [...(newProduct.images || [])];
        if (idx < 0 || idx >= imgs.length) return;
        const chosen = imgs[idx];
        const rest = imgs.filter((_, i) => i !== idx);
        const updated = [chosen, ...rest];
        setNewProduct({ ...newProduct, images: updated, image: chosen });
    };

    const removeImageAt = async (idx) => {
        const imgs = [...(newProduct.images || [])];
        const target = imgs[idx];
        const updated = imgs.filter((_, i) => i !== idx);
        setNewProduct({ ...newProduct, images: updated, image: updated[0] || '' });
        try {
            if (target && target.startsWith('/uploads/')) {
                await axiosClient.delete('/api/upload', { data: { path: target } });
            }
        } catch (err) {
            console.error('Could not delete remote file', err?.response?.data || err.message);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-wide text-gray-900">Sản Phẩm</h1>
                    <p className="text-gray-500 font-medium mt-2">Quản lý kho hàng sản phẩm của bạn.</p>
                </div>
                {!isFormOpen && (
                    <button 
                        onClick={() => {
                            setEditingId(null);
                            setNewProduct({ name: '', price: 0, image: '', images: [], brand: '', category: '', description: '', stock: 0 });
                            setIsFormOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all"
                    >
                        <Plus size={20} />
                        Thêm Sản Phẩm Mới
                    </button>
                )}
            </div>

            {/* Form */}
            {isFormOpen && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-8 animate-fadeIn">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            {editingId ? <Edit2 size={24} className="text-primary" /> : <Plus size={24} className="text-primary" />}
                            {editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                        </h2>
                        <button 
                            onClick={() => setIsFormOpen(false)}
                            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 text-red-600 rounded-xl font-medium">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-2 p-4 mb-6 bg-green-50 text-green-600 rounded-xl font-medium">
                            <CheckCircle2 size={20} />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Tên sản phẩm *</label>
                                    <input 
                                        value={newProduct.name} 
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} 
                                        placeholder="Tên sản phẩm" 
                                        required 
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Giá bán (VNĐ) *</label>
                                        <input 
                                            type="number" 
                                            value={newProduct.price} 
                                            onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} 
                                            placeholder="0" 
                                            required 
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Tồn kho *</label>
                                        <input 
                                            type="number" 
                                            value={newProduct.stock} 
                                            onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} 
                                            placeholder="0" 
                                            required 
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Thương hiệu *</label>
                                        <input 
                                            value={newProduct.brand} 
                                            onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })} 
                                            placeholder="Thương hiệu" 
                                            required 
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Danh mục *</label>
                                        <select 
                                            value={newProduct.category} 
                                            onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} 
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                                        >
                                            <option value="">Chọn danh mục</option>
                                            {categories.map((category) => (
                                                <option key={category._id} value={category._id}>{category.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Hình ảnh</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 relative">
                                        <input 
                                            type="file" 
                                            multiple 
                                            onChange={handleFiles} 
                                            disabled={uploading} 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="text-center pointer-events-none">
                                            <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm font-medium text-gray-600">
                                                {uploading ? 'Đang tải lên...' : 'Kéo thả hoặc click để chọn ảnh'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Image Preview List */}
                                    {newProduct.images && newProduct.images.length > 0 && (
                                        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                                            {newProduct.images.map((img, idx) => (
                                                <div key={idx} className={`relative shrink-0 group rounded-xl overflow-hidden border-2 ${idx === 0 ? 'border-primary' : 'border-transparent'}`}>
                                                    <img src={img} alt={`img-${idx}`} className="w-24 h-24 object-cover" />
                                                    {idx === 0 && (
                                                        <div className="absolute top-0 left-0 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-br-lg z-10">
                                                            Ảnh bìa
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-1 p-1">
                                                        <button type="button" onClick={() => moveImage(idx, -1)} disabled={idx === 0} className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full text-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                                                        <button type="button" onClick={() => moveImage(idx, 1)} disabled={idx === newProduct.images.length - 1} className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full text-white disabled:opacity-30"><ChevronRight size={16} /></button>
                                                        <button type="button" onClick={() => setCover(idx)} className="w-8 h-8 flex items-center justify-center bg-white/20 hover:bg-white/40 rounded-full text-white"><Star size={16} /></button>
                                                        <button type="button" onClick={() => removeImageAt(idx)} className="w-8 h-8 flex items-center justify-center bg-red-500/80 hover:bg-red-600 rounded-full text-white"><X size={16} /></button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả sản phẩm *</label>
                                    <textarea 
                                        value={newProduct.description} 
                                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} 
                                        placeholder="Mô tả chi tiết sản phẩm..." 
                                        required 
                                        rows={5} 
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-100 flex gap-4 justify-end">
                            <button 
                                type="button" 
                                onClick={() => setIsFormOpen(false)}
                                className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl uppercase tracking-wide hover:bg-gray-200 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="submit" 
                                disabled={uploading}
                                className="px-8 py-3 bg-surface-dark text-white font-bold rounded-xl uppercase tracking-wide hover:bg-black transition-colors disabled:bg-gray-400"
                            >
                                {editingId ? 'Lưu Thay Đổi' : 'Tạo Sản Phẩm'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Package size={20} className="text-gray-500" />
                        Danh sách sản phẩm
                    </h2>
                    <span className="bg-primary/20 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        {products.length} sản phẩm
                    </span>
                </div>

                {products.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Chưa có sản phẩm nào.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-4 font-bold text-gray-600 text-sm">Sản phẩm</th>
                                    <th className="p-4 font-bold text-gray-600 text-sm">Danh mục & Hiệu</th>
                                    <th className="p-4 font-bold text-gray-600 text-sm">Giá bán</th>
                                    <th className="p-4 font-bold text-gray-600 text-sm">Tồn kho</th>
                                    <th className="p-4 font-bold text-gray-600 text-sm text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-4">
                                                <img 
                                                    src={product.image || 'https://placehold.co/100x100?text=No+Image'} 
                                                    alt={product.name} 
                                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                                />
                                                <span className="font-bold text-gray-900 line-clamp-2">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-800">{product.category?.name || '---'}</span>
                                                <span className="text-xs text-gray-500">{product.brand}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-primary">
                                            {product.price.toLocaleString('vi-VN')}₫
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEdit(product)} 
                                                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                                                    title="Sửa"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(product._id)} 
                                                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProducts;
