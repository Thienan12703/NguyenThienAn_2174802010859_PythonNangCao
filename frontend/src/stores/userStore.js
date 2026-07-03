import { create } from 'zustand';

const initialUser = JSON.parse(localStorage.getItem('userInfo') || 'null');

const useUserStore = create((set) => ({
    user: initialUser,
    login: (userInfo) => {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        set({ user: userInfo });
    },
    setUser: (userInfo) => {
        const currentToken = JSON.parse(localStorage.getItem('userInfo') || 'null')?.token;
        const updated = { ...userInfo, token: currentToken || userInfo.token };
        localStorage.setItem('userInfo', JSON.stringify(updated));
        set({ user: updated });
    },
    logout: () => {
        localStorage.removeItem('userInfo');
        set({ user: null });
    },
}));

export default useUserStore;
