import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { authenticateUser } from '../firebase';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof LoginFormData, string>> = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      setLoading(true);
      setServerError(null);
      try {
        const user = await authenticateUser(formData.email.trim(), formData.password);

        // Update Redux & persistent session
        dispatch(login({ 
          email: user.email, 
          fullName: user.fullName || 'User' 
        }));

        const params = new URLSearchParams(window.location.search);
        navigate(params.get('redirect') || '/account');
      } catch (error: any) {
        console.error('Login error:', error);
        setServerError(error.message || 'Invalid email or password.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title serif">Welcome back</h1>
          <p className="auth-subtitle">Please sign in to your account</p>
        </div>

        {serverError && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">Email Address</label>
            <input
              type="email"
              className="auth-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="you@example.com"
            />
            {errors.email && <p style={{ color: 'red', fontSize: '0.75rem' }}>{errors.email}</p>}
          </div>

          <div className="auth-field">
            <label className="auth-label">Password</label>
            <input
              type="password"
              className="auth-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
            />
            {errors.password && <p style={{ color: 'red', fontSize: '0.75rem' }}>{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;