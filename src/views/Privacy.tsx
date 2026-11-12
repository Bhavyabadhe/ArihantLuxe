import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-subtitle">
          Last updated: January 1, 2025
        </p>
      </div>

      <section className="legal-section">
        <h2 className="legal-h2">1. Overview</h2>
        <p className="legal-p">
          This privacy policy explains how Arihant Luxe (“we”, “us”) handles information collected through
          this website. This is a demo UI page—no data is actually collected or transmitted.
        </p>
      </section>

      <section className="legal-section">
        <h2 className="legal-h2">2. Information we collect</h2>
        <ul className="legal-list">
          <li className="legal-li">Contact form inputs (UI only in this demo)</li>
          <li className="legal-li">Usage information (UI only in this demo)</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2 className="legal-h2">3. How we use information</h2>
        <p className="legal-p">
          We use information to respond to requests, improve our storefront experience, and
          keep content relevant.
        </p>
      </section>

      <section className="legal-section">
        <h2 className="legal-h2">4. Contact</h2>
        <p className="legal-p">
          If you have questions about this policy, contact us at{' '}
          <span className="legal-strong">support@Arihant Luxe.example</span>.
        </p>
      </section>

      <div className="legal-actions">
        <Link to="/contact" className="hero-btn">Contact Us →</Link>
      </div>
    </div>
  );
}
