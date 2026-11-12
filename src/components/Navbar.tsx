import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

interface NavbarProps {
  onCartOpen: () => void;
}

export default function Navbar({ onCartOpen }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = useSelector((state: RootState) =>
    state.cart.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const location = useLocation();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <nav className="navbar">
        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span style={{ transform: mobileMenuOpen ? 'rotate(45deg) translateY(6px)' : 'none', transition: 'var(--transition)' }} />
          <span style={{ opacity: mobileMenuOpen ? 0 : 1, transition: 'var(--transition)' }} />
          <span style={{ transform: mobileMenuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none', transition: 'var(--transition)' }} />
        </button>

        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          Arihant Luxe
        </Link>

        <div className="navbar-links">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Collection</Link>
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>The Brand</Link>
          <Link to="/journal" className={location.pathname.startsWith('/journal') ? 'active' : ''}>Journal</Link>
          <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>Contact</Link>
        </div>

        <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link
            to={isAuthenticated ? "/account" : "/login"}
            className="navbar-account-link"
            style={{ fontSize: '0.85rem', letterSpacing: '0.15em', fontWeight: 600, textTransform: 'uppercase' }}
          >
            {isAuthenticated ? 'ACCOUNT' : 'LOGIN'}
          </Link>

          <button className="cart-btn" onClick={onCartOpen} aria-label="Open cart">
            <span style={{ fontSize: '0.85rem', letterSpacing: '0.15em', fontWeight: 600 }}>BAG</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && <div className="navbar-mobile-backdrop" onClick={closeMobileMenu} />}
      <div className={`navbar-mobile-panel ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="navbar-mobile-links">
          <Link
            to={isAuthenticated ? "/account" : "/login"}
            className="navbar-mobile-account"
            onClick={closeMobileMenu}
            style={{ fontWeight: 600, color: 'var(--accent)' }}
          >
            {isAuthenticated ? 'ACCOUNT' : 'LOGIN'}
          </Link>
          <div style={{ margin: '1rem 0', height: '1px', background: 'var(--border)' }} />
          <Link to="/" className={location.pathname === '/' ? 'active' : ''} onClick={closeMobileMenu}>Collection</Link>
          <Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onClick={closeMobileMenu}>The Brand</Link>
          <Link to="/journal" className={location.pathname.startsWith('/journal') ? 'active' : ''} onClick={closeMobileMenu}>Journal</Link>
          <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''} onClick={closeMobileMenu}>Contact</Link>
          <div style={{ margin: '1rem 0', height: '1px', background: 'var(--border)' }} />
          <Link to="/shipping" onClick={closeMobileMenu}>Shipping & Returns</Link>
          <Link to="/privacy" onClick={closeMobileMenu}>Privacy Policy</Link>
        </div>
      </div>
    </>
  );
}
