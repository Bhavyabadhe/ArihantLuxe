import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword as fbSignIn,
  createUserWithEmailAndPassword as fbSignUp,
  updateProfile as fbUpdateProfile,
  type Auth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCFJN6c3-wh-M4eL6au660-ZvJWhSRKEv4",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "arihant-488d5.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "arihant-488d5",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "arihant-488d5.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "354860136870",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:354860136870:web:9f609eb61ef4b4c595f767",
  measurementId: "G-EC8R2YJWJP",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image: string;
  publishDate: string;
  createdAt?: number;
}

export interface OrderDoc {
  id: string;
  userEmail: string;
  userFullName: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    image: string;
    size: string;
    color: string;
    quantity: number;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: {
    email: string;
    fullName: string;
    address: string;
    city: string;
    country: string;
  };
  status: string;
  paymentMethod: 'online' | 'cod';
  createdAt: number;
  paymentId?: string;
}

// Local User Store Fallback (in case Firebase Email/Password is not enabled in Firebase Console)
const LOCAL_USERS_KEY = 'arihant_auth_users';

export function getLocalUsers(): Record<string, { email: string; passwordHash: string; fullName: string }> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveLocalUser(email: string, passwordHash: string, fullName: string) {
  const users = getLocalUsers();
  users[email.toLowerCase()] = { email: email.toLowerCase(), passwordHash, fullName };
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

// Seamless hybrid login: tries Firebase first, falls back to local user store
export async function authenticateUser(email: string, password: string): Promise<{ email: string; fullName: string }> {
  try {
    const cred = await fbSignIn(auth, email, password);
    return {
      email: cred.user.email || email,
      fullName: cred.user.displayName || email.split('@')[0] || 'User',
    };
  } catch (error: any) {
    // Check if user exists in local store fallback
    const users = getLocalUsers();
    const existing = users[email.toLowerCase()];
    if (existing && existing.passwordHash === password) {
      return { email: existing.email, fullName: existing.fullName };
    }

    if (
      error.code === 'auth/invalid-credential' ||
      error.code === 'auth/user-not-found' ||
      error.code === 'auth/wrong-password' ||
      error.code === 'auth/invalid-email'
    ) {
      throw new Error('Invalid email or password.');
    }
    if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later.');
    }
    throw new Error(error.message || 'Login failed. Please check your credentials.');
  }
}

// Seamless hybrid register: tries Firebase first, falls back to local user store if provider not enabled in Firebase console
export async function registerUser(email: string, password: string, fullName: string): Promise<{ email: string; fullName: string }> {
  try {
    const cred = await fbSignUp(auth, email, password);
    if (cred.user) {
      await fbUpdateProfile(cred.user, { displayName: fullName });
    }
    saveLocalUser(email, password, fullName);
    return { email, fullName };
  } catch (error: any) {
    if (
      error.code === 'auth/operation-not-allowed' ||
      error.code === 'auth/network-request-failed' ||
      error.code === 'auth/internal-error' ||
      error.code === 'auth/configuration-not-found' ||
      error.code === 'auth/admin-restricted-operation'
    ) {
      const users = getLocalUsers();
      if (users[email.toLowerCase()]) {
        throw new Error('An account with this email address already exists.');
      }
      saveLocalUser(email, password, fullName);
      return { email, fullName };
    }
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email address already exists.');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters.');
    }
    throw new Error(error.message || 'Registration failed. Please try again.');
  }
}

export async function createUserProfile(profile: { email: string; fullName: string }): Promise<void> {
  try {
    const existing = JSON.parse(localStorage.getItem('arihant_user_profiles') || '{}');
    existing[profile.email] = { ...profile, updatedAt: Date.now() };
    localStorage.setItem('arihant_user_profiles', JSON.stringify(existing));
  } catch (err) {
    console.warn('Failed to save profile:', err);
  }
}

export async function getUserOrders(email: string): Promise<(OrderDoc & { id: string })[]> {
  try {
    const allOrders: (OrderDoc & { id: string })[] = JSON.parse(localStorage.getItem('arihant_orders') || '[]');
    return allOrders.filter(o => o.userEmail.toLowerCase() === email.toLowerCase());
  } catch {
    return [];
  }
}

