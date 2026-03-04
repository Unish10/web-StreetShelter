import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '../../utils/register.schema';
import { authAPI } from '../../utils/api';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'user'
        }
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setError('');
        
        try {
            
            const response = await authAPI.register({
                username: data.name,
                email: data.email,
                password: data.password,
                role: 'user' 
            });

            
            const userData = {
                id: response._id,
                username: response.username,
                name: response.name || response.username,
                email: response.email,
                role: response.role,
                token: response.token,
                phone: data.phone,
                address: data.address
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('isAuthenticated', 'true');
            
            if (data.role === 'owner') {
                navigate('/dashboard/owner-registration');
            } else {
                navigate('/dashboard');
            }
            
        } catch (err) {
            setError(err.message || 'Registration failed. This email may already be in use.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="register-page-container">
            <div className="register-wrapper">
                <div className="register-card">
                    <Link to="/" className="register-logo-link">
                        <img src="/logo.svg" alt="StreetShelter" className="register-logo-image" style={{width: '150px', height: 'auto', display: 'block', margin: '0 auto'}} />
                    </Link>

                    <div className="register-header">
                        <h2 className="register-title">
                            Join StreetShelter
                        </h2>
                        <p className="register-subtitle">Create an account to start saving lives</p>
                    </div>
                    
                    {error && (
                        <div className="register-error">
                            <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="register-form">
                        <div className="register-grid">
                            <div className="register-form-group">
                                <label className="register-label">
                                    Full Name
                                </label>
                                <input 
                                    type="text" 
                                    {...register('name')}
                                    placeholder=""
                                    className="register-input"
                                />
                                {errors.name && (
                                    <p className="register-error-message">
                                        <svg fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                        </svg>
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            <div className="register-form-group">
                                <label className="register-label">
                                    Email Address
                                </label>
                                <input 
                                    type="email" 
                                    {...register('email')}
                                    placeholder=""
                                    className="register-input"
                                />
                                {errors.email && (
                                    <p className="register-error-message">
                                        <svg fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                        </svg>
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="register-grid">
                            <div className="register-form-group">
                                <label className="register-label">
                                    Phone Number
                                </label>
                                <input 
                                    type="tel" 
                                    {...register('phone')}
                                    placeholder=""
                                    className="register-input"
                                />
                                {errors.phone && (
                                    <p className="register-error-message">
                                        <svg fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                        </svg>
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>

                            <div className="register-form-group">
                                <label className="register-label">
                                    Address
                                </label>
                                <input 
                                    type="text" 
                                    {...register('address')}
                                    placeholder=""
                                    className="register-input"
                                />
                                {errors.address && (
                                    <p className="register-error-message">
                                        <svg fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                        </svg>
                                        {errors.address.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="register-form-group">
                            <label className="register-label">
                                I want to register as
                            </label>
                            <select 
                                {...register('role')}
                                className="register-input"
                                style={{cursor: 'pointer'}}
                            >
                                <option value="user">Reporter - Report animals in need</option>
                                <option value="owner">Rescue Owner - Rescue & care for animals</option>
                            </select>
                            {errors.role && (
                                <p className="register-error-message">
                                    <svg fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                    </svg>
                                    {errors.role.message}
                                </p>
                            )}
                        </div>

                        <div className="register-grid">
                            <div>
                                <label className="register-label">
                                    Password
                                </label>
                                <div className="register-input-wrapper">
                                    <input 
                                        type={showPassword ? 'text' : 'password'}
                                        {...register('password')}
                                        placeholder="••••••••"
                                        className="register-input register-input-with-icon"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="register-password-toggle"
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
                                    <p className="register-error-message">
                                        <svg fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                        </svg>
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="register-label">
                                    Confirm Password
                                </label>
                                <div className="register-input-wrapper">
                                    <input 
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        {...register('confirmPassword')}
                                        placeholder="••••••••"
                                        className="register-input register-input-with-icon"
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="register-password-toggle"
                                    >
                                        {showConfirmPassword ? (
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
                                {errors.confirmPassword && (
                                    <p className="register-error-message">
                                        <svg fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                                        </svg>
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="register-submit-button"
                        >
                            {isSubmitting ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="register-footer">
                        <p className="register-footer-text">
                            Already have an account?{' '}
                            <Link to="/login" className="register-footer-link">
                                Sign In →
                            </Link>
                        </p>
                        <p className="register-footer-back">
                            <Link to="/">
                                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Home
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="register-trust-badge">
                    <p className="register-trust-text">
                        Trusted by 5,000+ Rescuers Worldwide
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register;
