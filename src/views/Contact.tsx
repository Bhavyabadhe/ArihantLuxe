import { useState } from 'react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="contact-page">
      <header className="contact-hero">
        <div className="contact-hero__badge">Get in touch</div>
        <h1 className="contact-hero__title">Contact <span className="gradient-text">Us</span></h1>
        <p className="contact-hero__desc">
          Questions about orders, shipping, or recommendations? Send a message and we’ll get back to you.
        </p>
      </header>

      <div className="contact-layout">
        <form className="contact-form" onSubmit={onSubmit}>
          <div className="field-row">
            <label className="field">
              <span className="field__label">Name</span>
              <input
                className="field__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </label>

            <label className="field">
              <span className="field__label">Email</span>
              <input
                className="field__input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
          </div>

          <label className="field">
            <span className="field__label">Message</span>
            <textarea
              className="field__textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us how we can help..."
              rows={6}
              required
            />
          </label>

          <div className="contact-form__actions">
            <button className="hero-btn" type="submit">
              {submitted ? 'Message Sent ✓' : 'Send Message →'}
            </button>
            <p className="contact-form__hint">This demo doesn’t send data—UI only.</p>
          </div>
        </form>

        <aside className="contact-card">
          <h2 className="contact-card__title">Store Info</h2>
          <div className="contact-card__row">
            <span className="contact-card__k">Contact</span>
            <span className="contact-card__v">+91 7728899771</span>
          </div>
          <div className="contact-card__row">
            <span className="contact-card__k">Hours</span>
            <span className="contact-card__v">Mon–Fri, 9am–6pm</span>
          </div>
          <div className="contact-card__row">
            <span className="contact-card__k">Location</span>
            <span className="contact-card__v">Online & worldwide</span>
          </div>

          <div className="contact-card__divider" />

          <p className="contact-card__text">
            Prefer browsing? Visit the Shop page and add your favorites to the cart.
          </p>

          <div className="contact-card__chips">
            <span className="chip">Fast replies</span>
            <span className="chip">Order help</span>
            <span className="chip">Recommendations</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