export async function createOrder(orderData: Omit<OrderDoc, 'id'>): Promise<string> {
  const id = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  const newOrder: OrderDoc & { id: string } = { ...orderData, id };
  try {
    const allOrders: (OrderDoc & { id: string })[] = JSON.parse(localStorage.getItem('arihant_orders') || '[]');
    allOrders.unshift(newOrder);
    localStorage.setItem('arihant_orders', JSON.stringify(allOrders));
  } catch (err) {
    console.error('Failed to save order to storage:', err);
  }
  return id;
}

export async function updateOrderStatus(orderId: string, updates: Partial<OrderDoc>): Promise<void> {
  try {
    const allOrders: (OrderDoc & { id: string })[] = JSON.parse(localStorage.getItem('arihant_orders') || '[]');
    const index = allOrders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      allOrders[index] = { ...allOrders[index], ...updates };
      localStorage.setItem('arihant_orders', JSON.stringify(allOrders));
    }
  } catch (err) {
    console.error('Failed to update order status:', err);
  }
}

// Initial blog articles
const INITIAL_POSTS: BlogPost[] = [
  {
    id: 'the-art-of-slow-craftsmanship',
    title: 'The Art of Slow Craftsmanship',
    excerpt: 'Exploring why mindful design, premium natural textiles, and intentional tailoring endure past seasonal trends.',
    content: `
      <p>In a world defined by the velocity of consumption, slow craftsmanship represents a considered rebellion.</p>
      <h3>Mindful Textiles</h3>
      <p>Every piece in our collection begins with fiber choice. Breathable organic cotton blends, calibrated draping, and structured silhouettes form our aesthetic foundation.</p>
    `,
    category: 'Craftsmanship',
    author: 'Arihant Luxe Editorial',
    image: 'https://images.unsplash.com/photo-1594736297302-01768cbd3a42?w=800',
    publishDate: 'November 10, 2026',
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'modern-minimalism-and-streetwear',
    title: 'Modern Minimalism & Streetwear Intersections',
    excerpt: 'How contemporary street silhouettes blend seamlessly with refined luxury wardrobe staples.',
    content: `
      <p>Streetwear and high fashion have dissolved their traditional boundaries. Oversized silhouettes, iconic cultural motifs, and relaxed proportions now coexist with clean tailoring.</p>
    `,
    category: 'Style',
    author: 'Arihant Luxe Editorial',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    publishDate: 'November 8, 2026',
    createdAt: Date.now() - 86400000 * 4,
  }
];

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const stored = localStorage.getItem('arihant_blog_posts');
    if (!stored) {
      localStorage.setItem('arihant_blog_posts', JSON.stringify(INITIAL_POSTS));
      return INITIAL_POSTS;
    }
    return JSON.parse(stored);
  } catch {
    return INITIAL_POSTS;
  }
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find(p => p.id === id) || null;
}

export async function createOrUpdateBlogPost(postData: any): Promise<void> {
  const posts = await getBlogPosts();
  const existingIndex = posts.findIndex(p => p.id === postData.id);
  if (existingIndex !== -1) {
    posts[existingIndex] = { ...posts[existingIndex], ...postData };
  } else {
    posts.unshift(postData);
  }
  localStorage.setItem('arihant_blog_posts', JSON.stringify(posts));
}

export async function deleteBlogPost(id: string): Promise<void> {
  const posts = await getBlogPosts();
  const filtered = posts.filter(p => p.id !== id);
  localStorage.setItem('arihant_blog_posts', JSON.stringify(filtered));
}

// Bind to window for global runtime access
if (typeof window !== 'undefined') {
  const g = window as any;
  g.auth = auth;
  g.createUserWithEmailAndPassword = fbSignUp;
  g.signInWithEmailAndPassword = fbSignIn;
  g.updateProfile = fbUpdateProfile;
  g.createUserProfile = createUserProfile;
  g.getUserOrders = getUserOrders;
  g.createOrder = createOrder;
  g.updateOrderStatus = updateOrderStatus;
  g.getBlogPosts = getBlogPosts;
  g.getBlogPostById = getBlogPostById;
  g.createOrUpdateBlogPost = createOrUpdateBlogPost;
  g.deleteBlogPost = deleteBlogPost;
}
