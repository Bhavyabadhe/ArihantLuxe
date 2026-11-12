export default function About() {
  return (
    <div className="about-page">
      <h1 className="serif" style={{ fontSize: '4rem', marginBottom: '2rem' }}>The Brand</h1>
      <p style={{ maxWidth: '800px', margin: '0 auto 4rem', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
        Arihant Luxe was founded on the principles of simplicity, quality, and timeless design.
        We believe that a wardrobe should be composed of well-crafted pieces that transcend seasons.
      </p>

      <div className="about-grid" style={{ maxWidth: '1000px' }}>
        {[
          { title: 'Craftsmanship', desc: 'Each piece is meticulously crafted using the finest materials sourced from around the globe.' },
          { title: 'Sustainability', desc: 'We are committed to ethical production and minimizing our environmental footprint.' },
          { title: 'Design Philosophy', desc: 'Minimalist silhouettes designed to offer effortless elegance for the modern lifestyle.' },
        ].map(item => (
          <div key={item.title} className="about-card" style={{ textAlign: 'left', padding: '3rem' }}>
            <h3 className="serif" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>{item.title}</h3>
            <p style={{ lineHeight: '1.8' }}>{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
