import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { authenticateUser } from '../firebase';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      setServerError('Please enter your email or 10-digit mobile number and password.');
      return;
    }

    // Format validation: must be email with @ or 10-digit mobile number
    const isEmail = cleanId.includes('@');
    const digitsOnly = cleanId.replace(/\D/g, '');
    const isPhone = digitsOnly.length >= 10;

    if (!isEmail && !isPhone) {
      setServerError('Please enter a valid email address or 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      const user = await authenticateUser(cleanId, password);

      dispatch(
        login({
          email: user.email,
          fullName: user.fullName || 'User',
          phoneNumber: user.phoneNumber,
        })
      );

      const params = new URLSearchParams(window.location.search);
      navigate(params.get('redirect') || '/account');
    } catch (error: any) {
      console.error('Login error:', error);
      setServerError(error.message || 'Invalid credentials. Please check and try again.');
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

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email or Mobile Number</label>
            <input
              type="text"
              className="auth-input"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. name@example.com or 9876543210"
              autoFocus
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Sign in with your registered email or 10-digit mobile number
            </span>
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

          <button
            type="submit"
            disabled={loading}
            className="auth-submit"
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '2rem' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
