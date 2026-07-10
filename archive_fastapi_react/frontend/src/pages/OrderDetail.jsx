import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const OrderDetail = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await axiosClient.get(`/api/orders/${id}`);
                setOrder(data);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) return <div className="py-8">Đang tải đơn hàng...</div>;
    if (error) return <div className="py-8 text-red-600">{error}</div>;
    if (!order) return <div className="py-8">Không tìm thấy đơn hàng.</div>;

    return (
        <div className="py-8">
            <h1 className="text-2xl font-semibold mb-4">Chi tiết đơn hàng</h1>
            <div className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h2 className="font-medium mb-2">Thông tin đơn hàng</h2>
                        <p><span className="font-semibold">Mã đơn:</span> {order._id}</p>
                        <p><span className="font-semibold">Người đặt:</span> {order.user?.name || '---'}</p>
                        <p><span className="font-semibold">Email:</span> {order.user?.email || '---'}</p>
                        <p><span className="font-semibold">Trạng thái:</span> {order.status}</p>
                        <p><span className="font-semibold">Phương thức thanh toán:</span> {order.paymentMethod}</p>
                        <p><span className="font-semibold">Tình trạng thanh toán:</span> {order.paymentStatus}</p>
                    </div>
                    <div>
                        <h2 className="font-medium mb-2">Địa chỉ giao hàng</h2>
                        <p>{order.shippingAddress?.fullName}</p>
                        <p>{order.shippingAddress?.phone}</p>
                        <p>{order.shippingAddress?.address}</p>
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="font-medium mb-2">Sản phẩm</h3>
                    <ul className="space-y-2">
                        {order.items.map((it) => (
                            <li key={it.product._id || it.product} className="flex justify-between items-center border rounded-lg p-3">
                                <span>{it.product.name || it.product}</span>
                                <span>{it.quantity} x {it.price.toLocaleString('vi-VN')}₫</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="mt-6 text-right text-xl font-semibold">Tổng: {order.totalPrice.toLocaleString('vi-VN')}₫</div>
            </div>
        </div>
    );
};

export default OrderDetail;
