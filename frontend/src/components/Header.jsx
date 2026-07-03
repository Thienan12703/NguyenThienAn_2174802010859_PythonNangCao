import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Search, ShoppingCart, User as UserIcon, Menu, X, LogOut, LayoutDashboard, Package } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import useCartStore from '../stores/cartStore';
import useUserStore from '../stores/userStore';

const Header = () => {
    const cartItems = useCartStore((state) => state.items);
    const user = useUserStore((state) => state.user);
    const logout = useUserStore((state) => state.logout);
    const setUser = useUserStore((state) => state.setUser);
    const token = user?.token;
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) return;
            try {
                const { data } = await axiosClient.get('/api/auth/profile');
                setUser({ ...data, token });
            } catch (_) {
                logout();
            }
        };
        fetchProfile();
    }, [token, logout, setUser]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchKeyword.trim()) {
            navigate(`/products?keyword=${searchKeyword}`);
            setIsMenuOpen(false);
        }
    };

    return (
        <header className="bg-surface-dark text-white sticky top-0 z-50 border-b border-gray-800 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-2xl font-black italic tracking-wider flex items-center gap-2">
                            SMASH<span className="text-primary">PRO</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        <Link to="/" className="hover:text-primary transition-colors font-medium">Trang Chủ</Link>
                        <Link to="/products" className="hover:text-primary transition-colors font-medium">Sản Phẩm</Link>
                        <Link to="/products?category=vot-cau-long" className="hover:text-primary transition-colors font-medium">Vợt</Link>
                        <Link to="/products?category=giay-cau-long" className="hover:text-primary transition-colors font-medium">Giày</Link>
                        <Link to="/posts" className="hover:text-primary transition-colors font-medium">Bài viết</Link>
                    </nav>

                    {/* Desktop Search & Actions */}
                    <div className="hidden md:flex items-center space-x-6">
                        <form onSubmit={handleSearch} className="relative">
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm..." 
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="bg-gray-900 border border-gray-700 text-white text-sm rounded-full pl-4 pr-10 py-2 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-48 transition-all"
                            />
                            <button type="submit" className="absolute right-3 top-2.5 text-gray-400 hover:text-primary">
                                <Search size={18} />
                            </button>
                        </form>

                        <Link to="/cart" className="relative text-gray-300 hover:text-primary transition-colors">
                            <ShoppingCart size={24} />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="relative">
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center space-x-2 text-gray-300 hover:text-primary transition-colors focus:outline-none"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                                        <UserIcon size={18} />
                                    </div>
                                    <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                                </button>

                                {isProfileOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                        {user.role === 'admin' && (
                                            <Link to="/admin" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100">
                                                <LayoutDashboard size={16} className="mr-2 text-gray-500" /> Admin Dashboard
                                            </Link>
                                        )}
                                        <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100">
                                            <UserIcon size={16} className="mr-2 text-gray-500" /> Tài khoản của tôi
                                        </Link>
                                        <Link to="/orders" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm hover:bg-gray-100">
                                            <Package size={16} className="mr-2 text-gray-500" /> Đơn mua
                                        </Link>
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button onClick={() => { logout(); setIsProfileOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                            <LogOut size={16} className="mr-2" /> Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="text-sm font-medium text-black bg-primary px-4 py-2 rounded-full hover:bg-primary-light transition-colors">
                                Đăng nhập
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-4">
                        <Link to="/cart" className="relative text-gray-300 hover:text-primary">
                            <ShoppingCart size={24} />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-white">
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-surface-dark border-t border-gray-800 absolute w-full">
                    <div className="px-4 pt-4 pb-6 space-y-4">
                        <form onSubmit={handleSearch} className="relative mb-6">
                            <input 
                                type="text" 
                                placeholder="Tìm kiếm..." 
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded-md pl-4 pr-10 py-3 focus:outline-none focus:border-primary"
                            />
                            <button type="submit" className="absolute right-3 top-3 text-gray-400">
                                <Search size={20} />
                            </button>
                        </form>

                        <div className="flex flex-col space-y-4">
                            <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-primary font-medium text-lg">Trang Chủ</Link>
                            <Link to="/products" onClick={() => setIsMenuOpen(false)} className="text-gray-300 hover:text-primary font-medium text-lg">Tất cả sản phẩm</Link>
                            
                            {user ? (
                                <>
                                    <div className="border-t border-gray-800 pt-4 mt-2">
                                        <div className="flex items-center space-x-3 mb-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                                                <UserIcon size={20} />
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                        {user.role === 'admin' && (
                                            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-300 hover:text-primary">Admin Dashboard</Link>
                                        )}
                                        <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-300 hover:text-primary">Tài khoản</Link>
                                        <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="block py-2 text-gray-300 hover:text-primary">Đơn hàng</Link>
                                        <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block py-2 text-red-500 hover:text-red-400 w-full text-left">Đăng xuất</button>
                                    </div>
                                </>
                            ) : (
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block text-center bg-primary text-black font-bold py-3 rounded-md mt-4">
                                    Đăng nhập
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
