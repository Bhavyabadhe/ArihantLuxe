'use client';

import dynamic from 'next/dynamic';

const App = dynamic(() => import('../../App'), {
  ssr: false,
  loading: () => (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdfcfb' }}>
      <div className="serif" style={{ fontSize: '1.5rem', letterSpacing: '0.2em' }}>Arihant Luxe</div>
    </div>
  ),
});

export default function CatchAllPage() {
  return <App />;
}

