import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { addToCart } from '../store/cartSlice';

// 1. Updated interface to match your Prisma database schema
export interface Product {
  id: number | string;
  slug?: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string | string[];
  images?: string[];
  imageUrl?: string;
  badge?: string | null;
  stock?: number;
  size?: string[];
  color?: string[];
  createdAt?: string | Date;
}

interface ProductCardProps {
  product: Product;
}

// Helper to reliably extract the primary image without corrupting data URLs (e.g. data:image/...;base64,...)
function resolveMainImage(product: Product): string {
  if (!product) return 'https://placehold.co/600x600/png';

  // 1. Check images array
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first = product.images.find((img) => typeof img === 'string' && img.trim().length > 0);
    if (first) {
      const trimmed = first.trim();
      if (trimmed.startsWith('data:image/')) return trimmed;
      if (trimmed.includes(',') && !trimmed.startsWith('data:')) return trimmed.split(',')[0].trim();
      return trimmed;
    }
  }

  // 2. Check imageUrl or image
  const raw = product.imageUrl || product.image;
  if (Array.isArray(raw) && raw.length > 0) {
    const first = raw.find((img) => typeof img === 'string' && img.trim().length > 0);
    if (first) return first.trim();
  }

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('data:image/')) return trimmed;
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed.find((img: any) => typeof img === 'string' && img.trim().length > 0);
          if (first) return first.trim();
        }
      } catch { }
    }
    if (trimmed.includes(',') && !trimmed.startsWith('data:')) {
      return trimmed.split(',')[0].trim();
    }
    if (trimmed) return trimmed;
  }

  return 'https://placehold.co/600x600/png';
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();

  const mainImage = resolveMainImage(product);

  const slug = product.slug || String(product.id);
  const numericPrice =
    typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;

  const categoryLower = (product.category || '').toLowerCase().trim();
  const isJewellery =
    categoryLower.includes('jewel') ||
    categoryLower === 'jewellery' ||
    categoryLower === 'jewelry' ||
    categoryLower === 'ring' ||
    categoryLower === 'necklace' ||
    categoryLower === 'earring' ||
    categoryLower === 'bracelet' ||
    categoryLower === 'ornament';

  return (
    <div className="product-card">
      <Link to={`/product/${slug}`} state={{ product }}>
        <div className="product-img-wrap">
          {product.badge && <span className="product-badge">{product.badge}</span>}
          <img
            className="product-img"
            src={mainImage}
            alt={product.name}
            loading="lazy"
            decoding="async"
          />
          <div className="product-actions">
            <button
              className="quick-add-btn"
              onClick={(e) => {
                e.preventDefault();
                dispatch(
                  addToCart({
                    id: Number(product.id) || 1,
                    name: product.name,
                    price: numericPrice,
                    image: mainImage,
                    size: isJewellery ? '' : product.size?.[0] || '',
                    color: isJewellery ? '' : product.color?.[0] || '',
                  })
                );
              }}
            >
              Quick Add
            </button>
          </div>
        </div>
      </Link>
      <Link to={`/product/${slug}`} state={{ product }} className="product-info">
        <span className="product-category">{product.category}</span>
        <span className="product-name">{product.name}</span>
        <span className="product-price">Rs.{numericPrice.toFixed(2)}</span>
      </Link>
    </div>
  );
}