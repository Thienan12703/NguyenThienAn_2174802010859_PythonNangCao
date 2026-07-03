import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ShoppingCart, ShieldCheck, Truck, ChevronRight } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import useCartStore from '../stores/cartStore';
import useUserStore from '../stores/userStore';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const [related, setRelated] = useState([]);
    const [mainImage, setMainImage] = useState(null);
    const [zoomed, setZoomed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewMessage, setReviewMessage] = useState(null);
    const addToCart = useCartStore((state) => state.addToCart);
    const user = useUserStore((state) => state.user);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchProduct = async () => {
            try {
                const { data } = await axiosClient.get(`/api/products/${id}`);
                setProduct(data);
                const imgs = (data.images && data.images.length ? data.images : (data.image ? [data.image] : []));
                setMainImage(imgs[0] || data.image || null);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    useEffect(() => {
        const fetchRelated = async () => {
            if (!product?.category) return;
            try {
                const { data } = await axiosClient.get(`/api/products?category=${product.category._id}`);
                const relatedItems = data.filter((p) => p._id !== product._id).slice(0, 4);
                setRelated(relatedItems);
            } catch (err) {
                // ignore
            }
        };
        fetchRelated();
    }, [product]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!user) {
            setReviewMessage('Bạn cần đăng nhập để gửi đánh giá.');
            return;
        }

        try {
            await axiosClient.post(`/api/products/${id}/reviews`, { rating, comment });
            setReviewMessage('Cảm ơn đánh giá của bạn!');
            const { data } = await axiosClient.get(`/api/products/${id}`);
            setProduct(data);
            setComment('');
        } catch (err) {
            setReviewMessage(err.response?.data?.message || err.message);
        }
    };

    const hasReviewed = product?.reviews?.some((review) => review.user === user?._id);

    if (loading) return (
        <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
    if (error) return <div className="py-12 text-center text-red-600 font-bold">{error}</div>;
    if (!product) return <div className="py-12 text-center font-bold">Không tìm thấy sản phẩm.</div>;

    const images = (product.images && product.images.length ? product.images : (product.image ? [product.image] : []));

    return (
        <div className="py-8 max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-gray-500 mb-8 font-medium">
                <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
                <ChevronRight size={14} className="mx-2" />
                <Link to="/products" className="hover:text-primary transition-colors">Sản phẩm</Link>
                <ChevronRight size={14} className="mx-2" />
                <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                {/* Images */}
                <div className="md:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
                    <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible sm:w-24 shrink-0 scrollbar-hide">
                        {images.map((img, i) => (
                            <button 
                                key={i} 
                                onClick={() => setMainImage(img)} 
                                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 transition-all ${mainImage === img ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-gray-200'}`}
                            >
                                <img src={img} alt={`${product.name}-${i}`} className="w-full h-full object-cover mix-blend-multiply bg-gray-50" />
                            </button>
                        ))}
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-2xl overflow-hidden relative group border border-gray-100">
                        <img 
                            src={mainImage || product.image} 
                            alt={product.name} 
                            className="w-full h-full object-contain cursor-zoom-in group-hover:scale-105 transition-transform duration-500 min-h-[400px] max-h-[600px]" 
                            onClick={() => setZoomed(true)} 
                        />
                        {product.isFeatured && (
                            <span className="absolute top-4 left-4 bg-black text-primary text-xs font-black px-3 py-1.5 uppercase tracking-wider rounded-md">HOT</span>
                        )}
                    </div>
                </div>

                {/* Product Info */}
                <div className="md:col-span-5 flex flex-col">
                    <div className="mb-2">
                        <span className="text-sm font-black text-gray-500 uppercase tracking-widest">{product.brand}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">{product.name}</h1>
                    
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center text-primary">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={18} className={s <= (product.rating || 0) ? "fill-primary text-primary" : "text-gray-300"} />
                            ))}
                        </div>
                        <span className="text-sm text-gray-500 font-medium">({product.numReviews || 0} đánh giá)</span>
                        <span className="text-gray-300">|</span>
                        <span className={`text-sm font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                        </span>
                    </div>

                    <div className="text-4xl font-black text-surface-dark mb-6">
                        {product.price.toLocaleString('vi-VN')}₫
                    </div>

                    <p className="text-gray-600 mb-8 leading-relaxed whitespace-pre-line">
                        {product.description}
                    </p>

                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
                        <div className="flex items-center gap-4 mb-6">
                            <span className="font-bold text-gray-900">Số lượng:</span>
                            <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <button 
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                                    disabled={product.stock === 0}
                                >-</button>
                                <input
                                    type="number"
                                    min={1}
                                    max={product.stock || 1}
                                    value={qty}
                                    onChange={(e) => setQty(Math.min(Math.max(1, Number(e.target.value)), product.stock || 1))}
                                    disabled={product.stock === 0}
                                    className="w-12 text-center font-bold text-gray-900 focus:outline-none"
                                />
                                <button 
                                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors font-bold"
                                    disabled={product.stock === 0}
                                >+</button>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => addToCart({ ...product, quantity: qty })}
                            disabled={product.stock === 0}
                            className={`w-full py-4 rounded-xl font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${
                                product.stock === 0 
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                : 'bg-surface-dark text-white hover:bg-black shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5'
                            }`}
                        >
                            <ShoppingCart size={20} />
                            {product.stock === 0 ? 'Tạm Hết Hàng' : 'Thêm Vào Giỏ'}
                        </button>
                    </div>

                    <div className="space-y-4 text-sm font-medium text-gray-700">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-primary" size={24} />
                            <span>Cam kết chính hãng 100%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Truck className="text-primary" size={24} />
                            <span>Giao hàng toàn quốc siêu tốc</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Reviews Section */}
            <section className="mt-20 border-t border-gray-200 pt-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-1">
                        <h2 className="text-2xl font-black uppercase italic mb-6">Đánh Giá Sản Phẩm</h2>
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center mb-8">
                            <div className="text-5xl font-black text-gray-900 mb-2">{product.rating?.toFixed(1) || '0.0'}</div>
                            <div className="flex justify-center text-primary mb-2">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star key={s} size={20} className={s <= Math.round(product.rating || 0) ? "fill-primary text-primary" : "text-gray-300"} />
                                ))}
                            </div>
                            <div className="text-sm text-gray-500 font-medium">{product.numReviews || 0} bài đánh giá</div>
                        </div>

                        {user && !hasReviewed && (
                            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                                <h3 className="font-bold mb-4">Viết đánh giá của bạn</h3>
                                <form onSubmit={handleSubmitReview}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-2">Đánh giá sao</label>
                                        <div className="flex gap-2 text-gray-300">
                                            {[1, 2, 3, 4, 5].map((value) => (
                                                <button 
                                                    type="button" 
                                                    key={value} 
                                                    onClick={() => setRating(value)}
                                                    className="focus:outline-none"
                                                >
                                                    <Star size={24} className={value <= rating ? "fill-primary text-primary" : ""} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-2">Bình luận</label>
                                        <textarea 
                                            value={comment} 
                                            onChange={(e) => setComment(e.target.value)} 
                                            required 
                                            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all" 
                                            rows={4} 
                                        />
                                    </div>
                                    {reviewMessage && <div className={`text-sm mb-4 font-medium ${reviewMessage.includes('Cảm ơn') ? 'text-green-600' : 'text-red-600'}`}>{reviewMessage}</div>}
                                    <button type="submit" className="w-full bg-surface-dark text-white font-bold py-3 rounded-xl hover:bg-black transition-colors">Gửi Đánh Giá</button>
                                </form>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <div className="space-y-6">
                            {product.reviews && product.reviews.length > 0 ? (
                                product.reviews.map((review) => (
                                    <div key={review._id || `${review.user}-${review.createdAt}`} className="border-b border-gray-100 pb-6 last:border-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="font-bold text-gray-900 block">{review.name}</span>
                                                <div className="flex text-primary mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} size={14} className={i < review.rating ? "fill-primary text-primary" : "text-gray-300"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-1 rounded">
                                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                            </span>
                                        </div>
                                        <p className="mt-3 text-gray-700 leading-relaxed">{review.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                    <p className="text-gray-500 font-medium">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Related Products */}
            {related.length > 0 && (
                <section className="mt-20 pt-16 border-t border-gray-200">
                    <h2 className="text-2xl font-black uppercase italic tracking-wide mb-8">Sản phẩm liên quan</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {related.map((p) => (
                            <div key={p._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300">
                                <Link to={`/products/${p._id}`} className="block relative h-48 overflow-hidden bg-gray-100">
                                    <img src={(p.images && p.images[0]) || p.image} alt={p.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                                </Link>
                                <div className="p-4">
                                    <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">{p.name}</h3>
                                    <div className="mt-2 text-lg font-black">{p.price.toLocaleString('vi-VN')}₫</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Image Zoom Modal */}
            {zoomed && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100]" onClick={() => setZoomed(false)}>
                    <button className="absolute top-6 right-6 text-white hover:text-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <div className="max-w-5xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
                        <img src={mainImage || product.image} alt={product.name} className="w-full h-full object-contain rounded-lg shadow-2xl" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
