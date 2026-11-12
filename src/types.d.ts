interface BlogPost {
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

interface OrderDoc {
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

declare var auth: any;
declare var createUserWithEmailAndPassword: (auth: any, email: string, password: string) => Promise<any>;
declare var signInWithEmailAndPassword: (auth: any, email: string, password: string) => Promise<any>;
declare var updateProfile: (user: any, profile: { displayName?: string; photoURL?: string }) => Promise<void>;
declare var createUserProfile: (profile: { email: string; fullName: string }) => Promise<void>;
declare var getUserOrders: (email: string) => Promise<(OrderDoc & { id: string })[]>;
declare var createOrder: (orderData: Omit<OrderDoc, 'id'>) => Promise<string>;
declare var updateOrderStatus: (orderId: string, updates: Partial<OrderDoc>) => Promise<void>;
declare var getBlogPosts: () => Promise<BlogPost[]>;
declare var getBlogPostById: (id: string) => Promise<BlogPost | null>;
declare var createOrUpdateBlogPost: (postData: any) => Promise<void>;
declare var deleteBlogPost: (id: string) => Promise<void>;

