import { create } from 'zustand';

const useCartStore = create((set, get) => ({
    items: JSON.parse(localStorage.getItem('cartItems') || '[]'),
    addToCart: (product) => {
        const qtyToAdd = product.quantity || 1;
        const existingItem = get().items.find((item) => item._id === product._id);
        const updatedItems = existingItem
            ? get().items.map((item) =>
                item._id === product._id
                    ? { ...item, quantity: item.quantity + qtyToAdd }
                    : item
            )
            : [...get().items, { ...product, quantity: qtyToAdd }];
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
        set({ items: updatedItems });
    },
    removeFromCart: (productId) => {
        const updatedItems = get().items.filter((item) => item._id !== productId);
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
        set({ items: updatedItems });
    },
    updateQuantity: (productId, quantity) => {
        const updatedItems = get().items.map((item) =>
            item._id === productId ? { ...item, quantity } : item
        ).filter((it) => it.quantity > 0);
        localStorage.setItem('cartItems', JSON.stringify(updatedItems));
        set({ items: updatedItems });
    },
    clearCart: () => {
        localStorage.removeItem('cartItems');
        set({ items: [] });
    },
}));

export default useCartStore;
