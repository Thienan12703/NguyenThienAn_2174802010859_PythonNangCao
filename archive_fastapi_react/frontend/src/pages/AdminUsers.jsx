import { useEffect, useState } from 'react';
import { Users, AlertCircle, Shield, User, Save, CheckCircle2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savingId, setSavingId] = useState(null);
    const [successId, setSuccessId] = useState(null);

    const fetchUsers = async () => {
        try {
            const { data } = await axiosClient.get('/api/users');
            setUsers(data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = (userId, role) => {
        setUsers((current) => current.map((user) => (user._id === userId ? { ...user, role } : user)));
    };

    const saveRole = async (userId) => {
        const user = users.find((u) => u._id === userId);
        if (!user) return;
        setSavingId(userId);
        setError(null);
        setSuccessId(null);

        try {
            const { data } = await axiosClient.put(`/api/users/${userId}`, { role: user.role });
            setUsers((current) => current.map((u) => (u._id === userId ? data : u)));
            setSuccessId(userId);
            setTimeout(() => setSuccessId(null), 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setSavingId(null);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-black italic uppercase tracking-wide text-gray-900">Người Dùng</h1>
                <p className="text-gray-500 font-medium mt-2">Quản lý tài khoản và phân quyền người dùng hệ thống.</p>
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
                        <Users size={20} className="text-gray-500" />
                        Danh sách người dùng
                    </h2>
                    <span className="bg-primary/20 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                        {users.length} tài khoản
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 font-bold text-gray-600 text-sm">Người dùng</th>
                                <th className="p-4 font-bold text-gray-600 text-sm">Vai trò</th>
                                <th className="p-4 font-bold text-gray-600 text-sm text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-surface-dark text-primary flex items-center justify-center font-bold shrink-0">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{user.name}</h3>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {user.role === 'admin' ? (
                                                <Shield size={16} className="text-purple-600" />
                                            ) : (
                                                <User size={16} className="text-blue-600" />
                                            )}
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)} 
                                                className={`px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary font-medium text-sm transition-colors ${
                                                    user.role === 'admin' 
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200' 
                                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}
                                            >
                                                <option value="user">Khách hàng (User)</option>
                                                <option value="admin">Quản trị (Admin)</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => saveRole(user._id)}
                                                disabled={savingId === user._id}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                                    successId === user._id
                                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                                    : savingId === user._id
                                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                    : 'bg-surface-dark text-white hover:bg-black shadow-md'
                                                }`}
                                            >
                                                {successId === user._id ? (
                                                    <><CheckCircle2 size={16} /> Đã lưu</>
                                                ) : savingId === user._id ? (
                                                    <><div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div> Lưu...</>
                                                ) : (
                                                    <><Save size={16} /> Lưu</>
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
