import { useEffect, useState } from 'react';
import { ShoppingCart, CheckCircle2, Truck, Clock, XCircle, AlertCircle, Search, CreditCard, Calendar } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = async () => {
        try {
            const { data } = await axiosClient.get('/api/orders');
            setOrders(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (orderId, status) => {
        try {
            const { data } = await axiosClient.put(`/api/orders/${orderId}/status`, { status });
            setOrders(orders.map((order) => (order._id === data._id ? data : order)));
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    };

    const filteredOrders = orders.filter((order) => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyle = (status) => {
        switch(status) {
            case 'Chờ xử lý': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Đang giao': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Hoàn thành': return 'bg-green-100 text-green-800 border-green-200';
            case 'Đã hủy': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch(status) {
            case 'Chờ xử lý': return <Clock size={16} />;
            case 'Đang giao': return <Truck size={16} />;
            case 'Hoàn thành': return <CheckCircle2 size={16} />;
            case 'Đã hủy': return <XCircle size={16} />;
            default: return null;
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
                    <h1 className="text-3xl font-black italic uppercase tracking-wide text-gray-900">Đơn Hàng</h1>
                    <p className="text-gray-500 font-medium mt-2">Quản lý và cập nhật trạng thái đơn hàng của khách hàng.</p>
                </div>
                
                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm mã đơn, tên, email..."
                        className="block w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-shadow font-medium"
                    />
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 text-red-600 rounded-xl font-medium">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingCart size={20} className="text-gray-500" />
                        Danh sách đơn hàng
                    </h2>
                    <span className="bg-primary/20 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        {filteredOrders.length} đơn hàng
                    </span>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Không tìm thấy đơn hàng nào phù hợp.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredOrders.map((order) => (
                            <div key={order._id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                <div className="flex flex-col lg:flex-row gap-6 justify-between">
                                    {/* Order Info */}
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h3 className="font-bold text-lg">Mã Đơn: #{order._id.slice(-8).toUpperCase()}</h3>
                                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider">Khách hàng</p>
                                                <p className="font-medium text-gray-900">{order.user?.name || 'Khách vãng lai'}</p>
                                                <p className="text-sm text-gray-600">{order.user?.email || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1"><Calendar size={14}/> Ngày đặt</p>
                                                <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <p className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-1"><Truck size={14}/> Giao tới</p>
                                            <p className="font-bold text-gray-900">{order.shippingAddress?.fullName}</p>
                                            <p className="text-sm text-gray-600 mt-1">{order.shippingAddress?.phone}</p>
                                            <p className="text-sm text-gray-600 mt-1">{order.shippingAddress?.address}</p>
                                        </div>
                                    </div>

                                    {/* Order Summary & Actions */}
                                    <div className="lg:w-72 shrink-0 flex flex-col justify-between space-y-4">
                                        <div className="bg-surface-dark text-white rounded-xl p-5 shadow-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-gray-400 text-sm">Thanh toán</span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${order.isPaid ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                                                    {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                                                <span className="text-gray-400 text-sm flex items-center gap-1"><CreditCard size={14}/> Phương thức</span>
                                                <span className="font-medium text-sm">{order.paymentMethod}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold">Tổng cộng</span>
                                                <span className="text-2xl font-black text-primary">{order.totalPrice.toLocaleString('vi-VN')}₫</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 justify-end">
                                            {['Chờ xử lý', 'Đang giao', 'Hoàn thành', 'Đã hủy'].map((status) => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => handleUpdateStatus(order._id, status)}
                                                    disabled={order.status === status}
                                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                                        order.status === status
                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-green-50'
                                                    }`}
                                                >
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
