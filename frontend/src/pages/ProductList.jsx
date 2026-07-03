import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    
    const location = useLocation();

    // client-side pagination
    const [page, setPage] = useState(1);
    const pageSize = 12;

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const searchKeyword = queryParams.get('keyword') || '';
        const searchCategory = queryParams.get('category') || '';
        
        if (searchKeyword) setKeyword(searchKeyword);
        if (searchCategory) setCategoryFilter(searchCategory);

        const fetchData = async () => {
            setLoading(true);
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    axiosClient.get(`/api/products?keyword=${searchKeyword}`),
                    axiosClient.get('/api/categories'),
                ]);
                
                let filteredProducts = productsRes.data;
                if (searchCategory) {
                    filteredProducts = filteredProducts.filter(p => p.category?.slug === searchCategory || p.category?._id === searchCategory);
                }
                
                setProducts(filteredProducts);
                setCategories(categoriesRes.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [location.search]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (keyword) params.append('keyword', keyword);
            const { data } = await axiosClient.get(`/api/products?${params.toString()}`);
            
            let filteredProducts = data;
            if (categoryFilter) {
                filteredProducts = filteredProducts.filter(p => p.category?._id === categoryFilter);
            }
            
            setProducts(filteredProducts);
            setPage(1);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
    const paginated = products.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div className="py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filter */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                        <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold uppercase tracking-wider text-lg">
                            <Filter size={20} /> Bộ Lọc
                        </div>

                        <form onSubmit={handleSearch}>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên sản phẩm</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={keyword}
                                        onChange={(e) => setKeyword(e.target.value)}
                                        placeholder="Tìm kiếm..."
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                    <Search size={16} className="absolute right-3 top-3 text-gray-400" />
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Danh mục</label>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <input
                                            type="radio"
                                            id="cat-all"
                                            name="category"
                                            checked={categoryFilter === ''}
                                            onChange={() => setCategoryFilter('')}
                                            className="text-primary focus:ring-primary h-4 w-4 border-gray-300"
                                        />
                                        <label htmlFor="cat-all" className="ml-2 text-sm text-gray-600">Tất cả</label>
                                    </div>
                                    {categories.map((cat) => (
                                        <div key={cat._id} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`cat-${cat._id}`}
                                                name="category"
                                                checked={categoryFilter === cat._id || categoryFilter === cat.slug}
                                                onChange={() => setCategoryFilter(cat._id)}
                                                className="text-primary focus:ring-primary h-4 w-4 border-gray-300"
                                            />
                                            <label htmlFor={`cat-${cat._id}`} className="ml-2 text-sm text-gray-600">{cat.name}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-surface-dark text-white font-bold uppercase tracking-wide py-3 rounded-lg hover:bg-black transition-colors">
                                Áp dụng lọc
                            </button>
                        </form>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-black italic tracking-wide uppercase">Danh Sách Sản Phẩm</h1>
                        <div className="text-sm text-gray-500 font-medium">Hiển thị {products.length} kết quả</div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="animate-pulse bg-white rounded-2xl p-4 border border-gray-100">
                                    <div className="h-48 bg-gray-200 rounded-xl mb-4" />
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg font-medium">{error}</div>
                    ) : products.length === 0 ? (
                        <div className="bg-gray-50 text-center py-16 rounded-2xl border border-dashed border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                            <p className="text-gray-500">Vui lòng thử điều chỉnh bộ lọc của bạn.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {paginated.map((product) => (
                                    <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300">
                                        <Link to={`/products/${product._id}`} className="block relative h-60 overflow-hidden bg-gray-100">
                                            <img src={product.image || product.images?.[0]} alt={product.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                                            {product.isFeatured && (
                                                <span className="absolute top-3 left-3 bg-black text-primary text-xs font-bold px-2 py-1 uppercase tracking-wider rounded">HOT</span>
                                            )}
                                        </Link>
                                        <div className="p-5">
                                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">{product.brand}</div>
                                            <Link to={`/products/${product._id}`}>
                                                <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                                            </Link>
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-xl font-black text-surface-dark">{product.price.toLocaleString('vi-VN')}₫</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-12 flex items-center justify-center gap-2">
                                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} className={`p-2 rounded-lg flex items-center justify-center transition-colors ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`} disabled={page === 1}>
                                        <ChevronLeft size={20} />
                                    </button>
                                    
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }).map((_, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => setPage(i + 1)}
                                                className={`w-10 h-10 rounded-lg font-bold flex items-center justify-center transition-colors ${page === i + 1 ? 'bg-surface-dark text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>

                                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={`p-2 rounded-lg flex items-center justify-center transition-colors ${page === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`} disabled={page === totalPages}>
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProductList;
