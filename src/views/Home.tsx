import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard, { Product } from '../components/ProductCard';

const DEFAULT_CATEGORIES = ['All', 'Clothing', 'Jewellery'];

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

  const handleCategoryClick = (categoryName: string) => {
    setActiveCategory(categoryName);
    const shopEl = document.getElementById('shop');
    if (shopEl) {
      shopEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

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

      {/* Categories */}
      <section className="categories-section">
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <p>Curated</p>
          <h2 className="cate">Categories</h2>
        </div>
        <div className="Categories">
          <div
            className="category-card"
            onClick={() => handleCategoryClick('Fashion')}
          >
            <a
              href="#shop"
              className="category-circle-wrapper"
              aria-label="Shop Fashion"
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick('/Fashion');
              }}
            >
              <div className="circle">
                <img
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop&q=80"
                  alt="Clothing"
                  className="category-img"
                />
              </div>
            </a>
            <h3 className="category-title serif">Fashion</h3>
            <span className="category-subtitle">Tailored Essentials</span>
          </div>

          <div
            className="category-card"
            onClick={() => handleCategoryClick('Jewellery')}
          >
            <a
              href="#shop"
              className="category-circle-wrapper"
              aria-label="Shop Jewellery"
              onClick={(e) => {
                e.preventDefault();
                handleCategoryClick('Jewellery');
              }}
            >
              <div className="circle2">
                <img
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80"
                  alt="Jewellery"
                  className="category-img"
                />
              </div>
            </a>
            <h3 className="category-title serif">Jewellery</h3>
            <span className="category-subtitle">Fine Adornments</span>
          </div>
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