import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import {
  authenticateUser,
  setupRecaptcha,
  sendPhoneOtp,
  verifyPhoneOtp,
  type ConfirmationResult,
} from '../firebase';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Mode: 'phone' (default since Phone auth is enabled in Firebase) or 'email'
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');

  // Phone OTP State
  const [phone, setPhone] = useState('');
  const [otpStep, setOtpStep] = useState<'enter_phone' | 'enter_otp'>('enter_phone');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Email/Password State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Resend Countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // 1. Send OTP to Phone
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      setServerError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const verifier = setupRecaptcha('recaptcha-container');
      const confirmation = await sendPhoneOtp(cleanDigits, verifier);
      setConfirmationResult(confirmation);
      setOtpStep('enter_otp');
      setResendTimer(30);
      setSuccessMessage(`OTP sent to +91 ${cleanDigits.slice(-10)}`);
    } catch (err: any) {
      console.error('Send OTP error:', err);
      setServerError(err.message || 'Failed to send OTP. Please check the number and try again.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify Phone OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) {
      setServerError('Session expired. Please request a new OTP.');
      setOtpStep('enter_phone');
      return;
    }
    const cleanOtp = otpCode.trim();
    if (cleanOtp.length < 6) {
      setServerError('Please enter the complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      const user = await verifyPhoneOtp(confirmationResult, cleanOtp);

      dispatch(
        login({
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
        })
      );

      const params = new URLSearchParams(window.location.search);
      navigate(params.get('redirect') || '/account');
    } catch (err: any) {
      console.error('Verify OTP error:', err);
      setServerError(err.message || 'Invalid OTP code. Please check your SMS and try again.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Email & Password Fallback Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setServerError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      const user = await authenticateUser(email.trim(), password);

      dispatch(
        login({
          email: user.email,
          fullName: user.fullName || 'User',
        })
      );

      const params = new URLSearchParams(window.location.search);
      navigate(params.get('redirect') || '/account');
    } catch (error: any) {
      console.error('Login error:', error);
      setServerError(error.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title serif">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your Arihant Luxe account</p>
        </div>

        {/* Auth Method Selector Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border)',
            marginBottom: '1.5rem',
            gap: '0.5rem',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setAuthMode('phone');
              setServerError(null);
            }}
            style={{
              flex: 1,
              padding: '0.75rem 0.5rem',
              background: 'none',
              border: 'none',
              borderBottom: authMode === 'phone' ? '2px solid var(--accent)' : '2px solid transparent',
              color: authMode === 'phone' ? 'var(--text)' : 'var(--text-muted)',
              fontWeight: authMode === 'phone' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            📱 Mobile OTP
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('email');
              setServerError(null);
            }}
            style={{
              flex: 1,
              padding: '0.75rem 0.5rem',
              background: 'none',
              border: 'none',
              borderBottom: authMode === 'email' ? '2px solid var(--accent)' : '2px solid transparent',
              color: authMode === 'email' ? 'var(--text)' : 'var(--text-muted)',
              fontWeight: authMode === 'email' ? 700 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            ✉️ Email & Password
          </button>
        </div>

        {serverError && (
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
              lineHeight: '1.4',
            }}
          >
            {serverError}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              background: '#ecfdf5',
              color: '#065f46',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              marginBottom: '1.25rem',
              fontSize: '0.82rem',
            }}
          >
            ✓ {successMessage}
          </div>
        )}

        {/* MODE 1: PHONE NUMBER AUTH (SMS OTP) */}
        {authMode === 'phone' && (
          <div>
            {otpStep === 'enter_phone' ? (
              <form onSubmit={handleSendOtp} className="auth-form">
                <div className="auth-field">
                  <label className="auth-label">Mobile Number</label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--bg-alt)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                    }}
                  >
                    <span
                      style={{
                        padding: '0.8rem 0.9rem',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'var(--text)',
                        borderRight: '1px solid var(--border)',
                        background: '#f8fafc',
                        userSelect: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <span>🇮🇳</span> +91
                    </span>
                    <input
                      type="tel"
                      className="auth-input"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: '0.8rem 1rem',
                        fontSize: '1rem',
                        letterSpacing: '0.05em',
                      }}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      autoFocus
                      required
                    />
                  </div>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.4rem',
                    }}
                  >
                    We will send a 6-digit SMS verification code to verify your phone.
                  </span>
                </div>

                {/* Invisible reCAPTCHA container */}
                <div id="recaptcha-container" />

                <button
                  type="submit"
                  disabled={loading || phone.replace(/\D/g, '').length < 10}
                  className="auth-submit"
                  style={{
                    opacity: loading || phone.replace(/\D/g, '').length < 10 ? 0.7 : 1,
                    cursor: loading || phone.replace(/\D/g, '').length < 10 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Sending OTP Code...' : 'Send Verification Code (OTP)'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="auth-form">
                <div className="auth-field">
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <label className="auth-label" style={{ margin: 0 }}>
                      Enter 6-Digit OTP
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpStep('enter_phone');
                        setOtpCode('');
                        setServerError(null);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        padding: 0,
                      }}
                    >
                      Change Number
                    </button>
                  </div>

                  <input
                    type="text"
                    className="auth-input"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="• • • • • •"
                    style={{
                      textAlign: 'center',
                      fontSize: '1.4rem',
                      letterSpacing: '0.4em',
                      fontWeight: 700,
                    }}
                    maxLength={6}
                    autoFocus
                    required
                  />

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '0.65rem',
                      fontSize: '0.75rem',
                    }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>
                      Sent to: <strong>+91 {phone.slice(-10)}</strong>
                    </span>

                    {resendTimer > 0 ? (
                      <span style={{ color: 'var(--text-muted)' }}>
                        Resend in {resendTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          padding: 0,
                        }}
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="auth-submit"
                  style={{
                    opacity: loading || otpCode.length < 6 ? 0.7 : 1,
                    cursor: loading || otpCode.length < 6 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODE 2: EMAIL & PASSWORD (FALLBACK) */}
        {authMode === 'email' && (
          <form onSubmit={handleEmailSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <input
                type="email"
                className="auth-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input
                type="password"
                className="auth-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? 'Signing in...' : 'Sign In with Email'}
            </button>
          </form>
        )}

        <div className="auth-footer" style={{ marginTop: '2rem' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;