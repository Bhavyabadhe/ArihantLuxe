import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import {
  registerUser,
  createUserProfile,
  setupRecaptcha,
  sendPhoneOtp,
  verifyPhoneOtp,
  type ConfirmationResult,
} from '../firebase';

const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Mode: 'phone' (default since Phone auth is enabled in Firebase) or 'email'
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');

  // Phone OTP Sign-Up State
  const [phoneName, setPhoneName] = useState('');
  const [phone, setPhone] = useState('');
  const [otpStep, setOtpStep] = useState<'enter_phone' | 'enter_otp'>('enter_phone');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Email Sign-Up State & Status
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', terms: false },
  });

  // 1. Phone OTP Send
  const handlePhoneSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneName.trim()) {
      setServerError('Please enter your full name.');
      return;
    }
    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 10) {
      setServerError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    try {
      const verifier = setupRecaptcha('recaptcha-signup-container');
      const confirmation = await sendPhoneOtp(cleanDigits, verifier);
      setConfirmationResult(confirmation);
      setOtpStep('enter_otp');
      setResendTimer(30);
      setSuccessMessage(`OTP sent to +91 ${cleanDigits.slice(-10)}`);
    } catch (err: any) {
      console.error('Phone Signup OTP error:', err);
      setServerError(err.message || 'Failed to send OTP. Please check the mobile number.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Phone OTP Verify & Register
  const handlePhoneVerifyOtp = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    setServerError(null);

    try {
      const user = await verifyPhoneOtp(confirmationResult, cleanOtp, phoneName.trim());

      dispatch(
        login({
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
        })
      );

      navigate('/account');
    } catch (err: any) {
      console.error('Phone Signup Verify error:', err);
      setServerError(err.message || 'Invalid OTP code. Please check your SMS and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Email Signup Submit
  const onEmailSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const user = await registerUser(data.email.trim(), data.password, data.fullName.trim());

      await createUserProfile({
        email: user.email,
        fullName: user.fullName,
      });

      dispatch(login({ email: user.email, fullName: user.fullName }));
      navigate('/account');
    } catch (error: any) {
      console.error('Signup error:', error);
      setServerError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title serif">Create Account</h2>
          <p className="auth-subtitle">Join the Arihant Luxe patron circle</p>
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

        {/* MODE 1: PHONE SIGNUP (SMS OTP) */}
        {authMode === 'phone' && (
          <div>
            {otpStep === 'enter_phone' ? (
              <form onSubmit={handlePhoneSendOtp} className="auth-form">
                <div className="auth-field">
                  <label className="auth-label">Full Name</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={phoneName}
                    onChange={(e) => setPhoneName(e.target.value)}
                    placeholder="Enter your name"
                    required
                  />
                </div>

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
                      }}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div id="recaptcha-signup-container" />

                <button
                  type="submit"
                  disabled={isSubmitting || phone.replace(/\D/g, '').length < 10 || !phoneName.trim()}
                  className="auth-submit"
                  style={{
                    opacity: isSubmitting || phone.replace(/\D/g, '').length < 10 || !phoneName.trim() ? 0.7 : 1,
                    cursor:
                      isSubmitting || phone.replace(/\D/g, '').length < 10 || !phoneName.trim()
                        ? 'not-allowed'
                        : 'pointer',
                  }}
                >
                  {isSubmitting ? 'Sending OTP...' : 'Send Verification OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handlePhoneVerifyOtp} className="auth-form">
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
                      <span style={{ color: 'var(--text-muted)' }}>Resend in {resendTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePhoneSendOtp}
                        disabled={isSubmitting}
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
                  disabled={isSubmitting || otpCode.length < 6}
                  className="auth-submit"
                  style={{
                    opacity: isSubmitting || otpCode.length < 6 ? 0.7 : 1,
                    cursor: isSubmitting || otpCode.length < 6 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmitting ? 'Creating Account...' : 'Verify & Create Account'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODE 2: EMAIL SIGNUP (FALLBACK) */}
        {authMode === 'email' && (
          <form className="auth-form" onSubmit={handleSubmit(onEmailSubmit)}>
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input {...register('fullName')} className="auth-input" placeholder="John Doe" />
              {errors.fullName && <p style={{ color: 'red', fontSize: '0.75rem' }}>{errors.fullName.message}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label">Email Address</label>
              <input {...register('email')} className="auth-input" placeholder="you@example.com" />
              {errors.email && <p style={{ color: 'red', fontSize: '0.75rem' }}>{errors.email.message}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <input type="password" {...register('password')} className="auth-input" placeholder="********" />
              {errors.password && <p style={{ color: 'red', fontSize: '0.75rem' }}>{errors.password.message}</p>}
            </div>

            <div className="auth-field">
              <label className="auth-label">Confirm Password</label>
              <input type="password" {...register('confirmPassword')} className="auth-input" placeholder="********" />
              {errors.confirmPassword && (
                <p style={{ color: 'red', fontSize: '0.75rem' }}>{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="auth-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" {...register('terms')} id="terms" />
              <label htmlFor="terms" style={{ fontSize: '0.85rem' }}>
                I agree to the Terms & Privacy
              </label>
            </div>
            {errors.terms && <p style={{ color: 'red', fontSize: '0.75rem' }}>{errors.terms.message}</p>}

            <button type="submit" disabled={isSubmitting} className="auth-submit">
              {isSubmitting ? 'Signing up...' : 'Sign Up with Email'}
            </button>
          </form>
        )}

        <div className="auth-footer" style={{ marginTop: '2rem' }}>
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}