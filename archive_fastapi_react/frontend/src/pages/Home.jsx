import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    
    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const { data } = await axiosClient.get('/api/products?keyword='); // Simple fetch
                // Filter top 4 for demo
                setFeaturedProducts(data.slice(0, 4));
            } catch (err) {
                console.error(err);
            }
        };
        fetchFeatured();
    }, []);

    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="relative bg-surface-dark text-white overflow-hidden py-20 lg:py-32 rounded-3xl mt-4">
                <div className="absolute inset-0 opacity-20">
                    <img src="https://images.unsplash.com/photo-1622279457486-640c4cb71653?w=1600&q=80" alt="Badminton Background" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-surface-dark via-surface-dark/90 to-transparent"></div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="max-w-2xl">
                        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-6 uppercase leading-tight">
                            Sức Mạnh <span className="text-primary block text-shadow-neon">Đỉnh Cao</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-lg leading-relaxed">
                            Trang bị cho mình những dụng cụ cầu lông chuyên nghiệp nhất. Bước ra sân với phong thái của nhà vô địch.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/products" className="bg-primary text-black font-bold px-8 py-4 rounded-full hover:bg-primary-light hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all flex items-center justify-center gap-2 uppercase tracking-wide">
                                Mua Sắm Ngay <ArrowRight size={20} />
                            </Link>
                            <Link to="/products?category=vot-cau-long" className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white hover:text-black transition-all flex items-center justify-center uppercase tracking-wide">
                                Khám phá Vợt
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-12 border-b border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center shrink-0">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Hiệu Suất Tối Đa</h3>
                            <p className="text-gray-500 text-sm">Sản phẩm chính hãng chất lượng cao</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center shrink-0">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Bảo Hành Uy Tín</h3>
                            <p className="text-gray-500 text-sm">Cam kết đổi trả trong 30 ngày</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4">
                        <div className="w-12 h-12 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center shrink-0">
                            <Truck size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">Giao Hàng Siêu Tốc</h3>
                            <p className="text-gray-500 text-sm">Miễn phí ship đơn từ 1.000.000đ</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-16">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-black uppercase italic tracking-wide">Danh Mục Sản Phẩm</h2>
                        <div className="w-20 h-1 bg-primary mt-2"></div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Cat 1 */}
                    <Link to="/products?category=vot-cau-long" className="group relative h-64 rounded-2xl overflow-hidden bg-gray-900">
                        <img src="https://images.unsplash.com/photo-1622279457486-640c4cb71653?w=600&q=80" alt="Vợt" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500" />
                        <div className="absolute inset-0 flex flex-col justify-end p-6">
                            <h3 className="text-2xl font-bold text-white mb-1">Vợt Cầu Lông</h3>
                            <span className="text-primary flex items-center gap-1 font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                Xem thêm <ArrowRight size={16} />
                            </span>
                        </div>
                    </Link>
                    {/* Cat 2 */}
                    <Link to="/products?category=giay-cau-long" className="group relative h-64 rounded-2xl overflow-hidden bg-gray-900">
                        <img src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80" alt="Giày" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500" />
                        <div className="absolute inset-0 flex flex-col justify-end p-6">
                            <h3 className="text-2xl font-bold text-white mb-1">Giày Chuyên Dụng</h3>
                            <span className="text-primary flex items-center gap-1 font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                Xem thêm <ArrowRight size={16} />
                            </span>
                        </div>
                    </Link>
                    {/* Cat 3 */}
                    <Link to="/products?category=ao-cau-long" className="group relative h-64 rounded-2xl overflow-hidden bg-gray-900">
                        <img src="https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&q=80" alt="Áo" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500" />
                        <div className="absolute inset-0 flex flex-col justify-end p-6">
                            <h3 className="text-2xl font-bold text-white mb-1">Áo Quần Thể Thao</h3>
                            <span className="text-primary flex items-center gap-1 font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                Xem thêm <ArrowRight size={16} />
                            </span>
                        </div>
                    </Link>
                    {/* Cat 4 */}
                    <Link to="/products?category=phu-kien" className="group relative h-64 rounded-2xl overflow-hidden bg-gray-900">
                        <img src="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80" alt="Phụ kiện" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500" />
                        <div className="absolute inset-0 flex flex-col justify-end p-6">
                            <h3 className="text-2xl font-bold text-white mb-1">Balo & Phụ Kiện</h3>
                            <span className="text-primary flex items-center gap-1 font-medium opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                Xem thêm <ArrowRight size={16} />
                            </span>
                        </div>
                    </Link>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16 bg-gray-50 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 rounded-3xl mb-12">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-black uppercase italic tracking-wide">Sản Phẩm Nổi Bật</h2>
                        <div className="w-20 h-1 bg-primary mt-2"></div>
                    </div>
                    <Link to="/products" className="text-gray-900 font-bold hover:text-primary transition-colors flex items-center gap-1">
                        Tất cả <ArrowRight size={18} />
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {featuredProducts.map((product) => (
                        <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                            <Link to={`/products/${product._id}`} className="block relative h-56 overflow-hidden bg-gray-100">
                                <img src={product.image || product.images?.[0]} alt={product.name} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                                {product.isFeatured && (
                                    <span className="absolute top-3 left-3 bg-black text-primary text-xs font-bold px-2 py-1 uppercase tracking-wider rounded">HOT</span>
                                )}
                            </Link>
                            <div className="p-5">
                                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">{product.brand}</span>
                                <Link to={`/products/${product._id}`}>
                                    <h3 className="font-bold text-gray-900 mt-1 mb-2 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                                </Link>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-lg font-black">{product.price.toLocaleString('vi-VN')}₫</span>
                                    <Link to={`/products/${product._id}`} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 group-hover:bg-primary transition-colors">
                                        <ArrowRight size={18} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
