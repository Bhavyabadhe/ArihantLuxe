import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

// Helper to normalize images from any format (array, comma-separated, JSON array string)
function extractImages(prod: any): string[] {
  if (!prod) return ['https://placehold.co/600x600/png'];

  // 1. Prisma `images` column (String[])
  if (Array.isArray(prod.images) && prod.images.length > 0) {
    return prod.images.filter(Boolean);
  }

  // 2. Array in `image` or `imageUrl`
  const raw = prod.image || prod.imageUrl;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.filter(Boolean);
  }

  // 3. String that might be comma-separated or JSON string
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch { }
    }
    if (trimmed.includes(',')) {
      return trimmed.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (trimmed) {
      return [trimmed];
    }
  }

  return ['https://placehold.co/600x600/png'];
}

export default function ProductDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  // Instant prefill from router state if user navigated from homepage
  const passedProduct = (location.state as any)?.product;
  const [product, setProduct] = useState<any>(passedProduct || null);
  const [loading, setLoading] = useState<boolean>(!passedProduct);
  const [addedMessage, setAddedMessage] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;

    // Background validation / refresh
    fetch(`/api/products/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        if (isMounted && data && !data.error) {
          setProduct(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        if (isMounted && !passedProduct) {
          setProduct(null);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slug, passedProduct]);

  if (loading) {
    return (
      <div className="product-detail" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="serif" style={{ fontSize: '1.5rem', letterSpacing: '0.15em', marginBottom: '1rem' }}>
            Arihant Luxe
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Preparing piece...
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <h2 className="serif" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Piece Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>The requested piece could not be located in our collection.</p>
        <Link to="/" className="hero-btn">
          Return to Collection
        </Link>
      </div>
    );
  }

  const allImages = extractImages(product);
  const currentImage = allImages[activeImageIndex] || allImages[0];
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;
  const sizes = Array.isArray(product.size) && product.size.length > 0 ? product.size : ['M', 'L', 'XL', 'XXL'];
  const colors = Array.isArray(product.color) && product.color.length > 0 ? product.color : ['Black', 'White', 'Beige'];

  // Check if product is jewellery
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

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: Number(product.id) || 1,
        name: product.name,
        price: price,
        image: currentImage,
        size: isJewellery ? '' : selectedSize,
        color: isJewellery ? '' : selectedColor,
      })
    );
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2500);
  };

  return (
    <div className="product-detail">
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
          ← Back to Collection
        </Link>
      </div>

      <div className="detail-grid">
        {/* Left: Product Images with Multi-Image Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Main Hero Image */}
          <div className="detail-img-wrap" style={{ position: 'relative', overflow: 'hidden', borderRadius: '4px', background: 'var(--bg-alt)' }}>
            {product.badge && <span className="product-badge">{product.badge}</span>}
            <img
              src={currentImage}
              alt={product.name}
              style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', transition: 'all 0.3s ease' }}
            />
          </div>

          {/* Thumbnails Strip (displays whenever there are 2 or more images) */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', padding: '0.25rem 0' }}>
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    border: activeImageIndex === idx ? '2px solid var(--text)' : '1px solid var(--border)',
                    padding: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    width: '74px',
                    height: '96px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    opacity: activeImageIndex === idx ? 1 : 0.55,
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (activeImageIndex !== idx) e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    if (activeImageIndex !== idx) e.currentTarget.style.opacity = '0.55';
                  }}
                >
                  <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="detail-info">
          {product.category && (
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', fontWeight: 600 }}>
              {product.category}
            </span>
          )}

          <h1 className="serif">{product.name}</h1>
          <p className="detail-price">Rs.{price.toFixed(2)}</p>

          <p className="detail-desc">
            {product.description || 'Crafted with premium materials and signature minimalist aesthetics. Designed for durability, comfort, and timeless elegance.'}
          </p>

          {/* Size Selector (Hidden for Jewellery) */}
          {!isJewellery && (
            <div style={{ marginTop: '1.5rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, display: 'block', marginBottom: '0.6rem' }}>
                Select Size: {selectedSize}
              </span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {sizes.map((s: string) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    style={{
                      padding: '0.6rem 1.2rem',
                      border: selectedSize === s ? '1px solid var(--text)' : '1px solid var(--border)',
                      background: selectedSize === s ? 'var(--text)' : 'transparent',
                      color: selectedSize === s ? '#fff' : 'var(--text)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      letterSpacing: '0.05em',
                      transition: 'var(--transition)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector (Hidden for Jewellery) */}
          {!isJewellery && (
            <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, display: 'block', marginBottom: '0.6rem' }}>
                Color: {selectedColor}
              </span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {colors.map((c: string) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    style={{
                      padding: '0.5rem 1rem',
                      border: selectedColor === c ? '1px solid var(--accent)' : '1px solid var(--border)',
                      background: selectedColor === c ? 'var(--bg-alt)' : 'transparent',
                      color: 'var(--text)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      transition: 'var(--transition)',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            type="button"
            className="add-to-cart-large"
            style={{ marginTop: isJewellery ? '2.5rem' : '0' }}
            onClick={handleAddToCart}
          >
            {addedMessage ? '✓ Added to Shopping Bag' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </div>
  );
}
