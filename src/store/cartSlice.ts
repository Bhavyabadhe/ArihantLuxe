import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
}

// Load initial state from localStorage
const loadCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem('styledora_cart');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const initialState: CartState = { items: loadCart() };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Omit<CartItem, 'quantity'>>) {
      const existing = state.items.find(i => i.id === action.payload.id && i.size === action.payload.size && i.color === action.payload.color);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
      localStorage.setItem('styledora_cart', JSON.stringify(state.items));
    },
    removeFromCart(state, action: PayloadAction<{ id: number; size: string; color: string }>) {
      state.items = state.items.filter(i => !(i.id === action.payload.id && i.size === action.payload.size && i.color === action.payload.color));
      localStorage.setItem('styledora_cart', JSON.stringify(state.items));
    },
    updateQuantity(state, action: PayloadAction<{ id: number; size: string; color: string; quantity: number }>) {
      const item = state.items.find(i => i.id === action.payload.id && i.size === action.payload.size && i.color === action.payload.color);
      if (item) item.quantity = action.payload.quantity;
      localStorage.setItem('styledora_cart', JSON.stringify(state.items));
    },
    clearCart(state) {
      state.items = [];
      localStorage.removeItem('styledora_cart');
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
