import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { getBlogPosts, type BlogPost } from '../firebase';

const CATEGORIES = ['All', 'Style', 'Sustainability', 'Craftsmanship'];

export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getBlogPosts();
        setPosts(data);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  const filteredPosts = posts.filter(
    post => activeCategory === 'All' || post.category === activeCategory
  );

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const secondaryPosts = filteredPosts.slice(1);

  return (
    <div className="journal-page">
      <header className="journal-hero">
        <span className="journal-hero__badge">Arihant Luxe JOURNAL</span>
        <h1 className="journal-hero__title serif">Stories & Conversations</h1>
        <p className="journal-hero__desc">
          Exploring the intersections of minimalist design, sustainable textiles, and the poetry of slow craftsmanship.
        </p>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem', marginTop: '-2rem' }}>
        {isAuthenticated && (
          <Link to="/journal/admin" className="admin-btn admin-btn--secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>✏️</span> Manage Journal (Admin)
          </Link>
        )}
      </div>

      <div className="journal-filters">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '6rem 0' }}>
          <p className="serif" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading Journal...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 0', border: '1px solid var(--border)', background: 'white' }}>
          <p className="serif" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>No articles found in this category.</p>
        </div>
      ) : (
        <>
          {/* Featured Post */}
          {featuredPost && activeCategory === 'All' && (
            <section className="journal-featured">
              <div className="journal-featured__img-wrap">
                <Link to={`/journal/${featuredPost.id}`}>
                  <img src={featuredPost.image} alt={featuredPost.title} />
                </Link>
              </div>
              <div>
                <div className="journal-featured__meta">
                  <span>{featuredPost.category}</span>
                  <span>•</span>
                  <span>{featuredPost.publishDate}</span>
                </div>
                <h2 className="journal-featured__title serif">
                  <Link to={`/journal/${featuredPost.id}`}>{featuredPost.title}</Link>
                </h2>
                <p className="journal-featured__excerpt">{featuredPost.excerpt}</p>
                <Link to={`/journal/${featuredPost.id}`} className="journal-featured__link">
                  Read Article →
                </Link>
              </div>
            </section>
          )}

          {/* Secondary Posts Grid */}
          <section className="journal-grid">
            {(activeCategory !== 'All' ? filteredPosts : secondaryPosts).map(post => (
              <article key={post.id} className="journal-card">
                <div className="journal-card__img-wrap">
                  <Link to={`/journal/${post.id}`}>
                    <img src={post.image} alt={post.title} />
                  </Link>
                </div>
                <div className="journal-card__meta">
                  <span>{post.category}</span>
                  <span>•</span>
                  <span>{post.publishDate}</span>
                </div>
                <h3 className="journal-card__title serif">
                  <Link to={`/journal/${post.id}`}>{post.title}</Link>
                </h3>
                <p className="journal-card__excerpt">{post.excerpt}</p>
                <Link to={`/journal/${post.id}`} className="journal-featured__link" style={{ alignSelf: 'flex-start' }}>
                  Read More →
                </Link>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
