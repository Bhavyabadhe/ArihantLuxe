import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../store/authSlice';
import { registerUser, createUserProfile } from '../firebase';

const signupSchema = z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', terms: false },
    });

    const onSubmit = async (data: SignupFormData) => {
        setIsSubmitting(true);
        setServerError(null);
        try {
            // Register user via Firebase or local store
            const user = await registerUser(data.email.trim(), data.password, data.fullName.trim());

            // Save user profile
            await createUserProfile({
                email: user.email,
                fullName: user.fullName
            });

            // Update Redux & persistent session
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
                    <p className="auth-subtitle">Join the Arihant Luxe collection</p>
                </div>

                {serverError && (
                    <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                        {serverError}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
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
                        {errors.confirmPassword && <p style={{ color: 'red', fontSize: '0.75rem' }}>{errors.confirmPassword.message}</p>}
                    </div>

                    <div className="auth-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="checkbox" {...register('terms')} id="terms" />
                        <label htmlFor="terms" style={{ fontSize: '0.85rem' }}>I agree to the Terms & Privacy</label>
                    </div>
                    {errors.terms && <p style={{ color: 'red', fontSize: '0.75rem' }}>{errors.terms.message}</p>}

                    <button type="submit" disabled={isSubmitting} className="auth-submit">
                        {isSubmitting ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">Sign in</Link>
                </div>
            </div>
        </div>
    );
}