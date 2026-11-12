import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import { getUserOrders, type OrderDoc } from '../firebase';

const getStatusDetails = (status: string) => {
  switch (status) {
    case 'paid':
      return { label: 'Paid', color: '#166534', bg: '#f0fdf4' };
    case 'cod_pending':
      return { label: 'COD - Pending', color: '#b45309', bg: '#fef3c7' };
    case 'processing':
      return { label: 'Processing', color: '#1e3a8a', bg: '#dbeafe' };
    case 'shipped':
      return { label: 'Shipped', color: '#6b21a8', bg: '#f3e8ff' };
    case 'delivered':
      return { label: 'Delivered', color: '#065f46', bg: '#d1fae5' };
    case 'created':
      return { label: 'Created', color: '#1e40af', bg: '#dbeafe' };
    case 'failed':
      return { label: 'Failed', color: '#991b1b', bg: '#fef2f2' };
    default:
      return { label: status, color: '#1f2937', bg: '#f3f4f6' };
  }
};

const Account: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);

  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<(OrderDoc & { id: string })[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const toggleTrackOrder = (orderId: string) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const getStageStatus = (currentStatus: string, stage: 'placed' | 'processing' | 'shipped' | 'delivered') => {
    const statusPrecedence: Record<string, number> = {
      'created': 0,
      'failed': 0,
      'paid': 1,
      'cod_pending': 1,
      'processing': 2,
      'shipped': 3,
      'delivered': 4
    };

    const currentPrecedence = statusPrecedence[currentStatus] ?? 0;
    const stagePrecedence: Record<string, number> = {
      'placed': 1,
      'processing': 2,
      'shipped': 3,
      'delivered': 4
    };

    const targetPrecedence = stagePrecedence[stage];

    if (currentPrecedence >= targetPrecedence) {
      return 'active';
    } else if (currentPrecedence + 1 === targetPrecedence && currentPrecedence > 0) {
      return 'next';
    } else {
      return 'inactive';
    }
  };

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      navigate('/login');
    } else if (isAuthenticated && user?.email) {
      fetchOrders(user.email);
    }
  }, [isInitialized, isAuthenticated, user, navigate]);

  const fetchOrders = async (email: string) => {
    try {
      const userOrders = await getUserOrders(email);
      setOrders(userOrders);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      dispatch(logout());
      navigate('/login');
    }, 600);
  };

  if (!user) return null;

  return (
    <div className="auth-page">
      <div className="max-w-6xl w-full mx-auto px-6 py-16">
        <div className="auth-header" style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '2.5rem' }}>
          <div>
            <h1 className="auth-title serif" style={{ fontSize: '3.5rem' }}>My Account</h1>
            <p className="auth-subtitle">WELCOME BACK, {user.fullName?.toUpperCase() || 'USER'}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="account-signout"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 600 }}
          >
            {isLoading ? 'SIGNING OUT...' : 'SIGN OUT'}
          </button>
        </div>

        <div className="account-grid">
          {/* Profile Info */}
          <section>
            <h3 className="serif account-section-title">Profile Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="auth-field">
                <label className="auth-label">FULL NAME</label>
                <p style={{ fontSize: '1.1rem', color: 'var(--text)', fontWeight: 500 }}>{user.fullName || 'Guest User'}</p>
              </div>
              <div className="auth-field">
                <label className="auth-label">EMAIL ADDRESS</label>
                <p style={{ fontSize: '1.1rem', color: 'var(--text)', fontWeight: 500 }}>{user.email}</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/admin" className="admin-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', padding: '0.8rem 2rem', background: 'var(--text)', color: '#fff' }}>
                  MANAGE PRODUCTS
                </Link>
                <Link to="/journal/admin" className="admin-btn" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', padding: '0.8rem 2rem' }}>
                  MANAGE JOURNAL
                </Link>
              </div>
            </div>
          </section>

          {/* Order History */}
          <section>
            <h3 className="serif account-section-title">Order History</h3>
            {orders.length === 0 ? (
              <div style={{ border: '1px solid var(--border)', padding: '4rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-sm)', background: '#fafafa' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.05em' }}>You haven't placed any orders yet.</p>
                <Link to="/" className="auth-link" style={{ display: 'inline-block', marginTop: '1.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                  START SHOPPING
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div>
                        <p className="order-id">ORDER #{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="order-date">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="order-total">Rs.{order.subtotal.toFixed(2)}</p>
                        <span className="order-status" style={{
                          color: getStatusDetails(order.status).color,
                          background: getStatusDetails(order.status).bg
                        }}>{getStatusDetails(order.status).label}</span>
                      </div>
                    </div>
                    <div className="order-items-preview">
                      {order.items.map((item, idx) => (
                        <img key={idx} src={item.image} alt={item.name} className="order-item-thumb" title={`${item.name} (Size: ${item.size}, Color: ${item.color})`} />
                      ))}
                    </div>

                    <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
                      <button
                        onClick={() => toggleTrackOrder(order.id)}
                        style={{
                          background: 'none',
                          border: '1px solid var(--border)',
                          padding: '0.6rem 1.2rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'var(--transition)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--text)';
                          e.currentTarget.style.backgroundColor = 'var(--bg-alt)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {expandedOrders[order.id] ? 'Hide Tracking Details' : 'Track Order'}
                        <span style={{ transition: 'transform 0.3s', transform: expandedOrders[order.id] ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                      </button>

                      {expandedOrders[order.id] && (
                        <div style={{
                          marginTop: '1.5rem',
                          padding: '1.5rem',
                          backgroundColor: '#faf8f5',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          animation: 'slideDown 0.3s ease-out',
                        }}>
                          {order.status === 'created' || order.status === 'failed' ? (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                              <p style={{ fontWeight: 600, color: '#991b1b', fontSize: '0.95rem' }}>
                                {order.status === 'created' ? 'Payment Pending' : 'Order Unsuccessful'}
                              </p>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                                {order.status === 'created'
                                  ? 'This order was saved, but payment was not completed. Please complete payment to start tracking.'
                                  : 'This order was unsuccessful or cancelled.'}
                              </p>
                            </div>
                          ) : (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                  Estimated Delivery: {new Date(order.createdAt + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                  Carrier: Arihant Luxe Express
                                </span>
                              </div>

                              {/* Stepper Row */}
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', margin: '0 1rem 2.5rem' }}>
                                {/* Background Connector Line */}
                                <div style={{
                                  position: 'absolute',
                                  top: '15px',
                                  left: 0,
                                  right: 0,
                                  height: '2px',
                                  backgroundColor: '#e5e7eb',
                                  zIndex: 1,
                                }} />

                                {/* Dynamic Progress Fill Line */}
                                <div style={{
                                  position: 'absolute',
                                  top: '15px',
                                  left: 0,
                                  width: order.status === 'delivered' ? '100%' : order.status === 'shipped' ? '66%' : order.status === 'processing' ? '33%' : '0%',
                                  height: '2px',
                                  backgroundColor: 'var(--accent)',
                                  zIndex: 2,
                                  transition: 'width 0.5s ease-in-out',
                                }} />

                                {/* Step 1: Placed */}
                                {(() => {
                                  const stage = 'placed';
                                  const status = getStageStatus(order.status, stage);
                                  const isActive = status === 'active';
                                  return (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, position: 'relative', width: '60px' }}>
                                      <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: isActive ? 'var(--accent)' : '#ffffff',
                                        border: isActive ? '2px solid var(--accent)' : '2px solid #d1d5db',
                                        color: isActive ? '#ffffff' : '#9ca3af',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        transition: 'all 0.3s',
                                        boxShadow: isActive ? '0 0 10px rgba(197, 160, 89, 0.4)' : 'none',
                                      }}>
                                        {order.status !== 'cod_pending' && order.status !== 'paid' && isActive ? '✓' : '1'}
                                      </div>
                                      <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--text)' : 'var(--text-muted)', marginTop: '0.5rem', whiteSpace: 'nowrap' }}>Placed</span>
                                    </div>
                                  );
                                })()}

                                {/* Step 2: Processing */}
                                {(() => {
                                  const stage = 'processing';
                                  const status = getStageStatus(order.status, stage);
                                  const isActive = status === 'active';
                                  return (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, position: 'relative', width: '60px' }}>
                                      <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: isActive ? 'var(--accent)' : '#ffffff',
                                        border: isActive ? '2px solid var(--accent)' : '2px solid #d1d5db',
                                        color: isActive ? '#ffffff' : '#9ca3af',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        transition: 'all 0.3s',
                                        boxShadow: isActive ? '0 0 10px rgba(197, 160, 89, 0.4)' : 'none',
                                      }}>
                                        {order.status !== 'processing' && isActive ? '✓' : '2'}
                                      </div>
                                      <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--text)' : 'var(--text-muted)', marginTop: '0.5rem', whiteSpace: 'nowrap' }}>Processing</span>
                                    </div>
                                  );
                                })()}

                                {/* Step 3: Shipped */}
                                {(() => {
                                  const stage = 'shipped';
                                  const status = getStageStatus(order.status, stage);
                                  const isActive = status === 'active';
                                  return (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, position: 'relative', width: '60px' }}>
                                      <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: isActive ? 'var(--accent)' : '#ffffff',
                                        border: isActive ? '2px solid var(--accent)' : '2px solid #d1d5db',
                                        color: isActive ? '#ffffff' : '#9ca3af',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        transition: 'all 0.3s',
                                        boxShadow: isActive ? '0 0 10px rgba(197, 160, 89, 0.4)' : 'none',
                                      }}>
                                        {order.status !== 'shipped' && isActive ? '✓' : '3'}
                                      </div>
                                      <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--text)' : 'var(--text-muted)', marginTop: '0.5rem', whiteSpace: 'nowrap' }}>Shipped</span>
                                    </div>
                                  );
                                })()}

                                {/* Step 4: Delivered */}
                                {(() => {
                                  const stage = 'delivered';
                                  const status = getStageStatus(order.status, stage);
                                  const isActive = status === 'active';
                                  return (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, position: 'relative', width: '60px' }}>
                                      <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        backgroundColor: isActive ? 'var(--accent)' : '#ffffff',
                                        border: isActive ? '2px solid var(--accent)' : '2px solid #d1d5db',
                                        color: isActive ? '#ffffff' : '#9ca3af',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                        transition: 'all 0.3s',
                                        boxShadow: isActive ? '0 0 10px rgba(197, 160, 89, 0.4)' : 'none',
                                      }}>
                                        {isActive ? '✓' : '4'}
                                      </div>
                                      <span style={{ fontSize: '0.75rem', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--text)' : 'var(--text-muted)', marginTop: '0.5rem', whiteSpace: 'nowrap' }}>Delivered</span>
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Status Details Text Description */}
                              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <div style={{ fontSize: '1.25rem' }}>ℹ️</div>
                                <div>
                                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
                                    {order.status === 'cod_pending' || order.status === 'paid' ? 'Order Confirmed' :
                                      order.status === 'processing' ? 'Preparing Package' :
                                        order.status === 'shipped' ? 'In Transit' :
                                          order.status === 'delivered' ? 'Package Delivered' : 'Status Info'}
                                  </p>
                                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: '1.4' }}>
                                    {order.status === 'cod_pending' ? 'Your Cash on Delivery order is placed and awaiting processing. We will verify and process it shortly.' :
                                      order.status === 'paid' ? 'Payment was successfully authorized. Your order has been placed and is currently in the dispatch queue.' :
                                        order.status === 'processing' ? 'Our team is carefully preparing, verifying, and packaging your selected items. It will be dispatched soon.' :
                                          order.status === 'shipped' ? 'Your package has left our warehouse and is in transit with our logistics partner. Live tracking updates are active.' :
                                            order.status === 'delivered' ? 'Your package was safely delivered to your address. Thank you for choosing Arihant Luxe!' : ''}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Account;