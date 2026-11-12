import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

// Simple parser for Markdown-style blocks or HTML formatting
function renderContent(text: string) {
  if (!text) return null;
  
  // Detect if the content has HTML tags (like <p>, <h3>, or <img)
  const hasHtml = /<[a-z][\s\S]*>/i.test(text);
  if (hasHtml) {
    return <div dangerouslySetInnerHTML={{ __html: text }} />;
  }
  
  const blocks = text.split('\n\n');
  return blocks.map((block, idx) => {
    const trimmed = block.trim();
    if (trimmed.startsWith('###')) {
      return <h3 key={idx}>{trimmed.replace(/^###\s*/, '')}</h3>;
    }
    if (trimmed.startsWith('##')) {
      return <h2 key={idx}>{trimmed.replace(/^##\s*/, '')}</h2>;
    }
    if (trimmed.startsWith('>')) {
      // Extract quote text, possibly removing quotes inside
      const quoteText = trimmed.replace(/^>\s*"?|"?$/g, '');
      return <blockquote key={idx}>{quoteText}</blockquote>;
    }
    return <p key={idx}>{trimmed}</p>;
  });
}

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPostData() {
      if (!id) return;
      setLoading(true);
      try {
        const data = await getBlogPostById(id);
        setPost(data);

        // Fetch other posts for related reading
        const allPosts = await getBlogPosts();
        const relatedFiltered = allPosts
          .filter(p => p.id !== id)
          .slice(0, 2);
        setRelated(relatedFiltered);
      } catch (err) {
        console.error('Error fetching blog post details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPostData();
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '10rem 0' }}>
        <p className="serif" style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>Loading Article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="journal-page" style={{ textAlign: 'center', padding: '10rem 0' }}>
        <h2 className="serif" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Article Not Found</h2>
        <p style={{ marginBottom: '3rem', color: 'var(--text-muted)' }}>The journal entry you are looking for does not exist or has been removed.</p>
        <Link to="/journal" className="admin-btn">Back to Journal</Link>
      </div>
    );
  }

  return (
    <article className="journal-detail-page">
      <header className="journal-detail-header">
        <Link to="/journal" className="journal-detail-back">
          ← Back to Journal
        </Link>
        <div className="journal-detail-meta">
          <span>{post.category}</span>
          <span>•</span>
          <span>By {post.author}</span>
          <span>•</span>
          <span>{post.publishDate}</span>
        </div>
        <h1 className="journal-detail-title serif">{post.title}</h1>
      </header>

      <div className="journal-detail-hero">
        <img src={post.image} alt={post.title} />
      </div>

      <div className="journal-detail-container">
        <section className="journal-detail-content">
          {renderContent(post.content)}
        </section>

        {related.length > 0 && (
          <section className="related-reading">
            <h2 className="related-reading__title serif">Related Reading</h2>
            <div className="journal-grid">
              {related.map(p => (
                <div key={p.id} className="journal-card">
                  <div className="journal-card__img-wrap" style={{ aspectRatio: '16/10' }}>
                    <Link to={`/journal/${p.id}`}>
                      <img src={p.image} alt={p.title} />
                    </Link>
                  </div>
                  <div className="journal-card__meta">
                    <span>{p.category}</span>
                    <span>•</span>
                    <span>{p.publishDate}</span>
                  </div>
                  <h3 className="journal-card__title serif" style={{ fontSize: '1.5rem' }}>
                    <Link to={`/journal/${p.id}`}>{p.title}</Link>
                  </h3>
                  <Link to={`/journal/${p.id}`} className="journal-featured__link" style={{ alignSelf: 'flex-start' }}>
                    Read Article →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
