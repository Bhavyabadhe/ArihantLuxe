import { Link } from 'react-router-dom';

export default function Shipping() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <h1 className="legal-title">Shipping & Returns</h1>
        <p className="legal-subtitle">
          Everything you need to know about our delivery process
        </p>
      </div>

      <section className="legal-section">
        <h2 className="legal-h2">Domestic Shipping</h2>
        <p className="legal-p">
          We offer free standard shipping on all domestic orders over Rs.500. For orders under Rs.500,
          a flat rate of Rs.70 applies. Standard delivery typically takes 3-5 business days.
        </p>
      </section>

      <section className="legal-section">
        <h2 className="legal-h2">International Shipping</h2>
        <p className="legal-p">
          Arihant Luxe ships worldwide. International shipping rates are calculated at checkout based
          on your location and order weight. Delivery times vary by destination but generally
          take 7-14 business days.
        </p>
      </section>

      <section className="legal-section">
        <h2 className="legal-h2">Easy Returns</h2>
        <p className="legal-p">
          We want you to love your pieces. If you're not completely satisfied, we accept returns
          within 30 days of delivery. Items must be in their original condition with tags attached.
        </p>
      </section>

      <div className="legal-actions">
        <Link to="/contact" className="hero-btn">Have a Question? Contact Us</Link>
      </div>
    </div>
  );
}
