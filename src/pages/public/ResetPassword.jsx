import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { passwordResetAPI } from '../../utils/api';
import './ForgotPassword.css';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: '', color: '' });
    
    const email = location.state?.email;
    const verified = location.state?.verified;

    useEffect(() => {
        // Verify user has completed OTP verification
        if (!email || !verified) {
            navigate('/forgot-password');
            return;
        }

        // Check if reset token exists
        const resetToken = sessionStorage.getItem('resetToken');
        if (!resetToken) {
            navigate('/forgot-password');
            return;
        }
    }, [email, verified, navigate]);

    useEffect(() => {
        
        if (!formData.newPassword) {
            setPasswordStrength({ score: 0, text: '', color: '' });
            return;
        }

        let score = 0;
        const password = formData.newPassword;

        
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;

        
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

        const strengths = [
            { score: 0, text: '', color: '' },
            { score: 1, text: 'Very Weak', color: '#ef4444' },
            { score: 2, text: 'Weak', color: '#f59e0b' },
            { score: 3, text: 'Fair', color: '#eab308' },
            { score: 4, text: 'Good', color: '#84cc16' },
            { score: 5, text: 'Strong', color: '#22c55e' }
        ];

        setPasswordStrength(strengths[score]);
    }, [formData.newPassword]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const validatePassword = (password) => {
        if (password.length < 6) {
            return 'Password must be at least 6 characters long';
        }
        if (!/[a-zA-Z]/.test(password)) {
            return 'Password must contain at least one letter';
        }
        if (!/\d/.test(password)) {
            return 'Password must contain at least one number';
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        const { newPassword, confirmPassword } = formData;

        
        if (!newPassword || !confirmPassword) {
            setError('Please fill in all fields');
            setIsSubmitting(false);
            return;
        }

        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            setIsSubmitting(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setIsSubmitting(false);
            return;
        }

        try {
            // Get reset token from sessionStorage
            const resetToken = sessionStorage.getItem('resetToken');
            if (!resetToken) {
                setError('Invalid session. Please start the password reset process again.');
                setIsSubmitting(false);
                return;
            }

            // Call backend API to reset password
            const response = await passwordResetAPI.resetPassword(email, resetToken, newPassword);

            // Clear reset token
            sessionStorage.removeItem('resetToken');

            // Show success message
            setSuccess(response.message || 'Password reset successfully!');

            // Navigate to login after delay
            setTimeout(() => {
                navigate('/login', { 
                    state: { 
                        message: 'Password reset successfully. Please login with your new password.' 
                    } 
                });
            }, 2000);

        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!email || !verified) {
        return null;
    }

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-card" style={{ maxWidth: '520px' }}>
                
                <div className="forgot-password-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                
                <h1 className="forgot-password-title">Reset Password</h1>
                <p className="forgot-password-subtitle">
                    Create a new secure password for<br />
                    <strong style={{ color: '#6366f1' }}>{email}</strong>
                </p>

                
                {error && (
                    <div className="forgot-password-alert forgot-password-error">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="forgot-password-alert forgot-password-success">
                        {success}
                    </div>
                )}

                
                <form onSubmit={handleSubmit} className="forgot-password-form">
                    
                    <div className="forgot-password-input-group">
                        <label htmlFor="newPassword" className="forgot-password-label">New Password</label>
                        <div className="forgot-password-input-wrapper">
                            <svg className="forgot-password-input-icon" viewBox="0 0 24 24" fill="none">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor"/>
                            </svg>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                className="forgot-password-input"
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#9ca3af',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '1.25rem',
                                    zIndex: 10,
                                    opacity: 1,
                                    visibility: 'visible',
                                    pointerEvents: 'auto'
                                }}
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

                        
                        {formData.newPassword && (
                            <div style={{ marginTop: '8px' }}>
                                <div style={{
                                    height: '4px',
                                    background: '#e5e7eb',
                                    borderRadius: '2px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${(passwordStrength.score / 5) * 100}%`,
                                        background: passwordStrength.color,
                                        transition: 'all 0.3s'
                                    }} />
                                </div>
                                {passwordStrength.text && (
                                    <p style={{
                                        fontSize: '12px',
                                        color: passwordStrength.color,
                                        marginTop: '4px',
                                        fontWeight: '500',
                                        textAlign: 'left'
                                    }}>
                                        Password strength: {passwordStrength.text}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    
                    <div className="forgot-password-input-group">
                        <label htmlFor="confirmPassword" className="forgot-password-label">Confirm Password</label>
                        <div className="forgot-password-input-wrapper">
                            <svg className="forgot-password-input-icon" viewBox="0 0 24 24" fill="none">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor"/>
                            </svg>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                className="forgot-password-input"
                                disabled={isSubmitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#9ca3af',
                                    cursor: 'pointer',
                                    padding: '0.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    fontSize: '1.25rem',
                                    zIndex: 10,
                                    opacity: 1,
                                    visibility: 'visible',
                                    pointerEvents: 'auto'
                                }}
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
                    </div>

                    {/* Password Requirements */}
                    <div style={{
                        background: '#f3f4f6',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        textAlign: 'left'
                    }}>
                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>
                            Password must contain:
                        </p>
                        <ul style={{ fontSize: '12px', color: '#6b7280', paddingLeft: '20px', margin: 0 }}>
                            <li>At least 6 characters</li>
                            <li>At least one letter</li>
                            <li>At least one number</li>
                        </ul>
                    </div>

                    <button type="submit" className="forgot-password-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                    </button>
                </form>

                {/* Back Link */}
                <div className="forgot-password-back">
                    <Link to="/login" className="forgot-password-back-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
