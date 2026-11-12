import { useEffect, useState } from 'react';
import ProductCard, { Product } from '../components/ProductCard';

const DEFAULT_CATEGORIES = ['All', 'MENS', 'WOMENS', 'UNISEX'];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/products')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.warn('API returned non-array data:', data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load products from database:', err);
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
          <img src="/hero.png" alt="Arihant Luxe Collection" />
        </div>
        <div className="hero-content">
          <p className="hero-sub">The New Standard</p>
          <h1 className="hero-title">Timeless Essentials</h1>
          <a href="#shop" className="hero-btn">
            Discover Collection
          </a>
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