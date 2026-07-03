import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, ArrowRight } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import useUserStore from '../stores/userStore';

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const login = useUserStore((state) => state.login);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!isValidEmail(email)) {
            return setError('Email không hợp lệ');
        }
        if (!password) {
            return setError('Vui lòng nhập mật khẩu');
        }

        setLoading(true);
        setError(null);
        try {
            const { data } = await axiosClient.post('/api/auth/login', { email, password });
            login(data);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-black/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-[2rem] shadow-xl border border-gray-100 z-10 relative">
                <div className="text-center">
                    <div className="w-16 h-16 bg-surface-dark text-primary rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                        <LogIn size={32} className="-rotate-3" />
                    </div>
                    <h2 className="text-3xl font-black italic uppercase tracking-wide text-gray-900">
                        Đăng Nhập
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 font-medium">
                        Mừng bạn trở lại với VLU Badminton
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={submitHandler}>
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl font-medium text-sm">
                            <AlertCircle size={18} className="shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
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
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-gray-700">Mật khẩu</label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`group w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white uppercase tracking-wide transition-all ${
                            loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-surface-dark hover:bg-black shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5'
                        }`}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                Đăng nhập <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600 font-medium">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="font-bold text-primary hover:text-green-500 hover:underline transition-colors">
                        Đăng ký ngay
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
