import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard, { Product } from '../components/ProductCard';

export default function Fashion() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load fashion products:', err);
        setLoading(false);
      });
  }, []);

  // Filter for fashion / clothing items
  const FASHION_KEYWORDS = ['fashion', 'clothing', 'apparel', 'dress', 'shirt', 'pant', 'jacket', 't-shirt', 'wear', 'top'];
  
  const fashionProducts = products.filter((p) => {
    const cat = (p.category || '').toLowerCase().trim();
    const name = (p.name || '').toLowerCase();
    
    // Exact or keyword match
    const isFashion = FASHION_KEYWORDS.some((kw) => cat.includes(kw) || name.includes(kw));

    // Also match search term
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());

    return isFashion && matchSearch;
  });

  // Sort products
  const sortedProducts = [...fashionProducts].sort((a, b) => {
    const priceA = typeof a.price === 'number' ? a.price : parseFloat(String(a.price)) || 0;
    const priceB = typeof b.price === 'number' ? b.price : parseFloat(String(b.price)) || 0;

    if (sortBy === 'price-low') return priceA - priceB;
    if (sortBy === 'price-high') return priceB - priceA;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0; // featured / default
  });

  return (
    <div className="category-page">
      {/* Category Hero Banner */}
      <section className="category-hero">
        <div className="category-hero-overlay" />
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&auto=format&fit=crop&q=80"
          alt="Fashion & Clothing Collection"
          className="category-hero-bg"
        />
        <div className="category-hero-content">
          <div className="breadcrumbs">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Fashion</span>
          </div>
          <p className="hero-sub">The Ready-To-Wear Edit</p>
          <h1 className="hero-title serif">Fashion & Apparel</h1>
          <p className="category-hero-desc">
            Tailored essentials, refined draping, and contemporary silhouettes engineered for effortless elegance.
          </p>
        </div>
      </section>

      {/* Main Content & Products */}
      <section className="shop-section" style={{ paddingTop: '3rem' }}>
        <div className="shop-controls" style={{ flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {sortedProducts.length} {sortedProducts.length === 1 ? 'Piece' : 'Pieces'} Available
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              className="search-input"
              type="text"
              placeholder="Search fashion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ minWidth: '240px' }}
            />
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-state" style={{ textAlign: 'center', padding: '5rem 0' }}>
            Loading fashion pieces...
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="no-results-box" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <h3 className="serif" style={{ fontSize: '2rem', marginBottom: '1rem' }}>No Fashion Pieces Found</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              {search ? `No pieces matched "${search}". Try another keyword.` : 'Explore our complete catalog for the latest arrivals.'}
            </p>
            <Link to="/#shop" className="hero-btn" style={{ display: 'inline-block' }}>
              Explore Full Collection
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {sortedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
