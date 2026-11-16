import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import ProductCard, { Product } from '../components/ProductCard';

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
    if (trimmed.startsWith('data:image/')) {
      return [trimmed];
    }
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.filter(Boolean);
      } catch { }
    }
    if (trimmed.includes(',') && !trimmed.startsWith('data:')) {
      return trimmed.split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (trimmed) {
      return [trimmed];
    }
  }

  return ['https://placehold.co/600x600/png'];
}

interface CustomerReview {
  id: number | string;
  name: string;
  city: string;
  rating: number;
  date: string;
  verified: boolean;
  title: string;
  comment: string;
  helpful: number;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  // Instant prefill from router state if user navigated from catalog
  const passedProduct = (location.state as any)?.product;
  const [product, setProduct] = useState<any>(passedProduct || null);
  const [loading, setLoading] = useState<boolean>(!passedProduct);
  const [addedMessage, setAddedMessage] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');

  // Related products from collection
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string>('specs');

  // Customer Reviews state
  const [userReviews, setUserReviews] = useState<CustomerReview[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewCity, setReviewCity] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [helpfulClicked, setHelpfulClicked] = useState<{ [key: string]: boolean }>({});

  // Background fetch product data
  useEffect(() => {
    if (!slug) return;

    let isMounted = true;

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

  // Sync selected size/color when product loads
  useEffect(() => {
    if (product) {
      if (Array.isArray(product.size) && product.size.length > 0) {
        setSelectedSize(product.size[0]);
      }
      if (Array.isArray(product.color) && product.color.length > 0) {
        setSelectedColor(product.color[0]);
      }
    }
  }, [product]);

  // Fetch related products from database
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const others = data.filter(
            (p: any) => String(p.id) !== String(product?.id) && p.slug !== slug
          );
          setRelatedProducts(others.slice(0, 4));
        }
      })
      .catch(() => {});
  }, [slug, product?.id]);

  // Category classification
  const categoryLower = (product?.category || '').toLowerCase().trim();
  const isJewellery =
    categoryLower.includes('jewel') ||
    categoryLower === 'jewellery' ||
    categoryLower === 'jewelry' ||
    categoryLower === 'ring' ||
    categoryLower === 'necklace' ||
    categoryLower === 'earring' ||
    categoryLower === 'bracelet' ||
    categoryLower === 'ornament';

  // Seed default curated reviews based on product category
  const initialCuratedReviews = useMemo<CustomerReview[]>(() => {
    if (isJewellery) {
      return [
        {
          id: 1,
          name: 'Pooja Sharma',
          city: 'Mumbai',
          rating: 5,
          date: '3 days ago',
          verified: true,
          title: 'Exquisite antique gold finish! Pure royalty.',
          comment:
            'Ordered this for my sister’s Sangeet ceremony. The intricate Goddess Lakshmi and peacock motifs along with pearl clusters have a rich, authentic temple jewellery luster. It has substantial royal weight without being uncomfortable.',
          helpful: 24,
        },
        {
          id: 2,
          name: 'Ananya Singhania',
          city: 'New Delhi',
          rating: 5,
          date: '1 week ago',
          verified: true,
          title: 'Packaging was pure luxury, looks 10x more expensive in person!',
          comment:
            'Arrived in a beautiful cushioned royal velvet box with tamper-proof security sealing. The antique matte gold polish is breathtaking. My relatives genuinely thought it was 22KT gold heirloom jewellery!',
          helpful: 19,
        },
        {
          id: 3,
          name: 'Dr. Meenakshi Iyer',
          city: 'Bengaluru',
          rating: 5,
          date: '2 weeks ago',
          verified: true,
          title: 'Fast delivery & prompt WhatsApp verification',
          comment:
            'The direct UPI payment was instant and the package arrived in Bangalore in just 3 days via Bluedart Express. Every gemstone and cluster is firmly set and scratch-free. Highly recommend Arihant Luxe!',
          helpful: 15,
        },
        {
          id: 4,
          name: 'Sneha Kulkarni',
          city: 'Pune',
          rating: 5,
          date: '3 weeks ago',
          verified: true,
          title: 'Flawless bridal statement piece',
          comment:
            'Paired this with my bridal silk sari and it framed the neckline perfectly. Photographs beautifully with both natural and studio lighting. Worth every single rupee!',
          helpful: 11,
        },
      ];
    } else {
      return [
        {
          id: 1,
          name: 'Ritu Patel',
          city: 'Ahmedabad',
          rating: 5,
          date: '2 days ago',
          verified: true,
          title: 'Stunning embroidery and majestic drape',
          comment:
            'The detailed embroidery work on this piece is breathtaking! The fabric has a royal sheen yet remains lightweight, breathable, and comfortable throughout the evening. Truly couture grade.',
          helpful: 21,
        },
        {
          id: 2,
          name: 'Dr. Aarohi Verma',
          city: 'Jaipur',
          rating: 5,
          date: '1 week ago',
          verified: true,
          title: 'Perfect fit and magnificent color palette',
          comment:
            'True to size and the rich jewel tones look even more vibrant in person than in the pictures. Packaging was pristine and dispatch took less than 24 hours. Will definitely be a returning customer.',
          helpful: 18,
        },
        {
          id: 3,
          name: 'Kavita Sundaram',
          city: 'Chennai',
          rating: 5,
          date: '2 weeks ago',
          verified: true,
          title: 'Pure festive luxury – impeccable craftsmanship',
          comment:
            'The finishing, borders, and inner lining are top tier. Handcrafted elegance at its finest. Received countless compliments at our family reception!',
          helpful: 14,
        },
      ];
    }
  }, [isJewellery]);

  const allReviews = useMemo(() => {
    return [...userReviews, ...initialCuratedReviews];
  }, [userReviews, initialCuratedReviews]);

  if (loading) {
    return (
      <div className="product-detail" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="serif" style={{ fontSize: '1.75rem', letterSpacing: '0.15em', marginBottom: '0.75rem' }}>
            Arihant Luxe
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
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

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;

    const newRev: CustomerReview = {
      id: Date.now(),
      name: reviewAuthor.trim(),
      city: reviewCity.trim() || 'Verified Buyer',
      rating: reviewRating,
      date: 'Just now',
      verified: true,
      title: reviewTitle.trim() || 'Exceptional craftsmanship & quality',
      comment: reviewComment.trim(),
      helpful: 1,
    };

    setUserReviews([newRev, ...userReviews]);
    setReviewAuthor('');
    setReviewCity('');
    setReviewTitle('');
    setReviewComment('');
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewSuccess(false);
      setShowReviewForm(false);
    }, 2500);
  };

  const handleHelpfulClick = (id: number | string) => {
    if (helpfulClicked[String(id)]) return;
    setHelpfulClicked((prev) => ({ ...prev, [String(id)]: true }));
  };

  return (
    <div className="product-detail">
      {/* Breadcrumb Navigation */}
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase' }}>
          Collection
        </Link>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        {product.category && (
          <>
            <Link
              to={isJewellery ? '/jewellery' : '/fashion'}
              style={{ color: 'var(--text-muted)', textDecoration: 'none', textTransform: 'uppercase' }}
            >
              {product.category}
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
          </>
        )}
        <span style={{ color: 'var(--text)', fontWeight: 600 }}>{product.name}</span>
      </div>

      <div className="detail-grid">
        {/* Left: Product Images with Multi-Image Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Main Hero Image */}
          <div className="detail-img-wrap" style={{ position: 'relative', overflow: 'hidden', borderRadius: '6px', background: 'var(--bg-alt)' }}>
            {product.badge && <span className="product-badge">{product.badge}</span>}
            <img
              src={currentImage}
              alt={product.name}
              style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', transition: 'all 0.3s ease' }}
            />
          </div>

          {/* Thumbnails Strip */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', padding: '0.25rem 0' }}>
              {allImages.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  style={{
                    border: activeImageIndex === idx ? '2px solid var(--accent)' : '1px solid var(--border)',
                    padding: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    width: '74px',
                    height: '96px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    opacity: activeImageIndex === idx ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    if (activeImageIndex !== idx) e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    if (activeImageIndex !== idx) e.currentTarget.style.opacity = '0.6';
                  }}
                >
                  <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Commerce Actions */}
        <div className="detail-info">
          {product.category && (
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', fontWeight: 600 }}>
              {product.category}
            </span>
          )}

          <h1 className="serif" style={{ fontSize: '2.4rem', marginTop: '0.25rem', marginBottom: '0.5rem', lineHeight: 1.2 }}>
            {product.name}
          </h1>

          {/* Review Score & Star Teaser */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{ color: '#d97706', fontSize: '1rem', letterSpacing: '2px' }}>
              ★★★★★
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
              4.9
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ({allReviews.length} Verified Reviews)
            </span>
            <span style={{ fontSize: '0.75rem', background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
              ✓ In Stock & Ready to Ship
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1rem' }}>
            <p className="detail-price" style={{ margin: 0, fontSize: '1.9rem', fontWeight: 700, color: 'var(--accent)' }}>
              Rs.{price.toFixed(2)}
            </p>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Inclusive of all taxes & complimentary insured shipping
            </span>
          </div>

          <p className="detail-desc" style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {product.description ||
              'Crafted with premium materials and signature heritage aesthetics. Designed for longevity, radiant presence, and timeless elegance.'}
          </p>

          {/* Size Selector (Hidden for Jewellery) */}
          {!isJewellery && sizes.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}>
                  Select Size: {selectedSize}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer' }}>
                  Size Chart
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                {sizes.map((s: string) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    style={{
                      padding: '0.55rem 1.1rem',
                      border: selectedSize === s ? '1px solid var(--text)' : '1px solid var(--border)',
                      background: selectedSize === s ? 'var(--text)' : 'transparent',
                      color: selectedSize === s ? '#fff' : 'var(--text)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      letterSpacing: '0.05em',
                      borderRadius: '3px',
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
          {!isJewellery && colors.length > 0 && (
            <div style={{ marginTop: '1.25rem', marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                Color: {selectedColor}
              </span>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
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
                      borderRadius: '3px',
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
            style={{
              marginTop: isJewellery ? '1rem' : '0.5rem',
              width: '100%',
              padding: '1.1rem',
              fontSize: '0.9rem',
              letterSpacing: '0.15em',
              fontWeight: 700,
              textTransform: 'uppercase',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            }}
            onClick={handleAddToCart}
          >
            {addedMessage ? '✓ Added to Shopping Bag' : 'Add to Bag'}
          </button>

          {/* Trust Point: Guaranteed Safe Checkout & Payment Icons */}
          <div
            style={{
              marginTop: '1.75rem',
              padding: '1.25rem',
              background: 'linear-gradient(180deg, #faf8f5 0%, #f4f0eb 100%)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.95rem' }}>🔒</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text)' }}>
                Guaranteed Safe & Secure Checkout
              </span>
            </div>

            {/* Payment Method Badges Row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', alignItems: 'center' }}>
              {/* Google Pay */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  height: '28px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#3c4043' }}>GPay</span>
              </div>

              {/* PhonePe */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#5f259f',
                  color: '#ffffff',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  height: '28px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                }}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '-0.02em' }}>PhonePe</span>
              </div>

              {/* Paytm */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  height: '28px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#002e6e' }}>Pay</span>
                <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#00b9f5' }}>tm</span>
              </div>

              {/* UPI */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  height: '28px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <svg width="14" height="12" viewBox="0 0 32 24" fill="none">
                  <path d="M14 2L2 22h7l5-8.5 5 8.5h7L14 2z" fill="#097939" />
                  <path d="M22 2l-6 10 3.5 6 8.5-16h-6z" fill="#ed7524" />
                </svg>
                <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#2d3748', letterSpacing: '0.04em' }}>UPI</span>
              </div>

              {/* BHIM */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  height: '28px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#005088', fontStyle: 'italic' }}>BHIM</span>
              </div>

              {/* RuPay */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  height: '28px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: 900, color: '#092f62' }}>RuPay</span>
                <span style={{ color: '#f47920', fontWeight: 900, fontSize: '0.7rem' }}>▶</span>
              </div>

              {/* Visa & Mastercard */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  height: '28px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#1a1f71', fontStyle: 'italic' }}>VISA</span>
                <div style={{ display: 'flex', marginLeft: '3px' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#eb001b' }} />
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#f79e1b', marginLeft: '-4px' }} />
                </div>
              </div>

              {/* NetBanking */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  padding: '3px 8px',
                  height: '28px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                }}
              >
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#4a5568' }}>🏦 NetBanking</span>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.75rem 0 0 0' }}>
              Direct UPI QR, Instant Bank Confirmation & 256-bit SSL encrypted.
            </p>
          </div>

          {/* 4 Pillars of Trust Micro-Badges */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginTop: '1.25rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.1rem' }}>🛡️</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text)' }}>100% Certified Quality</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Hallmarked finish & master artisan crafted</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.1rem' }}>🚚</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text)' }}>Complimentary Shipping</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Dispatched in 24-48 hrs, insured pan-India</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.1rem' }}>🔄</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text)' }}>7-Day Easy Exchange</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Hassle-free support via concierge</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.1rem' }}>🎁</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text)' }}>Signature Keepsake Box</strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Arrives gift-ready in cushioned royal velvet</span>
              </div>
            </div>
          </div>

          {/* Interactive Accordion for Detailed Specifications */}
          <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            {/* Accordion Item: Craftsmanship & Specs */}
            <div style={{ borderBottom: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'specs' ? '' : 'specs')}
                style={{
                  width: '100%',
                  padding: '1rem 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text)' }}>
                  Craftsmanship & Specifications
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--accent)', fontWeight: 'bold' }}>
                  {openAccordion === 'specs' ? '−' : '+'}
                </span>
              </button>
              {openAccordion === 'specs' && (
                <div style={{ paddingBottom: '1rem', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  {isJewellery ? (
                    <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                      <li><strong>Plating & Polish:</strong> Micro-plated antique matte gold finish with anti-tarnish protective lacquer.</li>
                      <li><strong>Stones & Embellishments:</strong> Premium ruby & emerald synthetic cabochons with lustrous south-sea simulated pearls.</li>
                      <li><strong>Base Metal:</strong> Hypoallergenic, nickel-free & lead-free brass core designed for sensitive skin.</li>
                      <li><strong>Closure & Fitting:</strong> Adjustable traditional golden dori/rope thread fits all neck circumferences comfortably.</li>
                      <li><strong>Occasion:</strong> Bridal, Sangeet, Festive Celebrations, Temple Rituals, and Royal Receptions.</li>
                    </ul>
                  ) : (
                    <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                      <li><strong>Fabric:</strong> Hand-curated premium breathable textiles with soft inner lining for luxurious drape.</li>
                      <li><strong>Work / Detailing:</strong> Intricate heritage Zari & thread embroidery crafted by generational artisans.</li>
                      <li><strong>Fit & Silhouette:</strong> Tailored royal silhouette designed for effortless elegance and festive comfort.</li>
                      <li><strong>Occasion:</strong> Weddings, Evening Receptions, Festive Galas, and Celebratory Gatherings.</li>
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Accordion Item: Delivery & Shipping */}
            <div style={{ borderBottom: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')}
                style={{
                  width: '100%',
                  padding: '1rem 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text)' }}>
                  Shipping & Delivery Timeline
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--accent)', fontWeight: 'bold' }}>
                  {openAccordion === 'shipping' ? '−' : '+'}
                </span>
              </button>
              {openAccordion === 'shipping' && (
                <div style={{ paddingBottom: '1rem', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    • <strong>Dispatch:</strong> Dispatched within 24 to 48 business hours from our central studio.
                  </p>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    • <strong>Delivery Time:</strong> 3 to 5 business days pan-India via express insured couriers (Bluedart, Delhivery, DTDC).
                  </p>
                  <p style={{ margin: 0 }}>
                    • <strong>Tracking:</strong> Complete real-time SMS & email tracking updates sent once shipped.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion Item: Care Instructions */}
            <div style={{ borderBottom: '1px solid var(--border)' }}>
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === 'care' ? '' : 'care')}
                style={{
                  width: '100%',
                  padding: '1rem 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text)' }}>
                  Care & Preservation Guide
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--accent)', fontWeight: 'bold' }}>
                  {openAccordion === 'care' ? '−' : '+'}
                </span>
              </button>
              {openAccordion === 'care' && (
                <div style={{ paddingBottom: '1rem', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    • Always wear your jewellery or couture piece <strong>after</strong> applying perfume, hairspray, and cosmetics.
                  </p>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    • Avoid direct contact with water, chlorine, or chemical detergents.
                  </p>
                  <p style={{ margin: 0 }}>
                    • Store individually in the provided Arihant Luxe velvet pouch or an airtight container to preserve luster for generations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FULL-WIDTH SECTION 1: CUSTOMER RATINGS & VERIFIED REVIEWS */}
      {/* ======================================================== */}
      <section
        style={{
          marginTop: '5rem',
          paddingTop: '3.5rem',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', fontWeight: 600 }}>
              Client Experiences
            </span>
            <h2 className="serif" style={{ fontSize: '2.2rem', margin: '0.25rem 0 0 0' }}>
              Verified Buyer Reviews
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.4rem 0 0 0' }}>
              Real impressions from patrons who welcomed this piece into their personal collection.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowReviewForm(!showReviewForm)}
            style={{
              padding: '0.75rem 1.5rem',
              background: showReviewForm ? 'var(--bg-alt)' : 'var(--text)',
              color: showReviewForm ? 'var(--text)' : '#fff',
              border: '1px solid var(--text)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.82rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              transition: 'all 0.2s ease',
            }}
          >
            {showReviewForm ? 'Cancel Review' : '✍️ Write a Review'}
          </button>
        </div>

        {/* Rating Breakdown Banner */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '2rem',
            marginBottom: '2.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          {/* Big Score */}
          <div style={{ textAlign: 'center', borderRight: '1px solid var(--border)', paddingRight: '1rem' }}>
            <div className="serif" style={{ fontSize: '3.6rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
              4.9
            </div>
            <div style={{ color: '#d97706', fontSize: '1.3rem', margin: '0.4rem 0' }}>
              ★★★★★
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Based on {allReviews.length} verified ratings
            </div>
            <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 600, marginTop: '0.4rem' }}>
              ★ 98% Recommended by Patrons
            </div>
          </div>

          {/* Rating Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { stars: 5, pct: 90 },
              { stars: 4, pct: 8 },
              { stars: 3, pct: 2 },
              { stars: 2, pct: 0 },
              { stars: 1, pct: 0 },
            ].map((bar) => (
              <div key={bar.stars} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem' }}>
                <span style={{ width: '45px', color: 'var(--text)', fontWeight: 500 }}>{bar.stars} Stars</span>
                <div style={{ flex: 1, height: '8px', background: 'var(--bg-alt)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${bar.pct}%`, height: '100%', background: '#d97706', borderRadius: '4px' }} />
                </div>
                <span style={{ width: '35px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {bar.pct}%
                </span>
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div style={{ paddingLeft: '1rem', borderLeft: '1px solid var(--border)', fontSize: '0.84rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ color: '#047857', fontWeight: 700 }}>✓ Craftsmanship:</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>Ranked 5.0 / 5.0 for fine finishing</span>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ color: '#047857', fontWeight: 700 }}>✓ Packaging:</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>Signature cushioned velvet box</span>
            </div>
            <div>
              <span style={{ color: '#047857', fontWeight: 700 }}>✓ True to Image:</span>
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.4rem' }}>Exact match to catalog photographs</span>
            </div>
          </div>
        </div>

        {/* Write Review Collapsible Form */}
        {showReviewForm && (
          <form
            onSubmit={handleReviewSubmit}
            style={{
              background: '#fdfbf7',
              border: '2px solid var(--accent)',
              borderRadius: '8px',
              padding: '2rem',
              marginBottom: '2.5rem',
            }}
          >
            <h3 className="serif" style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              Share Your Experience
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Your feedback assists fellow connoisseurs in making confident selections.
            </p>

            {reviewSuccess && (
              <div style={{ background: '#ecfdf5', color: '#047857', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                ✓ Thank you! Your review has been submitted and posted.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  className="auth-input"
                  placeholder="e.g. Radhika Kapoor"
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.3rem' }}>
                  City / Location
                </label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="e.g. Mumbai"
                  value={reviewCity}
                  onChange={(e) => setReviewCity(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.3rem' }}>
                  Rating
                </label>
                <select
                  className="auth-input"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                >
                  <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                  <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                  <option value={3}>★★★☆☆ (3 Stars - Good)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.3rem' }}>
                Review Headline
              </label>
              <input
                type="text"
                className="auth-input"
                placeholder="e.g. Breathtaking finish, exceeded all my expectations!"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.3rem' }}>
                Detailed Feedback *
              </label>
              <textarea
                required
                rows={4}
                className="auth-input"
                placeholder="Describe the finishing, weight, packaging, or how you styled it..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button
              type="submit"
              className="hero-btn"
              style={{ padding: '0.75rem 2rem', fontSize: '0.82rem' }}
            >
              Submit Review
            </button>
          </form>
        )}

        {/* Customer Review Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {allReviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ color: '#d97706', fontSize: '0.95rem', letterSpacing: '2px' }}>
                    {'★'.repeat(rev.rating)}
                    {'☆'.repeat(5 - rev.rating)}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rev.date}</span>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0.4rem 0 0.5rem 0', color: 'var(--text)' }}>
                  "{rev.title}"
                </h4>

                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-muted)', margin: 0 }}>
                  {rev.comment}
                </p>
              </div>

              <div
                style={{
                  marginTop: '1.25rem',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>
                      {rev.name}
                    </span>
                    {rev.verified && (
                      <span style={{ fontSize: '0.68rem', color: '#047857', background: '#ecfdf5', padding: '1px 6px', borderRadius: '8px', fontWeight: 600 }}>
                        ✓ Verified Buyer
                      </span>
                    )}
                  </div>
                  {rev.city && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {rev.city}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleHelpfulClick(rev.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: helpfulClicked[String(rev.id)] ? '#047857' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  👍 Helpful ({rev.helpful + (helpfulClicked[String(rev.id)] ? 1 : 0)})
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* FULL-WIDTH SECTION 2: THE ARIHANT LUXE HERITAGE PILLARS  */}
      {/* ======================================================== */}
      <section
        style={{
          marginTop: '5rem',
          padding: '3rem 2rem',
          background: 'linear-gradient(180deg, var(--bg-alt) 0%, var(--surface) 100%)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 2.5rem auto' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', fontWeight: 600 }}>
            The Arihant Standard
          </span>
          <h2 className="serif" style={{ fontSize: '2rem', margin: '0.35rem 0' }}>
            Why Discerning Patrons Choose Arihant Luxe
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Rooted in heritage traditions, driven by modern transparency, and delivered with uncompromised royal elegance.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>👑</div>
            <h4 className="serif" style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
              Heritage Craftsmanship
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Hand-finished by multi-generational Indian karigars preserving ancient jewelry and couture motifs.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>💎</div>
            <h4 className="serif" style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
              5-Point Quality Audit
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Every stone setting, clasp tension, and polish standard is rigorously verified before dispatch.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>📦</div>
            <h4 className="serif" style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
              Velvet Keepsake Box
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Arrives gift-ready in our signature cushioned velvet presentation box with authenticity seal.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>🔒</div>
            <h4 className="serif" style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
              Direct UPI & Zero Surcharge
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              Seamless QR payment via GPay, PhonePe, Paytm or BHIM with instant order tracking.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* FULL-WIDTH SECTION 3: YOU MAY ALSO LIKE (RELATED PIECES) */}
      {/* ======================================================== */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: '5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', fontWeight: 600 }}>
                Curated Recommendations
              </span>
              <h2 className="serif" style={{ fontSize: '2rem', margin: '0.25rem 0 0 0' }}>
                Complete Your Ensemble
              </h2>
            </div>
            <Link
              to={isJewellery ? '/jewellery' : '/fashion'}
              style={{
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--accent)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Explore Collection →
            </Link>
          </div>

          <div className="product-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
