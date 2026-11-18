import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { clearCart } from '../store/cartSlice';
import { createOrder } from '../firebase';
import { YouPiCheckoutModal } from '../components/YouPiCheckoutModal';

const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || 'arihantluxe@nyes';
const UPI_NAME = process.env.NEXT_PUBLIC_UPI_NAME || 'Arihant Jain';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector((state: RootState) => state.cart.items);
  const { user, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);

  // Checkout Information Fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState('');
  const [houseNo, setHouseNo] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Rajasthan');
  const [pincode, setPincode] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [country] = useState('India');

  // YouPI-PG Gateway & UTR state
  const [showQrModal, setShowQrModal] = useState(false);
  const [orderRef, setOrderRef] = useState('');
  const [utrError, setUtrError] = useState('');
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

  const validateShipping = (): boolean => {
    if (!fullName.trim()) {
      setNotification({
        title: 'Missing Information',
        message: 'Please enter your Name.',
        type: 'warning',
      });
      return false;
    }
    if (!mobileNumber.trim()) {
      setNotification({
        title: 'Missing Information',
        message: 'Please enter your Mobile/WhatsApp No.',
        type: 'warning',
      });
      return false;
    }
    const cleanDigits = mobileNumber.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setNotification({
        title: 'Invalid Mobile Number',
        message: 'Please enter a valid 10-digit Mobile/WhatsApp number.',
        type: 'warning',
      });
      return false;
    }
    if (!houseNo.trim()) {
      setNotification({
        title: 'Missing Information',
        message: 'Please enter your House/Flat No.',
        type: 'warning',
      });
      return false;
    }
    if (!street.trim()) {
      setNotification({
        title: 'Missing Information',
        message: 'Please enter your Street/Road.',
        type: 'warning',
      });
      return false;
    }
    if (!area.trim()) {
      setNotification({
        title: 'Missing Information',
        message: 'Please enter your Area/Locality.',
        type: 'warning',
      });
      return false;
    }
    if (!city.trim()) {
      setNotification({
        title: 'Missing Information',
        message: 'Please enter your City.',
        type: 'warning',
      });
      return false;
    }
    if (!state.trim()) {
      setNotification({
        title: 'Missing Information',
        message: 'Please select your State.',
        type: 'warning',
      });
      return false;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      setNotification({
        title: 'Invalid PIN Code',
        message: 'Please enter a valid 6-digit PIN Code.',
        type: 'warning',
      });
      return false;
    }
    if (!email.trim()) {
      setNotification({
        title: 'Missing Information',
        message: 'Please enter your Email address for order tracking.',
        type: 'warning',
      });
      return false;
    }
    return true;
  };

  const handleCheckoutSubmit = () => {
    if (!validateShipping()) return;

    // Generate unique order reference and open YouPI UPI modal
    const generatedRef = 'ALX-' + Date.now().toString(36).toUpperCase();
    setOrderRef(generatedRef);
    setUtrError('');
    setShowQrModal(true);
  };

  const handleUtrSubmit = async (cleanUtr: string) => {
    setSubmittingUtr(true);
    setUtrError('');

    try {
      const fullAddress = [
        houseNo.trim(),
        street.trim(),
        area.trim(),
        landmark.trim() ? `Near ${landmark.trim()}` : '',
        city.trim(),
        `${state.trim()} - ${pincode.trim()}`,
        'India',
      ]
        .filter(Boolean)
        .join(', ');

      const orderId = await createOrder({
        userEmail: email.trim(),
        userFullName: fullName.trim(),
        items: items,
        subtotal: subtotal,
        shippingFee: shipping,
        total: total,
        shippingAddress: {
          email: email.trim(),
          fullName: fullName.trim(),
          name: fullName.trim(),
          address: fullAddress,
          houseNo: houseNo.trim(),
          street: street.trim(),
          area: area.trim(),
          landmark: landmark.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          country: 'India',
          contactNumber: mobileNumber.trim(),
          mobileNumber: mobileNumber.trim(),
        },
        contactNumber: mobileNumber.trim(),
        status: 'paid_pending_verification',
        paymentMethod: 'youpi_upi',
        paymentId: cleanUtr,
        orderReference: orderRef,
        createdAt: Date.now(),
      });

      setShowQrModal(false);
      dispatch(clearCart());
      setNotification({
        title: 'Payment Submitted via YouPI!',
        message: `Your order #${orderId.slice(0, 8).toUpperCase()} has been received with UTR Ref: ${cleanUtr}. We will verify your transaction and update your order tracking shortly.`,
        type: 'success',
        onClose: () => navigate('/account'),
      });
    } catch (err: any) {
      console.error('YouPI Order error:', err);
      setUtrError('Failed to record your order. Please try submitting again.');
    } finally {
      setSubmittingUtr(false);
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
            <p className="checkout-subtitle">SHIPPING DETAILS AND PAYMENT SUMMARY.</p>
          </div>

          <div className="checkout-form-group">
            <h3 className="serif" style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>
              Shipping Information
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              Please enter your full delivery address and mobile number for dispatch updates.
            </p>

            {/* Row 1: Name & Mobile/WhatsApp No. */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="auth-field">
                <label className="auth-label">
                  Name <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                <input
                  type="text"
                  className="auth-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter full recipient name"
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">
                  Mobile/WhatsApp No. <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                <input
                  type="tel"
                  className="auth-input"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="10-digit mobile number"
                  maxLength={13}
                  required
                />
              </div>
            </div>

            {/* Row 2: Email & House/Flat No. */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="auth-field">
                <label className="auth-label">
                  Email Address <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="For invoice & order tracking"
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">
                  House/Flat No. <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                <input
                  type="text"
                  className="auth-input"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  placeholder="e.g. Flat 302, House No. 12"
                  required
                />
              </div>
            </div>

            {/* Row 3: Street/Road & Area/Locality */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="auth-field">
                <label className="auth-label">
                  Street/Road <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                <input
                  type="text"
                  className="auth-input"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. MG Road, 5th Cross Street"
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">
                  Area/Locality <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                <input
                  type="text"
                  className="auth-input"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Indiranagar, Civil Lines, Bhankrota"
                  required
                />
              </div>
            </div>

            {/* Row 4: Landmark & City */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="auth-field">
                <label className="auth-label">
                  Landmark <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'none' }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  className="auth-input"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near City Mall, Opp. Axis Bank"
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">
                  City <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                <input
                  type="text"
                  className="auth-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Jaipur, Mumbai, New Delhi"
                  required
                />
              </div>
            </div>

            {/* Row 5: State & PIN Code */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div className="auth-field">
                <label className="auth-label">
                  State <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                <select
                  className="auth-input"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  required
                  style={{ cursor: 'pointer' }}
                >
                  <option value="">Select State / UT</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="auth-field">
                <label className="auth-label">
                  PIN Code <span style={{ color: '#b91c1c' }}>*</span>
                </label>
                <input
                  type="text"
                  className="auth-input"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit PIN code (e.g. 302026)"
                  maxLength={6}
                  required
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 className="serif" style={{ fontSize: '1.5rem', margin: 0 }}>Payment Method</h3>
                <span style={{ fontSize: '0.68rem', background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '4px', fontWeight: 600, letterSpacing: '0.04em' }}>
                  ✓ 0% Platform Fee
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* YouPI Direct UPI Payment */}
                <div
                  className="payment-method-card selected"
                  style={{
                    border: '2px solid var(--accent)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#fff',
                    boxShadow: 'var(--shadow-soft)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid var(--accent)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--accent)',
                      }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                        YouPI Direct UPI (0% Convenience Fee)
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600 }}>INSTANT</span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '2rem', marginBottom: '0.5rem' }}>
                    Dynamic QR Code & Mobile 1-Tap Pay via Google Pay, PhonePe, Paytm, CRED or any UPI App.
                  </p>

                  <div style={{ display: 'flex', gap: '0.35rem', marginLeft: '2rem', flexWrap: 'wrap' }}>
                    {['Google Pay', 'PhonePe', 'Paytm', 'CRED', 'BHIM', 'Navi'].map((app) => (
                      <span
                        key={app}
                        style={{
                          fontSize: '0.66rem',
                          background: '#f1f5f9',
                          color: '#475569',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontWeight: 500,
                        }}
                      >
                        {app}
                      </span>
                    ))}
                  </div>
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
                onClick={handleCheckoutSubmit}
              >
                Pay Rs.{total.toFixed(2)} with YouPI
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

      {/* YouPI Open-Source Gateway Checkout Modal */}
      <YouPiCheckoutModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        amount={total}
        orderRef={orderRef}
        upiId={UPI_ID}
        upiName={UPI_NAME}
        customerName={fullName}
        customerEmail={email}
        onSubmitUtr={handleUtrSubmit}
        isSubmitting={submittingUtr}
        errorMessage={utrError}
      />

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
