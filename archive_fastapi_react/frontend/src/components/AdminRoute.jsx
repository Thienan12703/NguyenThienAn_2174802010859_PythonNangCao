import { Navigate } from 'react-router-dom';
import useUserStore from '../stores/userStore';

const AdminRoute = ({ children }) => {
    const user = useUserStore((state) => state.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
