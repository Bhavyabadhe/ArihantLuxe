import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="not-found" style={{ padding: '8rem 2rem', textAlign: 'center' }}>
      <h2 className="serif" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="hero-btn">
        Return to Collection
      </Link>
    </div>
  );
}
