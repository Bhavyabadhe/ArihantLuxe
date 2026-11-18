import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { registerUser, createUserProfile } from '../firebase';

const signupSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    phoneNumber: z
      .string()
      .refine((val) => val.replace(/\D/g, '').length === 10, {
        message: 'Mobile number must be exactly 10 digits',
      }),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const phoneNumberValue = watch('phoneNumber') || '';

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 10);
    setValue('phoneNumber', digitsOnly, { shouldValidate: true });
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    setServerError(null);

    const cleanPhone = data.phoneNumber.replace(/\D/g, '').slice(-10);

    try {
      const user = await registerUser(
        data.email.trim(),
        data.password,
        data.fullName.trim(),
        cleanPhone
      );

      await createUserProfile({
        email: user.email,
        fullName: user.fullName,
        phoneNumber: cleanPhone,
      });

      dispatch(
        login({
          email: user.email,
          fullName: user.fullName,
          phoneNumber: cleanPhone,
        })
      );

      const params = new URLSearchParams(window.location.search);
      navigate(params.get('redirect') || '/account');
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

        {serverError && (
          <div
            style={{
              background: '#fee2e2',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              marginBottom: '1.25rem',
              fontSize: '0.85rem',
              lineHeight: '1.4',
              borderLeft: '4px solid #dc2626',
            }}
          >
            {serverError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="auth-field">
            <label className="auth-label">Full Name *</label>
            <input
              {...register('fullName')}
              className="auth-input"
              placeholder="e.g. Priya Sharma"
              autoFocus
            />
            {errors.fullName && (
              <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="auth-field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="auth-label">Mobile Number *</label>
              <span
                style={{
                  fontSize: '0.75rem',
                  color: phoneNumberValue.length === 10 ? '#16a34a' : 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                {phoneNumberValue.length}/10 digits
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-alt)',
                border: errors.phoneNumber ? '1px solid #dc2626' : '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  padding: '0 0.85rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  borderRight: '1px solid var(--border)',
                  background: 'rgba(0,0,0,0.03)',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                🇮🇳 +91
              </span>
              <input
                type="tel"
                value={phoneNumberValue}
                onChange={handlePhoneChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '0.85rem',
                  fontSize: '0.95rem',
                  letterSpacing: '0.05em',
                  background: 'transparent',
                  color: 'var(--text)',
                }}
              />
            </div>
            {errors.phoneNumber && (
              <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label">Email Address *</label>
            <input
              type="email"
              {...register('email')}
              className="auth-input"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label">Password *</label>
            <input
              type="password"
              {...register('password')}
              className="auth-input"
              placeholder="Minimum 6 characters"
            />
            {errors.password && (
              <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="auth-field">
            <label className="auth-label">Confirm Password *</label>
            <input
              type="password"
              {...register('confirmPassword')}
              className="auth-input"
              placeholder="Re-enter password"
            />
            {errors.confirmPassword && (
              <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="auth-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
            <input type="checkbox" {...register('terms')} id="terms" style={{ cursor: 'pointer' }} />
            <label htmlFor="terms" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
              I agree to the Terms & Privacy
            </label>
          </div>
          {errors.terms && (
            <p style={{ color: '#dc2626', fontSize: '0.75rem' }}>
              {errors.terms.message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="auth-submit"
            style={{
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              marginTop: '1rem',
            }}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

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
