import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
  email: string;
  fullName?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

const getSavedUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('arihant_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

const savedUser = getSavedUser();

const initialState: AuthState = {
  user: savedUser,
  isAuthenticated: !!savedUser,
  isInitialized: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isInitialized = true;
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('arihant_user', JSON.stringify(action.payload));
        } catch (err) {
          console.warn('Failed to save user in storage:', err);
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitialized = true;
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('arihant_user');
        } catch (err) {
          console.warn('Failed to clear user from storage:', err);
        }
      }
    },
    setInitialized: (state) => {
      state.isInitialized = true;
    }
  },
});

export const { login, logout, setInitialized } = authSlice.actions;
export default authSlice.reducer;
