import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { clearCart } from '../store/cartSlice';
import { createOrder } from '../firebase';

const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || 'arihantluxe@upi';
const UPI_NAME = process.env.NEXT_PUBLIC_UPI_NAME || 'Arihant Luxe';

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);
  const { user, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country] = useState('India');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');

  // QR Modal & UTR state
  const [showQrModal, setShowQrModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submittingUtr, setSubmittingUtr] = useState(false);

  // Notification state
  const [notification, setNotification] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning';
    onClose?: () => void;
  } | null>(null);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isInitialized, isAuthenticated, navigate]);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const shipping = subtotal < 500 ? 70 : 0;
  const total = subtotal + shipping;

  // Generate standard UPI Payment URL
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_NAME)}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Arihant Luxe Order')}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiPayUrl)}`;

  const validateShipping = (): boolean => {
    if (!email.trim() || !fullName.trim() || !address.trim() || !city.trim() || !country.trim()) {
      setNotification({
        title: 'Missing Information',
        message: 'Please fill in all shipping details to proceed with checkout.',
        type: 'warning',
      });
      return false;
    }
    return true;
  };

  const handleCheckoutSubmit = async () => {
    if (!validateShipping()) return;

    if (paymentMethod === 'cod') {
      setIsLoading(true);
      try {
        const orderId = await createOrder({
          userEmail: email.trim(),
          userFullName: fullName.trim(),
          items: items,
          subtotal: subtotal,
          shippingFee: shipping,
          total: total,
          shippingAddress: { email: email.trim(), fullName: fullName.trim(), address: address.trim(), city: city.trim(), country },
          status: 'cod_pending',
          paymentMethod: 'cod',
          createdAt: Date.now(),
        });

        dispatch(clearCart());
        setNotification({
          title: 'Order Placed!',
          message: `Thank you for shopping with Arihant Luxe! Your Cash on Delivery order #${orderId.slice(0, 8).toUpperCase()} has been successfully registered. We are preparing to dispatch your package.`,
          type: 'success',
          onClose: () => navigate('/account'),
        });
      } catch (err: any) {
        console.error('COD Order Error:', err);
        setNotification({
          title: 'Order Failed',
          message: 'Could not register your order. Please check your network connection and try again.',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // For UPI, open the QR & UTR input modal
    setUtrError('');
    setShowQrModal(true);
  };

  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr) {
      setUtrError('Please enter the 12-digit UTR / Reference Number after completing payment.');
      return;
    }
    if (cleanUtr.length < 6) {
      setUtrError('Please enter a valid UTR / Transaction Reference number.');
      return;
    }

    setSubmittingUtr(true);
    setUtrError('');

    try {
      const orderId = await createOrder({
        userEmail: email.trim(),
        userFullName: fullName.trim(),
        items: items,
        subtotal: subtotal,
        shippingFee: shipping,
        total: total,
        shippingAddress: { email: email.trim(), fullName: fullName.trim(), address: address.trim(), city: city.trim(), country },
        status: 'paid_pending_verification',
        paymentMethod: 'upi_qr',
        paymentId: cleanUtr,
        createdAt: Date.now(),
      });

      setShowQrModal(false);
      dispatch(clearCart());
      setNotification({
        title: 'Payment Submitted!',
        message: `Your order #${orderId.slice(0, 8).toUpperCase()} has been received with UTR Ref: ${cleanUtr}. We will verify your transaction and update your order tracking shortly.`,
        type: 'success',
        onClose: () => navigate('/account'),
      });
    } catch (err: any) {
      console.error('UPI Order error:', err);
      setUtrError('Failed to record your order. Please try submitting again.');
    } finally {
      setSubmittingUtr(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  if (items.length === 0 && !notification) {
    return (
      <div className="checkout-empty">
        <h2 className="serif">Your bag is empty</h2>
        <Link to="/" className="checkout-link">Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* Left Column: Form */}
        <section className="checkout-form-section">
          <div className="checkout-header">
            <h1 className="serif">Checkout</h1>
            <p className="checkout-subtitle">SHIPPING DETAILS AND PAYMENT SUMMARY.</p>
          </div>

          <div className="checkout-form-group">
            <h3 className="serif">Contact & Shipping</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
              <div className="auth-field">
                <label className="auth-label">EMAIL</label>
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">FULL NAME</label>
                <input
                  type="text"
                  className="auth-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Name"
                />
              </div>
            </div>

            <div className="auth-field" style={{ marginTop: '1.5rem' }}>
              <label className="auth-label">ADDRESS</label>
              <input
                type="text"
                className="auth-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, apartment, building, etc."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
              <div className="auth-field">
                <label className="auth-label">CITY</label>
                <input
                  type="text"
                  className="auth-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">COUNTRY</label>
                <input
                  type="text"
                  className="auth-input"
                  value={country}
                  disabled
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
              <h3 className="serif" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Payment Method</h3>
              <div style={{ marginTop: '1.25rem' }}>
                {/* UPI QR Payment */}
                <div
                  className={`payment-method-card ${paymentMethod === 'upi' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                  style={{
                    border: paymentMethod === 'upi' ? '2px solid var(--accent)' : '1px solid var(--border)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    backgroundColor: paymentMethod === 'upi' ? '#fff' : 'transparent',
                    boxShadow: paymentMethod === 'upi' ? 'var(--shadow-soft)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: '2px solid var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: paymentMethod === 'upi' ? 'var(--accent)' : 'transparent',
                    }}>
                      {paymentMethod === 'upi' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.1em' }}>UPI / QR CODE</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Scan QR code via GPay, PhonePe, Paytm or BHIM & enter UTR.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-form-actions" style={{ marginTop: '2.5rem' }}>
            <Link to="/shipping" className="checkout-link">Shipping & Returns</Link>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <button
                type="button"
                className="checkout-pay-btn"
                disabled={isLoading}
                onClick={handleCheckoutSubmit}
              >
                {isLoading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay Rs.${total.toFixed(2)} with UPI QR`}
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Summary */}
        <section className="checkout-summary-section">
          <h3 className="serif">Order Summary</h3>
          <div className="checkout-items">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}-${item.color}`} className="checkout-item">
                <img src={item.image} alt={item.name} className="checkout-item-img" />
                <div className="checkout-item-info">
                  <p className="checkout-item-name">{item.name}</p>
                  <p className="checkout-item-qty">
                    {item.size ? `SIZE: ${item.size} | ` : ''}QTY: {item.quantity}
                  </p>
                  {item.color ? <p className='checkout-item-color'>COLOR: {item.color}</p> : null}
                  <p className="checkout-item-price">Rs.{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-totals">
            <div className="checkout-total-row">
              <span>Subtotal</span>
              <span>Rs.{subtotal.toFixed(2)}</span>
            </div>
            <div className="checkout-total-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `Rs.${shipping.toFixed(2)}`}</span>
            </div>
            <div className="checkout-total-row grand-total">
              <span>Total</span>
              <span>Rs.{total.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* UPI QR & UTR Popup Modal */}
      {showQrModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem',
          animation: 'fadeIn 0.25s ease-out',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            maxWidth: '460px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)',
            border: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'transparent',
                border: 'none',
                fontSize: '1.25rem',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                lineHeight: 1,
              }}
              aria-label="Close modal"
            >
              ✕
            </button>

            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', fontWeight: 600 }}>
              Scan & Pay
            </span>
            <h2 className="serif" style={{ fontSize: '1.85rem', margin: '0.35rem 0 0.25rem', color: 'var(--text)' }}>
              UPI Payment
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Scan the QR code with any UPI app to pay
            </p>

            {/* Total Amount Badge */}
            <div style={{
              display: 'inline-block',
              padding: '0.5rem 1.5rem',
              backgroundColor: 'var(--bg-alt)',
              borderRadius: '30px',
              marginBottom: '1.25rem',
              border: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.4rem' }}>Amount to Pay:</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--text)' }}>Rs.{total.toFixed(2)}</strong>
            </div>

            {/* QR Code Container */}
            <div style={{
              background: '#ffffff',
              padding: '1rem',
              borderRadius: '8px',
              display: 'inline-block',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              marginBottom: '1rem',
            }}>
              <img
                src={qrCodeUrl}
                alt="UPI Payment QR Code"
                style={{
                  width: '210px',
                  height: '210px',
                  display: 'block',
                  margin: '0 auto',
                }}
              />
            </div>

            {/* UPI ID Row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-alt)',
              padding: '0.6rem 0.9rem',
              borderRadius: '6px',
              marginBottom: '1.25rem',
              border: '1px dashed var(--border)',
            }}>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  UPI ID
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                  {UPI_ID}
                </span>
              </div>
              <button
                type="button"
                onClick={copyUpiId}
                style={{
                  padding: '0.35rem 0.8rem',
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  background: copiedUpi ? '#166534' : 'var(--text)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {copiedUpi ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            {/* UTR Input Form */}
            <form onSubmit={handleUtrSubmit} style={{ textAlign: 'left', marginTop: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: '0.4rem' }}>
                Enter 12-Digit UTR / Ref Number <span style={{ color: '#b91c1c' }}>*</span>
              </label>
              <input
                type="text"
                className="auth-input"
                value={utrNumber}
                onChange={(e) => setUtrNumber(e.target.value)}
                placeholder="e.g. 412345678901"
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem',
                  fontSize: '0.9rem',
                  borderRadius: '4px',
                  border: utrError ? '1px solid #b91c1c' : '1px solid var(--border)',
                  marginBottom: '0.5rem',
                  outline: 'none',
                }}
              />

              {utrError && (
                <p style={{ color: '#b91c1c', fontSize: '0.78rem', marginBottom: '0.75rem', lineHeight: '1.4' }}>
                  {utrError}
                </p>
              )}

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '1.25rem' }}>
                Tip: You can find the 12-digit UTR / UPI Reference ID under transaction details in your GPay, PhonePe, or Paytm app.
              </p>

              <button
                type="submit"
                disabled={submittingUtr}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--text)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  cursor: submittingUtr ? 'not-allowed' : 'pointer',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s ease',
                  opacity: submittingUtr ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!submittingUtr) e.currentTarget.style.backgroundColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  if (!submittingUtr) e.currentTarget.style.backgroundColor = 'var(--text)';
                }}
              >
                {submittingUtr ? 'Verifying & Recording...' : 'Confirm Order with UTR'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Custom Notification Modal */}
      {notification && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease-out',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            padding: '2.5rem',
            maxWidth: '450px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--border)',
            animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            {/* Visual Indicator Icon */}
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              backgroundColor: notification.type === 'success' ? '#f0fdf4' : notification.type === 'error' ? '#fef2f2' : '#fffbeb',
              color: notification.type === 'success' ? '#166534' : notification.type === 'error' ? '#991b1b' : '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 1.5rem',
              border: `2px solid ${notification.type === 'success' ? '#bbf7d0' : notification.type === 'error' ? '#fecaca' : '#fef3c7'}`,
            }}>
              {notification.type === 'success' ? '✓' : notification.type === 'error' ? '✕' : '!'}
            </div>

            <h2 className="serif" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text)' }}>
              {notification.title}
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
              {notification.message}
            </p>
            <button
              onClick={() => {
                const handler = notification.onClose;
                setNotification(null);
                if (handler) handler();
              }}
              style={{
                width: '100%',
                backgroundColor: 'var(--text)',
                color: '#ffffff',
                border: 'none',
                padding: '1rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--text)';
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
