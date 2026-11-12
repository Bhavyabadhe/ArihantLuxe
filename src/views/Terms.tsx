import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="legal-page">
      <div className="legal-hero">
        <h1 className="legal-title">Terms of Service</h1>
        <p className="legal-subtitle">
          Last updated: January 1, 2025
        </p>
      </div>

      <section className="legal-section">
        <h2 className="legal-h2">1. Agreement to Terms</h2>
        <p className="legal-p">
          By accessing or using our website, you agree to be bound by these Terms of Service.
          If you do not agree with any part of these terms, you may not use our services.
        </p>
      </section>

      <section className="legal-section">
        <h2 className="legal-h2">2. Use of Site</h2>
        <p className="legal-p">
          This website is intended for personal, non-commercial use. You may not use this site for
          any illegal or unauthorized purpose.
        </p>
      </section>

      <section className="legal-section">
        <h2 className="legal-h2">3. Intellectual Property</h2>
        <p className="legal-p">
          All content on this site, including text, graphics, logos, and images, is the property
          of Arihant Luxe and is protected by international copyright laws.
        </p>
      </section>

      <section className="legal-section">
        <h2 className="legal-h2">4. Limitation of Liability</h2>
        <p className="legal-p">
          Arihant Luxe shall not be liable for any direct, indirect, incidental, or consequential damages
          resulting from the use or inability to use our services.
        </p>
      </section>

      <div className="legal-actions">
        <Link to="/" className="hero-btn">Return Home</Link>
      </div>
    </div>
  );
}
