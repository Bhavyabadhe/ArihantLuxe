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
  badge?: string;
  stock?: number;
  size?: string[];
  color?: string[];
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch();

  // Safely resolve the primary image from images array, image, or imageUrl
  const rawImage =
    (Array.isArray(product.images) && product.images[0]) ||
    product.imageUrl ||
    product.image;
  const mainImage = Array.isArray(rawImage)
    ? rawImage[0]
    : typeof rawImage === 'string' && rawImage.includes(',')
    ? rawImage.split(',')[0].trim()
    : rawImage || 'https://placehold.co/600x600/png';

  // Use the slug from the database row, falling back to id if not present
  const slug = product.slug || String(product.id);
  const numericPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;

  return (
    <div className="product-card">
      <Link to={`/product/${slug}`} state={{ product }}>
        <div className="product-img-wrap">
          {product.badge && <span className="product-badge">{product.badge}</span>}
          <img className="product-img" src={mainImage} alt={product.name} />
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
                    size: product.size?.[0] || 'M',
                    color: product.color?.[0] || 'Black',
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