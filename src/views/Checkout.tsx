import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { clearCart } from '../store/cartSlice';
import { createOrder } from '../firebase';

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayCheckoutResponse {
  razorpay_payment_id: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  handler: (response: RazorpayCheckoutResponse) => Promise<void>;
  prefill: {
    name: string;
    email: string;
  };
  notes: {
    orderId: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

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
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online');
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

  const handlePayment = async () => {
    console.log('handlePayment triggered');
    if (!email || !fullName || !address || !city || !country) {
      setNotification({
        title: 'Missing Information',
        message: 'Please fill in all shipping details to proceed with checkout.',
        type: 'warning',
      });
      return;
    }

    setIsLoading(true);

    try {
      const orderId = await createOrder({
        userEmail: email,
        userFullName: fullName,
        items: items,
        subtotal: subtotal,
        shippingFee: shipping,
        total: total,
        shippingAddress: { email, fullName, address, city, country },
        status: paymentMethod === 'cod' ? 'cod_pending' : 'created',
        paymentMethod: paymentMethod,
        createdAt: Date.now(),
      });

      if (paymentMethod === 'cod') {
        dispatch(clearCart());
        setNotification({
          title: 'Order Placed!',
          message: `Thank you for shopping with Arihant Luxe! Your Cash on Delivery order #${orderId.slice(0, 8).toUpperCase()} has been successfully registered. We are preparing to dispatch your package.`,
          type: 'success',
          onClose: () => navigate('/account'),
        });
        setIsLoading(false);
        return;
      }

      if (!window.Razorpay) {
        setNotification({
          title: 'Payment Gateway Offline',
          message: `Order #${orderId.slice(0, 8).toUpperCase()} was saved successfully, but we could not load the payment screen. Please contact support or retry from your account page.`,
          type: 'warning',
          onClose: () => navigate('/account'),
        });
        setIsLoading(false);
        return;
      }

      const options: RazorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(total * 100),
        currency: 'INR',
        name: 'Arihant Luxe',
        description: 'Order Payment',
        image: '/favicon.png',
        handler: async (response) => {
          console.log('Razorpay payment successful, response:', response);
          try {
            await updateOrderStatus(orderId, {
              status: 'paid',
              paymentId: response.razorpay_payment_id,
            });

            console.log('Order marked paid successfully, ID:', orderId);
            dispatch(clearCart());
            setNotification({
              title: 'Payment Successful!',
              message: `Thank you for shopping with Arihant Luxe! Your order #${orderId.slice(0, 8).toUpperCase()} is confirmed. We are starting to process your shipment immediately.`,
              type: 'success',
              onClose: () => navigate('/account'),
            });
          } catch (err) {
            console.error('CRITICAL: Order creation failed after payment:', err);
            setNotification({
              title: 'Order Processing Alert',
              message: `Your payment was successful, but we encountered an issue registering your order. Please contact our support team immediately with your Payment ID: ${response.razorpay_payment_id}.`,
              type: 'error',
            });
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: fullName,
          email: email,
        },
        notes: {
          orderId,
        },
        theme: {
          color: '#1a1a1a',
        },
        modal: {
          ondismiss: () => {
            console.log('Razorpay modal dismissed');
            setNotification({
              title: 'Payment Dismissed',
              message: `Your checkout details are saved. You can complete the payment anytime by checking your account history.`,
              type: 'warning',
            });
            setIsLoading(false);
          }
        }
      };

      console.log('Opening Razorpay modal for saved order:', orderId);
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error('Failed to initialize Razorpay:', err);
      setNotification({
        title: 'Initialization Failed',
        message: 'Could not initialize the checkout payment flow. Please verify your connection and try again.',
        type: 'error',
      });
      setIsLoading(false);
    }
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
            <p className="checkout-subtitle">SHIPPING DETAILS AND ORDER SUMMARY.</p>
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
                />
              </div>
              <div className="auth-field">
                <label className="auth-label">FULL NAME</label>
                <input
                  type="text"
                  className="auth-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
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
                placeholder="Street address, apartment, etc."
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
                <div
                  className={`payment-method-card ${paymentMethod === 'online' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('online')}
                  style={{
                    border: paymentMethod === 'online' ? '2px solid var(--accent)' : '1px solid var(--border)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    backgroundColor: paymentMethod === 'online' ? '#fff' : 'transparent',
                    boxShadow: paymentMethod === 'online' ? 'var(--shadow-soft)' : 'none',
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
                      background: paymentMethod === 'online' ? 'var(--accent)' : 'transparent',
                    }}>
                      {paymentMethod === 'online' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.1em' }}>ONLINE PAYMENT</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pay securely with Cards, UPI, or NetBanking.</p>
                </div>

                <div
                  className={`payment-method-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                  style={{
                    border: paymentMethod === 'cod' ? '2px solid var(--accent)' : '1px solid var(--border)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                    backgroundColor: paymentMethod === 'cod' ? '#fff' : 'transparent',
                    boxShadow: paymentMethod === 'cod' ? 'var(--shadow-soft)' : 'none',
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
                      background: paymentMethod === 'cod' ? 'var(--accent)' : 'transparent',
                    }}>
                      {paymentMethod === 'cod' && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.1em' }}>CASH ON DELIVERY</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pay in cash when your order is delivered.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-form-actions" style={{ marginTop: '2.5rem' }}>
            <Link to="/shipping" className="checkout-link">Shipping & Returns</Link>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
              <button
                className="checkout-pay-btn"
                disabled={isLoading}
                onClick={handlePayment}
              >
                {isLoading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay Now'}
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
                  <p className="checkout-item-qty">SIZE: {item.size} | QTY: {item.quantity}</p>
                  <p className='checkout-item-color'>COLOR: {item.color}</p>
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
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
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
