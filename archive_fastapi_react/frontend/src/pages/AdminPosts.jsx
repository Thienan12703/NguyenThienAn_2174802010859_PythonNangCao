import { useEffect, useState, useRef } from 'react';
import { FileText, Plus, Edit2, Trash2, AlertCircle, Image as ImageIcon, CheckCircle2, X } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const slugify = (str) =>
  str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const EMPTY_POST = { title: '', slug: '', thumbnail: '', content: '' };

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(EMPTY_POST);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const contentRef = useRef(null);

  /* ── fetch posts ── */
  const fetchPosts = async () => {
    try {
      const { data } = await axiosClient.get('/api/posts');
      setPosts(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  /* ── delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      await axiosClient.delete(`/api/posts/${id}`);
      setPosts(posts.filter((p) => p._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  /* ── submit (create / update) ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    // Sync contenteditable
    const htmlContent = contentRef.current ? contentRef.current.innerHTML : form.content;
    const payload = { ...form, content: htmlContent };
    try {
      if (editingId) {
        const { data } = await axiosClient.put(`/api/posts/${editingId}`, payload);
        setPosts(posts.map((p) => (p._id === editingId ? data : p)));
        setSuccess('Cập nhật bài viết thành công!');
      } else {
        const { data } = await axiosClient.post('/api/posts', payload);
        setPosts([data, ...posts]);
        setSuccess('Thêm bài viết thành công!');
      }
      setTimeout(() => {
        setEditingId(null);
        setIsFormOpen(false);
        setForm(EMPTY_POST);
        setSuccess(null);
        if (contentRef.current) contentRef.current.innerHTML = '';
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  /* ── edit ── */
  const handleEdit = (post) => {
    setEditingId(post._id);
    setForm({
      title: post.title || '',
      slug: post.slug || '',
      thumbnail: post.thumbnail || '',
      content: post.content || '',
    });
    setIsFormOpen(true);
    setTimeout(() => {
      if (contentRef.current) contentRef.current.innerHTML = post.content || '';
    }, 50);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── open create form ── */
  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_POST);
    setIsFormOpen(true);
    setTimeout(() => {
      if (contentRef.current) contentRef.current.innerHTML = '';
    }, 50);
  };

  /* ── thumbnail upload ── */
  const handleThumbnail = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('images', file);
    try {
      setUploading(true);
      const { data } = await axiosClient.post('/api/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const path = data.paths?.[0] || '';
      setForm((f) => ({ ...f, thumbnail: path }));
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  /* ── inline image inside editor ── */
  const handleInsertImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('images', file);
    try {
      setUploading(true);
      const { data } = await axiosClient.post('/api/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const path = data.paths?.[0] || '';
      if (path && contentRef.current) {
        contentRef.current.focus();
        document.execCommand('insertHTML', false, `<img src="${path}" alt="image" style="max-width:100%;margin:8px 0;border-radius:8px;" />`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  /* ── toolbar commands ── */
  const exec = (cmd, val = null) => {
    contentRef.current?.focus();
    document.execCommand(cmd, false, val);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-wide text-gray-900">Bài Viết</h1>
          <p className="text-gray-500 font-medium mt-2">Quản lý tin tức và bài viết cầu lông.</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all"
          >
            <Plus size={20} />
            Thêm Bài Viết Mới
          </button>
        )}
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              {editingId ? <Edit2 size={24} className="text-primary" /> : <Plus size={24} className="text-primary" />}
              {editingId ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
            </h2>
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 mb-4 bg-red-50 text-red-600 rounded-xl font-medium">
              <AlertCircle size={20} /> {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-4 mb-4 bg-green-50 text-green-600 rounded-xl font-medium">
              <CheckCircle2 size={20} /> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Tiêu đề *</label>
              <input
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({ ...f, title, slug: slugify(title) }));
                }}
                placeholder="Tiêu đề bài viết"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Slug (URL)</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="duong-dan-bai-viet"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium font-mono text-sm"
              />
            </div>

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Ảnh thumbnail</label>
              <div className="flex gap-4 items-start">
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnail}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="text-center pointer-events-none">
                    <ImageIcon size={28} className="mx-auto text-gray-400 mb-1" />
                    <p className="text-sm font-medium text-gray-600">
                      {uploading ? 'Đang tải...' : 'Kéo thả hoặc click để chọn ảnh'}
                    </p>
                  </div>
                </div>
                {form.thumbnail && (
                  <div className="relative">
                    <img src={form.thumbnail} alt="thumbnail" className="w-28 h-28 object-cover rounded-xl border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, thumbnail: '' }))}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Rich text editor */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nội dung bài viết *</label>

              {/* Toolbar */}
              <div className="flex flex-wrap gap-1 mb-1 p-2 bg-gray-50 border border-gray-200 rounded-t-xl">
                {[
                  { label: 'B', cmd: 'bold', title: 'In đậm', style: 'font-bold' },
                  { label: 'I', cmd: 'italic', title: 'In nghiêng', style: 'italic' },
                  { label: 'U', cmd: 'underline', title: 'Gạch chân', style: 'underline' },
                ].map(({ label, cmd, title, style }) => (
                  <button
                    key={cmd}
                    type="button"
                    title={title}
                    onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
                    className={`w-8 h-8 rounded text-sm ${style} text-gray-700 hover:bg-gray-200 transition-colors`}
                  >
                    {label}
                  </button>
                ))}
                <div className="w-px bg-gray-300 mx-1" />
                {['H1', 'H2', 'H3'].map((h) => (
                  <button
                    key={h}
                    type="button"
                    title={h}
                    onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', h); }}
                    className="px-2 h-8 rounded text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    {h}
                  </button>
                ))}
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); exec('formatBlock', 'P'); }}
                  className="px-2 h-8 rounded text-xs text-gray-700 hover:bg-gray-200 transition-colors"
                  title="Đoạn văn"
                >
                  P
                </button>
                <div className="w-px bg-gray-300 mx-1" />
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }}
                  className="px-2 h-8 rounded text-xs text-gray-700 hover:bg-gray-200 transition-colors"
                  title="Danh sách"
                >
                  • List
                </button>
                <div className="w-px bg-gray-300 mx-1" />
                {/* Insert image inside content */}
                <label className="relative px-2 h-8 rounded text-xs text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-1 cursor-pointer" title="Chèn ảnh vào bài">
                  <ImageIcon size={14} /> Ảnh
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleInsertImage}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </label>
              </div>

              {/* Editable area */}
              <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                className="w-full min-h-[220px] px-4 py-3 bg-white border border-gray-200 border-t-0 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all prose prose-sm max-w-none"
                style={{ lineHeight: 1.7 }}
              />
            </div>

            {/* Actions */}
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
                {editingId ? 'Lưu Thay Đổi' : 'Đăng Bài'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Post list */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText size={20} className="text-gray-500" />
            Danh sách bài viết
          </h2>
          <span className="bg-primary/20 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            {posts.length} bài viết
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p>Chưa có bài viết nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-bold text-gray-600 text-sm">Bài viết</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">Slug</th>
                  <th className="p-4 font-bold text-gray-600 text-sm">Ngày tạo</th>
                  <th className="p-4 font-bold text-gray-600 text-sm text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        {post.thumbnail ? (
                          <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                            <FileText size={24} className="text-gray-400" />
                          </div>
                        )}
                        <span className="font-bold text-gray-900 line-clamp-2 max-w-xs">{post.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{post.slug}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-500">
                      {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN') : '---'}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                          title="Sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(post._id)}
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

export default AdminPosts;
