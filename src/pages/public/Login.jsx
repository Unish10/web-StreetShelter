import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../utils/login.schema';
import { authAPI } from '../../utils/api';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginAs, setLoginAs] = useState(location.state?.role || 'reporter');

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(loginSchema)
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setError('');
        
        try {
            
            const response = await authAPI.login({
                email: data.email,
                password: data.password
            });

            
            const userData = {
                id: response._id,
                username: response.username,
                email: response.email,
                role: response.role,
                token: response.token
            };

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isAuthenticated', 'true');
            
            
            const userRole = response.role === 'owner' ? 'owner' : 'reporter';
            if (userRole !== loginAs && response.role !== 'admin') {
                setError(`This account does not belong to the ${loginAs} role. Please use the correct login portal.`);
                setIsSubmitting(false);
                
                localStorage.removeItem('user');
                localStorage.removeItem('isAuthenticated');
                return;
            }
            
            
            if (response.role === 'owner') {
                navigate('/dashboard/owner');
            } else if (response.role === 'admin') {
                navigate('/dashboard/admin');
            } else {
                navigate('/dashboard/reporter');
            }
            
        } catch (err) {
            setError(err.message || 'Invalid email or password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const goBack = () => {
        navigate('/role-selection');
    };

    return (
        <div className="login-page-container">
            <div className="login-card">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src="/logo.svg" alt="StreetShelter" style={{width: '120px', height: 'auto', display: 'block', margin: '0 auto 1rem'}} />
                </div>
                
                <div style={{ textAlign: 'center' }}>
                    <span className="login-role-badge">
                        <span style={{fontSize: '1.5rem', marginRight: '0.5rem'}}>
                            {loginAs === 'reporter' ? '' : ''}
                        </span>
                        Logging in as {loginAs}
                    </span>
                </div>

                <h1 className="login-title">Welcome Back!</h1>
                <p className="login-subtitle">Sign in to continue making a difference</p>

                {error && (
                    <div style={{ 
                        marginBottom: '1.5rem', 
                        padding: '0.75rem 1rem', 
                        background: '#fef2f2', 
                        border: '1px solid #fecaca', 
                        borderRadius: '0.5rem',
                        color: '#dc2626',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="login-form">
                    <div className="login-form-group">
                        <label className="login-form-label">Email Address</label>
                        <div className="login-input-wrapper">
                            <input
                                type="email"
                                {...register('email')}
                                className="login-input"
                                placeholder=""
                            />
                        </div>
                        {errors.email && (
                            <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                {errors.email.message}
                            </span>
                        )}
                    </div>

                    <div className="login-form-group">
                        <label className="login-form-label">Password</label>
                        <div className="login-input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                {...register('password')}
                                className="login-input"
                                placeholder=""
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="login-password-toggle"
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                        <line x1="1" y1="1" x2="23" y2="23"/>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <span style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                {errors.password.message}
                            </span>
                        )}
                    </div>

                    <div className="login-options">
                        <div className="login-remember">
                            <input type="checkbox" id="remember" />
                            <label htmlFor="remember">Remember me</label>
                        </div>
                        <Link to="/forgot-password" className="login-forgot-link">Forgot Password?</Link>
                    </div>

                    <button type="submit" className="login-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="login-switch-role">
                    <button onClick={goBack} className="login-switch-link" type="button">
                        Back to Role Selection
                    </button>
                </div>

                <div className="login-footer">
                    <p className="login-footer-text">
                        Don't have an account?{' '}
                        <Link to="/register" className="login-create-link">
                            Create Account
                        </Link>
                    </p>
                    <Link to="/" className="login-back-link">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
