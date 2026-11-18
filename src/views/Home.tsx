import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard, { Product } from '../components/ProductCard';
import { getInitialProducts, fetchProductsSWR } from '../utils/productCache';

const DEFAULT_CATEGORIES = ['All', 'Clothing', 'Jewellery'];

export default function Home() {
  // Synchronous 0ms render from memory or localStorage cache
  const [products, setProducts] = useState<Product[]>(() => getInitialProducts());
  const [loading, setLoading] = useState<boolean>(() => products.length === 0);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Stale-While-Revalidate: update in the background without blocking the UI
    fetchProductsSWR((fresh) => {
      setProducts(fresh);
      setLoading(false);
    }).then(() => {
      setLoading(false);
    });
  }, []);

  // Compute category tabs dynamically from fetched products
  const dbCategories = Array.from(
    new Set(products.map((p) => p.category?.trim()).filter(Boolean) as string[])
  );
  const categories = dbCategories.length > 0 ? ['All', ...dbCategories] : DEFAULT_CATEGORIES;

  const filtered = products.filter((p) => {
    const matchCat =
      activeCategory === 'All' ||
      p.category?.toUpperCase() === activeCategory.toUpperCase();
    const matchSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-img-container">
          <img src="https://res.cloudinary.com/deotzatzd/image/upload/v1795019708/hero.png" alt="Arihant Luxe Collection" />
        </div>
        <div className="hero-content">
          <p className="hero-sub">The New Standard</p>
          <h1 className="hero-title">Timeless Essentials</h1>
          <a href="#shop" className="hero-btn">
            Discover Collection
          </a>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <p>Curated</p>
          <h2 className="cate">Categories</h2>
        </div>
        <div className="Categories">
          <Link
            to="/fashion"
            className="category-card"
            aria-label="Shop Fashion"
          >
            <div className="category-circle-wrapper">
              <div className="circle">
                <img
                  src="/zero.png"
                  alt="Fashion"
                  className="category-img"
                />
              </div>
            </div>
            <h3 className="category-title serif">Fashion</h3>
            <span className="category-subtitle">Tailored Essentials</span>
          </Link>

          <Link
            to="/jewellery"
            className="category-card"
            aria-label="Shop Jewellery"
          >
            <div className="category-circle-wrapper">
              <div className="circle circle2">
                <img
                  src="https://images.unsplash.com/photo-1722410180687-b05b50922362?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
                  alt="Jewellery"
                  className="category-img"
                />
              </div>
            </div>
            <h3 className="category-title serif">Jewellery</h3>
            <span className="category-subtitle">Fine Adornments</span>
          </Link>
        </div>
      </section>

      {/* Shop */}
      <section id="shop" className="shop-section">
        <div className="section-header">
          <p>Explore</p>
          <h2>Our Collection</h2>
        </div>

        <div className="shop-controls">
          <div className="category-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            className="search-input"
            type="text"
            placeholder="Search our pieces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading-state" style={{ textAlign: 'center', padding: '3rem' }}>
            Loading pieces...
          </div>
        ) : filtered.length === 0 ? (
          <p className="no-results">We couldn't find any pieces matching your selection.</p>
        ) : (
          <div className="product-grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}