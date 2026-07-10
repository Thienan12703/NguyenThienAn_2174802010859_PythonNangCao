import { useEffect, useState } from 'react';
import { Package, ShoppingCart, Users, TrendingUp, AlertCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [{ data: products }, { data: orders }, { data: users }] = await Promise.all([
                    axiosClient.get('/api/products'),
                    axiosClient.get('/api/orders'),
                    axiosClient.get('/api/users'),
                ]);

                const revenue = orders.reduce((sum, order) => sum + (order.isPaid ? order.totalPrice : 0), 0);

                setStats({ products: products.length, orders: orders.length, users: users.length, revenue });
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
    
    if (error) return (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl font-medium">
            <AlertCircle size={20} />
            {error}
        </div>
    );

    const statCards = [
        { title: 'Doanh thu', value: `${stats.revenue.toLocaleString('vi-VN')}₫`, icon: <TrendingUp size={24} />, color: 'bg-green-500', textColor: 'text-green-500' },
        { title: 'Đơn hàng', value: stats.orders, icon: <ShoppingCart size={24} />, color: 'bg-blue-500', textColor: 'text-blue-500' },
        { title: 'Sản phẩm', value: stats.products, icon: <Package size={24} />, color: 'bg-purple-500', textColor: 'text-purple-500' },
        { title: 'Khách hàng', value: stats.users, icon: <Users size={24} />, color: 'bg-orange-500', textColor: 'text-orange-500' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-black italic uppercase tracking-wide text-gray-900">Tổng Quan</h1>
                <p className="text-gray-500 font-medium mt-2">Theo dõi các chỉ số hoạt động kinh doanh của cửa hàng.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 ${card.color} group-hover:scale-110 transition-transform duration-500`}></div>
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div>
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{card.title}</p>
                                <h3 className="text-2xl font-black text-gray-900">{card.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gray-50 ${card.textColor}`}>
                                {card.icon}
                            </div>
                        </div>
                        
                        <div className="text-xs font-medium text-gray-400 mt-4 relative z-10">
                            Cập nhật mới nhất
                        </div>
                    </div>
                ))}
            </div>

            {/* Welcome banner */}
            <div className="bg-surface-dark rounded-3xl p-8 relative overflow-hidden text-white shadow-xl">
                <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10 md:w-2/3">
                    <h2 className="text-2xl font-black mb-2">Chào mừng trở lại, Admin! 👋</h2>
                    <p className="text-gray-400 mb-6 leading-relaxed">Bạn có thể quản lý sản phẩm, đơn hàng và khách hàng của mình từ bảng điều khiển này. Hãy giữ cho cửa hàng luôn hoạt động hiệu quả nhé.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
