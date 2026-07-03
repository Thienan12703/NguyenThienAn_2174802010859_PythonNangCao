import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Tags, ShoppingCart, Users, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import useUserStore from '../stores/userStore';

const AdminLayout = ({ children }) => {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const logout = useUserStore((state) => state.logout);

    const navItems = [
        { path: '/admin', label: 'Tổng quan', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/products', label: 'Sản phẩm', icon: <Package size={20} /> },
        { path: '/admin/categories', label: 'Danh mục', icon: <Tags size={20} /> },
        { path: '/admin/orders', label: 'Đơn hàng', icon: <ShoppingCart size={20} /> },
        { path: '/admin/users', label: 'Người dùng', icon: <Users size={20} /> },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <aside 
                className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-surface-dark text-white flex flex-col transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="p-6 flex items-center justify-between border-b border-white/10">
                    <Link to="/" className="text-2xl font-black italic tracking-wide text-primary">
                        VLU<span className="text-white text-lg ml-1">ADMIN</span>
                    </Link>
                    <button onClick={toggleSidebar} className="lg:hidden text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4">
                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link 
                                    key={item.path} 
                                    to={item.path} 
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                                        isActive 
                                        ? 'bg-primary text-black shadow-[0_4px_14px_0_rgba(57,255,20,0.2)]' 
                                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-4 border-t border-white/10">
                    <button 
                        onClick={logout} 
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-bold text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut size={20} />
                        Đăng xuất
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top Header Mobile */}
                <header className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between lg:hidden sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button onClick={toggleSidebar} className="text-gray-600 hover:text-primary transition-colors">
                            <Menu size={24} />
                        </button>
                        <span className="font-bold text-gray-900">Admin Panel</span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
