import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import useCartStore from '../stores/cartStore';
import axiosClient from '../api/axiosClient';
import useUserStore from '../stores/userStore';

const Checkout = () => {
    const items = useCartStore((s) => s.items);
    const clearCart = useCartStore((s) => s.clearCart);
    const user = useUserStore((s) => s.user);
    const [shipping, setShipping] = useState({ fullName: user?.name || '', phone: '', address: '' });
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [cardDetails, setCardDetails] = useState({ cardNumber: '', expiry: '', cvc: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

    const submitOrder = async (e) => {
        e.preventDefault();
        if (items.length === 0) return setError('Giỏ hàng trống');
        if (!shipping.fullName || !shipping.phone || !shipping.address) return setError('Vui lòng điền đủ thông tin giao hàng');
        setLoading(true);
        setError(null);

        try {
            if (paymentMethod === 'card') {
                await axiosClient.post('/api/payments/charge', {
                    amount: total,
                    method: 'card',
                    paymentDetails: cardDetails,
                });
            }

            const payload = {
                items: items.map((it) => ({ product: it._id, quantity: it.quantity, price: it.price })),
                shippingAddress: shipping,
                totalPrice: total,
                paymentMethod: paymentMethod === 'card' ? 'card' : 'COD',
            };

            const { data } = await axiosClient.post('/api/orders', payload);
            clearCart();
            navigate(`/orders/${data._id}`);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Không có sản phẩm để thanh toán</h2>
                <Link to="/products" className="text-primary hover:underline font-medium">Quay lại mua sắm</Link>
            </div>
        );
    }

    return (
        <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-black italic tracking-wide uppercase mb-8">Thanh Toán</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7">
                    <form onSubmit={submitOrder} className="space-y-8">
                        {/* Thông tin giao hàng */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Truck className="text-primary" /> Thông tin giao hàng
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên</label>
                                    <input 
                                        value={shipping.fullName} 
                                        onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })} 
                                        required 
                                        placeholder="Nhập họ tên người nhận"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all" 
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                                        <input 
                                            value={shipping.phone} 
                                            onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} 
                                            required 
                                            placeholder="Nhập số điện thoại"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                                        <input 
                                            type="email"
                                            value={user?.email || ''} 
                                            disabled
                                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ nhận hàng</label>
                                    <textarea 
                                        value={shipping.address} 
                                        onChange={(e) => setShipping({ ...shipping, address: e.target.value })} 
                                        required 
                                        placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all" 
                                        rows={3} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Phương thức thanh toán */}
                        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <CreditCard className="text-primary" /> Phương thức thanh toán
                            </h2>
                            <div className="space-y-4">
                                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="COD" 
                                        checked={paymentMethod === 'COD'} 
                                        onChange={() => setPaymentMethod('COD')} 
                                        className="w-5 h-5 text-primary focus:ring-primary"
                                    />
                                    <div className="flex-1">
                                        <span className="font-bold text-gray-900 block">Thanh toán khi nhận hàng (COD)</span>
                                        <span className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi giao hàng tận nơi.</span>
                                    </div>
                                </label>
                                
                                <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input 
                                        type="radio" 
                                        name="payment" 
                                        value="card" 
                                        checked={paymentMethod === 'card'} 
                                        onChange={() => setPaymentMethod('card')} 
                                        className="w-5 h-5 text-primary focus:ring-primary"
                                    />
                                    <div className="flex-1">
                                        <span className="font-bold text-gray-900 block">Thanh toán qua thẻ (Tín dụng/Ghi nợ)</span>
                                        <span className="text-sm text-gray-500">Thanh toán an toàn qua cổng thanh toán bảo mật.</span>
                                    </div>
                                </label>
                            </div>

                            {paymentMethod === 'card' && (
                                <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-4 animate-fadeIn">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Số thẻ</label>
                                        <input
                                            value={cardDetails.cardNumber}
                                            onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                                            required
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày hết hạn (MM/YY)</label>
                                            <input
                                                value={cardDetails.expiry}
                                                onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                                required
                                                placeholder="MM/YY"
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">CVC/CVV</label>
                                            <input
                                                value={cardDetails.cvc}
                                                onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                                                required
                                                placeholder="123"
                                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl font-medium">
                                <AlertCircle size={20} />
                                {error}
                            </div>
                        )}
                        
                        {/* Mobile submit button */}
                        <div className="lg:hidden mt-8">
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className={`w-full font-bold uppercase tracking-wide py-4 rounded-xl flex items-center justify-center gap-2 transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-surface-dark text-white hover:bg-black shadow-[0_4px_14px_0_rgba(0,0,0,0.39)]'}`}
                            >
                                {loading ? (
                                    <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> Đang xử lý...</>
                                ) : (
                                    <><CheckCircle2 size={20} /> Hoàn tất đặt hàng</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="lg:col-span-5">
                    <div className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-200 sticky top-24">
                        <h2 className="text-xl font-bold mb-6 uppercase tracking-wide border-b border-gray-200 pb-4">Tóm tắt đơn hàng</h2>
                        
                        <div className="max-h-96 overflow-y-auto mb-6 pr-2 space-y-4">
                            {items.map((it) => (
                                <div key={it._id} className="flex gap-4">
                                    <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0">
                                        <img src={it.image || it.images?.[0]} alt={it.name} className="w-full h-full object-cover mix-blend-multiply" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 line-clamp-1 text-sm">{it.name}</h3>
                                        <div className="text-xs text-gray-500 mt-1">SL: {it.quantity}</div>
                                    </div>
                                    <div className="font-bold text-sm text-right shrink-0">
                                        {(it.price * it.quantity).toLocaleString('vi-VN')}₫
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-6 space-y-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính</span>
                                <span className="font-semibold text-gray-900">{total.toLocaleString('vi-VN')}₫</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Phí vận chuyển</span>
                                <span className="font-semibold text-gray-900">Miễn phí</span>
                            </div>
                            <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-4">
                                <span className="text-lg font-bold text-gray-900">Tổng thanh toán</span>
                                <span className="text-2xl font-black text-primary drop-shadow-[0_2px_4px_rgba(57,255,20,0.2)]">{total.toLocaleString('vi-VN')}₫</span>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            onClick={submitOrder}
                            disabled={loading} 
                            className={`hidden lg:flex w-full font-bold uppercase tracking-wide py-4 rounded-xl items-center justify-center gap-2 mt-8 transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-surface-dark text-white hover:bg-black shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:-translate-y-0.5'}`}
                        >
                            {loading ? (
                                <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> Đang xử lý...</>
                            ) : (
                                <><CheckCircle2 size={20} /> Hoàn tất đặt hàng</>
                            )}
                        </button>
                        
                        <p className="text-xs text-center text-gray-500 mt-4">
                            Bằng việc đặt hàng, bạn đồng ý với <a href="#" className="text-primary hover:underline">Điều khoản</a> và <a href="#" className="text-primary hover:underline">Chính sách</a> của chúng tôi.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
