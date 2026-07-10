import { useEffect, useState } from 'react';
import { User, Mail, Lock, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import useUserStore from '../stores/userStore';

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const Profile = () => {
    const user = useUserStore((state) => state.user);
    const login = useUserStore((state) => state.login);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            return setError('Vui lòng nhập họ tên');
        }
        if (!isValidEmail(email)) {
            return setError('Email không hợp lệ');
        }
        if (password && password.length < 6) {
            return setError('Mật khẩu mới phải có ít nhất 6 ký tự');
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { data } = await axiosClient.put('/api/auth/profile', {
                name,
                email,
                password: password || undefined,
            });
            login(data);
            setMessage('Cập nhật hồ sơ thành công');
            setPassword('');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-black italic tracking-wide uppercase mb-8">
                Hồ Sơ Của Tôi
            </h1>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="md:flex">
                    {/* Sidebar / Avatar Area */}
                    <div className="md:w-1/3 bg-surface-dark p-8 text-center text-white flex flex-col items-center justify-center">
                        <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mb-6 border-4 border-primary">
                            <User size={64} className="text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold line-clamp-1">{user?.name}</h2>
                        <p className="text-gray-400 mt-2 text-sm">{user?.email}</p>
                        <div className="mt-6 px-4 py-2 bg-white/10 rounded-full text-sm font-medium border border-white/20">
                            Thành viên VLU Badminton
                        </div>
                    </div>

                    {/* Form Area */}
                    <div className="md:w-2/3 p-8 md:p-10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h3 className="text-xl font-bold border-b border-gray-100 pb-4 mb-6">Cập nhật thông tin</h3>
                            
                            {error && (
                                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl font-medium text-sm animate-fadeIn">
                                    <AlertCircle size={18} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            {message && (
                                <div className="flex items-center gap-2 p-4 bg-green-50 text-green-600 rounded-xl font-medium text-sm animate-fadeIn">
                                    <CheckCircle2 size={18} className="shrink-0" />
                                    {message}
                                </div>
                            )}

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Họ và tên</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                            <User size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                            <Mail size={20} />
                                        </div>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Mật khẩu mới</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                            <Lock size={20} />
                                        </div>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Để trống nếu không muốn đổi mật khẩu"
                                            className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">Mật khẩu phải có ít nhất 6 ký tự.</p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-8 border border-transparent text-sm font-bold rounded-xl text-white uppercase tracking-wide transition-all ${
                                        loading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-surface-dark hover:bg-black shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:-translate-y-0.5'
                                    }`}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Save size={18} /> Cập nhật hồ sơ
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
