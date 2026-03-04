import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authAPI } from '../../utils/api';
import './AdminLogin.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setError('');
        
        try {
            
            const response = await authAPI.login({
                email: data.email,
                password: data.password
            });

            
            if (response.role !== 'admin') {
                setError('Access denied. Admin credentials required.');
                setIsSubmitting(false);
                return;
            }
            
            
            const adminData = {
                id: response._id,
                username: response.username,
                name: response.name || response.username,
                email: response.email,
                role: response.role,
                token: response.token
            };

            localStorage.setItem('user', JSON.stringify(adminData));
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('adminAuthenticated', 'true');
            
            navigate('/dashboard/admin');
            
        } catch (err) {
            console.error('Admin login error:', err);
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="admin-login-container">

            <div className="admin-login-card">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <img src="/logo.svg" alt="StreetShelter" style={{width: '100px', height: 'auto', display: 'block', margin: '0 auto'}} />
                </div>
                
                {/* Admin Panel Title */}
                <div className="admin-panel-title">
                    <h1 className="admin-panel-heading">
                        Admin <span className="admin-panel-heading-highlight">Panel</span>
                    </h1>
                    <p className="admin-panel-subtitle">
                        MANAGEMENT DASHBOARD
                    </p>
                </div>

                {/* Admin Access Header */}
                <div className="admin-access-header">
                    <h2 className="admin-access-title">Admin Access</h2>
                    <p className="admin-access-description">Secure administrator login</p>
                </div>


                {error && (
                    <div className="admin-error-message">
                        <p className="admin-error-text">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="admin-form">
                    
                    <div className="admin-form-group">
                        <label className="admin-form-label">
                            Email Address
                        </label>
                        <input 
                            type="email" 
                            {...register('email', { required: 'Email is required' })}
                            placeholder=""
                            className="admin-form-input"
                        />
                        {errors.email && (
                            <p className="admin-error-text" style={{marginTop: '0.5rem', fontSize: '0.75rem'}}>{errors.email.message}</p>
                        )}
                    </div>

                    
                    <div className="admin-form-group">
                        <label className="admin-form-label">
                            Password
                        </label>
                        <div className="admin-password-wrapper">
                            <input 
                                type={showPassword ? 'text' : 'password'}
                                {...register('password', { required: 'Password is required' })}
                                placeholder=""
                                className="admin-form-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="admin-password-toggle"
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
                            <p className="admin-error-text" style={{marginTop: '0.5rem', fontSize: '0.75rem'}}>{errors.password.message}</p>
                        )}
                    </div>

                    
                    <div style={{ textAlign: 'right', marginTop: '0.5rem', marginBottom: '1rem' }}>
                        <Link to="/forgot-password" style={{
                            fontSize: '0.875rem',
                            color: '#8b5cf6',
                            textDecoration: 'none',
                            fontWeight: '600'
                        }}>
                            Forgot Password?
                        </Link>
                    </div>

                    
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="admin-submit-button"
                    >
                        {isSubmitting ? (
                            <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                                <svg className="admin-submit-spinner" style={{width: '1.25rem', height: '1.25rem'}} fill="none" viewBox="0 0 24 24">
                                    <circle style={{opacity: 0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path style={{opacity: 0.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </span>
                        ) : (
                            <>
                                Login as Admin
                            </>
                        )}
                    </button>
                </form>

                
                <div className="admin-footer-link">
                    <Link to="/login" className="admin-user-login-link">
                        Go to User Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;