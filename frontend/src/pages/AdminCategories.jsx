import { useEffect, useState } from 'react';
import { Tags, Plus, Edit2, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const fetchCategories = async () => {
        try {
            const { data } = await axiosClient.get('/api/categories');
            setCategories(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const resetForm = () => {
        setName('');
        setSlug('');
        setDescription('');
        setEditingId(null);
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            setSuccess(null);
            if (editingId) {
                const { data } = await axiosClient.put(`/api/categories/${editingId}`, { name, slug, description });
                setCategories(categories.map((cat) => (cat._id === editingId ? data : cat)));
                setSuccess('Cập nhật danh mục thành công!');
            } else {
                const { data } = await axiosClient.post('/api/categories', { name, slug, description });
                setCategories([...categories, data]);
                setSuccess('Thêm danh mục thành công!');
            }
            setTimeout(() => {
                resetForm();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    };

    const handleEdit = (category) => {
        setEditingId(category._id);
        setName(category.name || '');
        setSlug(category.slug || '');
        setDescription(category.description || '');
        setError(null);
        setSuccess(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
        try {
            await axiosClient.delete(`/api/categories/${categoryId}`);
            setCategories(categories.filter((cat) => cat._id !== categoryId));
            if (editingId === categoryId) resetForm();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    };

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-wide text-gray-900">Danh Mục</h1>
                    <p className="text-gray-500 font-medium mt-2">Quản lý các danh mục sản phẩm của cửa hàng.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            {editingId ? <><Edit2 size={20} className="text-primary" /> Chỉnh sửa</> : <><Plus size={20} className="text-primary" /> Thêm mới</>}
                        </h2>
                        
                        {error && (
                            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 text-red-600 rounded-xl font-medium text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="flex items-center gap-2 p-3 mb-4 bg-green-50 text-green-600 rounded-xl font-medium text-sm">
                                <CheckCircle2 size={16} />
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Tên danh mục</label>
                                <input 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="Ví dụ: Vợt cầu lông" 
                                    required 
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Slug</label>
                                <input 
                                    value={slug} 
                                    onChange={(e) => setSlug(e.target.value)} 
                                    placeholder="Ví dụ: vot-cau-long" 
                                    required 
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Mô tả</label>
                                <textarea 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    placeholder="Mô tả danh mục..." 
                                    rows={3} 
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium resize-none"
                                />
                            </div>
                            
                            <div className="pt-2 flex gap-3">
                                <button 
                                    type="submit" 
                                    className="flex-1 py-3 px-4 bg-surface-dark text-white font-bold rounded-xl uppercase tracking-wide hover:bg-black transition-colors"
                                >
                                    {editingId ? 'Cập nhật' : 'Thêm mới'}
                                </button>
                                {editingId && (
                                    <button 
                                        type="button" 
                                        onClick={resetForm} 
                                        className="py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl uppercase tracking-wide hover:bg-gray-200 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Tags size={20} className="text-gray-500" />
                                Danh sách danh mục
                            </h2>
                            <span className="bg-primary/20 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                                {categories.length} danh mục
                            </span>
                        </div>

                        {loading ? (
                            <div className="p-12 flex justify-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Tags size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Chưa có danh mục nào.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {categories.map((category) => (
                                    <div key={category._id} className="p-6 hover:bg-gray-50 transition-colors group">
                                        <div className="flex justify-between items-start gap-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                    {category.name}
                                                </h3>
                                                <div className="text-sm font-medium text-gray-500 mb-2">
                                                    Slug: <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-700">{category.slug}</span>
                                                </div>
                                                {category.description && (
                                                    <p className="text-gray-600 text-sm line-clamp-2">{category.description}</p>
                                                )}
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button 
                                                    onClick={() => handleEdit(category)} 
                                                    className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                                                    title="Sửa"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(category._id)} 
                                                    className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCategories;
