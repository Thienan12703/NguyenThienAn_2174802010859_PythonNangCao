import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import useCartStore from '../stores/cartStore';

const Cart = () => {
    const items = useCartStore((state) => state.items);
    const removeFromCart = useCartStore((state) => state.removeFromCart);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const navigate = useNavigate();

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-black italic tracking-wide uppercase mb-8 flex items-center gap-3">
                <ShoppingBag size={32} className="text-primary" /> Giỏ hàng của bạn
            </h1>
            
            {items.length === 0 ? (
                <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-16 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag size={48} className="text-gray-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng đang trống</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Bạn chưa thêm bất kỳ sản phẩm nào vào giỏ hàng. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi nhé.</p>
                    <Link to="/products" className="inline-flex items-center gap-2 bg-surface-dark text-white font-bold px-8 py-4 rounded-full hover:bg-black hover:shadow-xl transition-all uppercase tracking-wide">
                        Khám phá sản phẩm <ArrowRight size={20} />
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-2/3 space-y-6">
                        {items.map((item) => (
                            <div key={item._id} className="flex flex-col sm:flex-row items-center gap-6 bg-white border border-gray-100 shadow-sm rounded-2xl p-4 sm:p-6 transition-all hover:shadow-md hover:border-gray-200">
                                <Link to={`/products/${item._id}`} className="shrink-0">
                                    <div className="w-32 h-32 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                        <img src={item.image || item.images?.[0]} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                                    </div>
                                </Link>
                                
                                <div className="flex-1 w-full text-center sm:text-left">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{item.brand}</div>
                                    <Link to={`/products/${item._id}`}>
                                        <h2 className="text-lg font-bold text-gray-900 hover:text-primary transition-colors line-clamp-1 mb-2">{item.name}</h2>
                                    </Link>
                                    <div className="text-xl font-black text-surface-dark mb-4 sm:mb-0">
                                        {item.price.toLocaleString('vi-VN')}₫
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:flex-col sm:justify-center w-full sm:w-auto gap-4 sm:gap-6">
                                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                                        <button 
                                            onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))} 
                                            className="px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <input 
                                            type="number"
                                            value={item.quantity} 
                                            onChange={(e) => updateQuantity(item._id, Math.max(1, Number(e.target.value) || 1))} 
                                            className="w-12 text-center font-bold text-gray-900 focus:outline-none bg-transparent" 
                                        />
                                        <button 
                                            onClick={() => updateQuantity(item._id, item.quantity + 1)} 
                                            className="px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                    
                                    <button 
                                        onClick={() => removeFromCart(item._id)} 
                                        className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors flex items-center justify-center gap-1 text-sm font-medium"
                                    >
                                        <Trash2 size={18} />
                                        <span className="sm:hidden">Xóa</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <aside className="lg:w-1/3">
                        <div className="bg-white border border-gray-100 shadow-lg rounded-3xl p-6 sticky top-24">
                            <h2 className="text-xl font-black uppercase italic border-b border-gray-100 pb-4 mb-6">Tổng đơn hàng</h2>
                            
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Tạm tính ({items.length} sản phẩm)</span>
                                    <span className="font-semibold text-gray-900">{total.toLocaleString('vi-VN')}₫</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600">
                                    <span>Phí giao hàng</span>
                                    <span className="font-semibold text-gray-900">Miễn phí</span>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-6 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                                    <span className="text-3xl font-black text-primary drop-shadow-[0_2px_4px_rgba(57,255,20,0.2)]">{total.toLocaleString('vi-VN')}₫</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 text-right">(Đã bao gồm VAT nếu có)</p>
                            </div>

                            <button 
                                onClick={() => navigate('/checkout')} 
                                className="w-full bg-surface-dark text-white font-bold py-4 rounded-xl hover:bg-black shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 uppercase tracking-wide"
                            >
                                Đặt hàng ngay <ArrowRight size={20} />
                            </button>
                            
                            <div className="mt-6 text-center">
                                <Link to="/products" className="text-sm font-medium text-gray-500 hover:text-primary transition-colors inline-flex items-center gap-1">
                                    Tiếp tục mua sắm
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default Cart;
