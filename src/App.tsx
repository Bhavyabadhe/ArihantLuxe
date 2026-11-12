import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './store/store';
import type { RootState } from './store/store';
import { setInitialized } from './store/authSlice';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import Home from './views/Home';
import ProductDetail from './views/ProductDetail';
import About from './views/About';
import Contact from './views/Contact';
import Privacy from './views/Privacy';
import Shipping from './views/Shipping';
import Terms from './views/Terms';
import Checkout from './views/Checkout';
import Login from './views/Login';
import Signup from './views/Signup';
import Account from './views/Account';
import NotFound from './views/NotFound';
import BlogList from './views/BlogList';
import BlogDetail from './views/BlogDetail';
import BlogAdmin from './views/BlogAdmin';
import Fashion from './views/Fashion';
import Jewellery from './views/Jewellery';
import { Analytics } from "@vercel/analytics/react"

function AppLayout() {
  const dispatch = useDispatch();
  const { isInitialized } = useSelector((state: RootState) => state.auth);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    dispatch(setInitialized());
  }, [dispatch]);


  if (!isInitialized) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div className="serif" style={{ fontSize: '1.5rem', letterSpacing: '0.2em' }}>Arihant Luxe</div>
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar onCartOpen={() => setCartOpen(true)} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/fashion" element={<Fashion />} />
          <Route path="/clothing" element={<Fashion />} />
          <Route path="/jewellery" element={<Jewellery />} />
          <Route path="/jewelry" element={<Jewellery />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/account" element={<Account />} />
          <Route path="/journal" element={<BlogList />} />
          <Route path="/journal/admin" element={<BlogAdmin />} />
          <Route path="/journal/:id" element={<BlogDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <span className="footer-logo">Arihant Luxe</span>
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.8' }}>
              Crafting timeless essentials for the modern wardrobe. Quality, sustainability, and minimalist design at the core of everything we do.
            </p>
          </div>

          <div className="footer-section">
            <h4>Shop</h4>
            <div className="footer-nav footer-links">
              <Link to="/">All Collection</Link>
              <Link to="/about">Our Story</Link>
              <Link to="/contact">Contact Us</Link>
            </div>
          </div>

          <div className="footer-section">
            <h4>Support</h4>
            <div className="footer-nav footer-links">
              <Link to="/shipping">Shipping & Returns</Link>
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>

          <div className="footer-section">
            <h4>Connect</h4>
            <div className="footer-nav footer-links">
              <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="#" target="_blank" rel="noopener noreferrer">Pinterest</a>
              <Link to="/journal">Journal</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© 2026 Arihant Luxe — All Rights Reserved.</p>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <Analytics />
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <ScrollToTop />
        <AppLayout />
      </BrowserRouter>
    </Provider>
  );
}
