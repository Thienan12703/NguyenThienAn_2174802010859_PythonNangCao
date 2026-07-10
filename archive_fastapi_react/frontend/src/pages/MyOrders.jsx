import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axiosClient.get('/api/orders/myorders');
                setOrders(data);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="py-8">Đang tải đơn hàng...</div>;
    if (error) return <div className="py-8 text-red-600">{error}</div>;

    return (
        <div className="py-8">
            <h1 className="text-2xl font-semibold mb-4">Đơn hàng của tôi</h1>
            {orders.length === 0 ? (
                <div>Không có đơn hàng nào.</div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow duration-150">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div>
                                    <h2 className="font-medium">Đơn hàng: {order._id}</h2>
                                    <p className="text-sm text-gray-600">Ngày: {new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="text-sm">
                                    <p>Trạng thái: <span className="font-semibold">{order.status}</span></p>
                                    <p>Tổng: <span className="font-semibold">{order.totalPrice.toLocaleString('vi-VN')}₫</span></p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="font-medium">Sản phẩm</h3>
                                <ul className="mt-2 space-y-2">
                                    {order.items.map((it) => (
                                        <li key={it.product._id || it.product} className="flex justify-between text-sm">
                                            <span>{it.product.name || it.product}</span>
                                            <span>{it.quantity} x {it.price.toLocaleString('vi-VN')}₫</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-4">
                                <a href={`/orders/${order._id}`} className="text-blue-600 hover:underline">Xem chi tiết</a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
