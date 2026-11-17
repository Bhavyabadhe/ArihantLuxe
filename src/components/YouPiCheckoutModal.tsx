import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export interface YouPiCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  orderRef: string;
  upiId?: string;
  upiName?: string;
  customerName?: string;
  customerEmail?: string;
  onSubmitUtr: (utr: string) => Promise<void>;
  isSubmitting?: boolean;
  errorMessage?: string;
}

export const YouPiCheckoutModal: React.FC<YouPiCheckoutModalProps> = ({
  isOpen,
  onClose,
  amount,
  orderRef,
  upiId = process.env.NEXT_PUBLIC_UPI_ID || 'arihantluxe@nyes',
  upiName = process.env.NEXT_PUBLIC_UPI_NAME || 'Arihant Jain',
  customerName = '',
  customerEmail = '',
  onSubmitUtr,
  isSubmitting = false,
  errorMessage = '',
}) => {
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [localError, setLocalError] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes session

  // Reset timer on open
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(600);
      setLocalError('');
      setUtrNumber('');
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Construct NPCI Standard UPI URI
  const upiPayload = useMemo(() => {
    const formattedAmount = amount.toFixed(2);
    const note = `Arihant Luxe Order #${orderRef.slice(0, 8).toUpperCase()}`;

    // Standard NPCI UPI URI
    const standardUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${formattedAmount}&cu=INR&tr=${encodeURIComponent(orderRef)}&tn=${encodeURIComponent(note)}`;

    // App-specific intent URLs
    const gpayUrl = `tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${formattedAmount}&cu=INR&tr=${encodeURIComponent(orderRef)}&tn=${encodeURIComponent(note)}`;
    const phonepeUrl = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${formattedAmount}&cu=INR&tr=${encodeURIComponent(orderRef)}&tn=${encodeURIComponent(note)}`;
    const paytmUrl = `paytmmp://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${formattedAmount}&cu=INR&tr=${encodeURIComponent(orderRef)}&tn=${encodeURIComponent(note)}`;
    const credUrl = `credpay://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${formattedAmount}&cu=INR&tr=${encodeURIComponent(orderRef)}&tn=${encodeURIComponent(note)}`;

    return { standardUrl, gpayUrl, phonepeUrl, paytmUrl, credUrl };
  }, [upiId, upiName, amount, orderRef]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = utrNumber.trim();
    if (!clean) {
      setLocalError('Please enter the 12-digit UTR or Transaction Reference number.');
      return;
    }
    if (clean.length < 6) {
      setLocalError('UTR / Reference number is too short. Please check your UPI receipt.');
      return;
    }
    setLocalError('');
    await onSubmitUtr(clean);
  };

  const openApp = (url: string) => {
    window.location.href = url;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            borderTopLeftRadius: '15px',
            borderTopRightRadius: '15px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1rem',
                color: '#fff',
              }}
            >
              ₹
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, letterSpacing: '0.04em' }}>YouPI Checkout</span>
                <span
                  style={{
                    fontSize: '0.62rem',
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.15)',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                  }}
                >
                  Open Source PG
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
                Direct & Zero Platform Fee • Verified UPI
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: '0.25rem',
              lineHeight: 1,
            }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          {/* Amount and Expiry Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '0.85rem 1.1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em' }}>
                Amount Payable
              </span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
                ₹{amount.toFixed(2)}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
                Session Expires In
              </span>
              <span
                style={{
                  fontSize: '0.92rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: timeLeft < 120 ? '#dc2626' : '#0284c7',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: timeLeft < 120 ? '#dc2626' : '#10b981',
                    display: 'inline-block',
                  }}
                />
                {formattedTime}
              </span>
            </div>
          </div>

          {/* SECTION 1: Tap to Pay on Mobile */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '0.65rem' }}>
              📱 Tap to Pay Directly with UPI App
            </span>

            {/* Primary Universal Launch Button */}
            <button
              type="button"
              onClick={() => openApp(upiPayload.standardUrl)}
              style={{
                width: '100%',
                padding: '0.85rem',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                marginBottom: '0.65rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
              }}
            >
              <span>⚡</span> Open in Default UPI App
            </button>

            {/* Specific App Launchers Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => openApp(upiPayload.gpayUrl)}
                style={{
                  padding: '0.7rem 0.5rem',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                <span style={{ color: '#4285F4', fontWeight: 800 }}>G</span> Google Pay
              </button>

              <button
                type="button"
                onClick={() => openApp(upiPayload.phonepeUrl)}
                style={{
                  padding: '0.7rem 0.5rem',
                  background: '#5f259f',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>पे</span> PhonePe
              </button>

              <button
                type="button"
                onClick={() => openApp(upiPayload.paytmUrl)}
                style={{
                  padding: '0.7rem 0.5rem',
                  background: '#ffffff',
                  border: '1px solid #00b9f5',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#002e6e',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                Paytm
              </button>

              <button
                type="button"
                onClick={() => openApp(upiPayload.credUrl)}
                style={{
                  padding: '0.7rem 0.5rem',
                  background: '#18181b',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                }}
              >
                CRED Pay
              </button>
            </div>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '1.25rem 0', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#94a3b8', fontWeight: 600 }}>
              OR SCAN QR CODE TO PAY
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          </div>

          {/* SECTION 2: Dynamic Vector SVG QR Code (Positioned Below Tap to Pay) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                background: '#ffffff',
                padding: '0.85rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.08)',
                display: 'inline-block',
                margin: '0 auto 0.65rem auto',
              }}
            >
              <QRCodeSVG
                value={upiPayload.standardUrl}
                size={185}
                level="M"
                includeMargin={true}
                style={{ display: 'block', margin: '0 auto' }}
              />
            </div>

            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: '1.4' }}>
              Scan using any UPI app (GPay, PhonePe, Paytm, Navi, BHIM).
              <br />
              <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Amount ₹{amount.toFixed(2)} and payee are auto-locked in QR</span>
            </p>
          </div>

          {/* Payee VPA Verification & Copy Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc',
              border: '1px dashed #cbd5e1',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              marginBottom: '1.25rem',
              textAlign: 'left',
            }}
          >
            <div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748b', display: 'block', fontWeight: 600 }}>
                Verified Payee: <strong>{upiName}</strong>
              </span>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
                {upiId}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyUpi}
              style={{
                background: copiedUpi ? '#166534' : '#0f172a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.4rem 0.75rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copiedUpi ? '✓ Copied' : 'Copy VPA'}
            </button>
          </div>

          {/* UTR Confirmation Form (YouPI Verification Step) */}
          <form onSubmit={handleFormSubmit} style={{ textAlign: 'left', marginTop: '0.5rem' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.74rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '0.35rem',
              }}
            >
              12-Digit UTR / Bank Reference No. <span style={{ color: '#ef4444' }}>*</span>
            </label>

            <input
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="e.g. 412345678901 (from your payment receipt)"
              maxLength={22}
              style={{
                width: '100%',
                padding: '0.75rem 0.9rem',
                borderRadius: '8px',
                border: (localError || errorMessage) ? '1px solid #ef4444' : '1px solid #cbd5e1',
                fontSize: '0.88rem',
                outline: 'none',
                marginBottom: '0.4rem',
                fontFamily: 'monospace',
                letterSpacing: '0.04em',
              }}
            />

            {(localError || errorMessage) && (
              <p style={{ color: '#ef4444', fontSize: '0.74rem', margin: '0 0 0.5rem 0', lineHeight: 1.3 }}>
                {localError || errorMessage}
              </p>
            )}

            <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '0 0 1rem 0', lineHeight: 1.4 }}>
              💡 Check your UPI transaction receipt for the 12-digit UTR, UPI Ref ID, or Transaction ID.
            </p>

            <button
              type="submit"
              disabled={isSubmitting || timeLeft === 0}
              style={{
                width: '100%',
                backgroundColor: isSubmitting || timeLeft === 0 ? '#94a3b8' : '#0f172a',
                color: '#ffffff',
                border: 'none',
                padding: '0.9rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: isSubmitting || timeLeft === 0 ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
              }}
            >
              {isSubmitting ? 'Verifying Transaction...' : timeLeft === 0 ? 'Session Expired' : 'Confirm & Complete Order'}
            </button>
          </form>

          {/* Footer Security Badge */}
          <div
            style={{
              marginTop: '1.25rem',
              paddingTop: '0.85rem',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              fontSize: '0.68rem',
              color: '#94a3b8',
            }}
          >
            <span>🔒 256-bit Encrypted</span>
            <span>•</span>
            <span>⚡ Instant UPI</span>
            <span>•</span>
            <span>🛡️ NPCI Protocol</span>
          </div>
        </div>
      </div>
    </div>
  );
};
