import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { passwordResetAPI } from '../../utils/api';
import './ForgotPassword.css';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        if (!email) {
            setError('Please enter your email address');
            setIsSubmitting(false);
            return;
        }

        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            setIsSubmitting(false);
            return;
        }

        try {
            // Call backend API to request OTP
            const response = await passwordResetAPI.requestOTP(email);

            // Show success message
            setSuccess(response.message || 'Verification code has been sent to your email');
            
            // Navigate to OTP verification page
            setTimeout(() => {
                navigate('/verify-otp', { state: { email } });
            }, 1500);

        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to send reset link. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-card">
                
                <div className="forgot-password-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </div>

                
                <h1 className="forgot-password-title">Forgot Password?</h1>
                <p className="forgot-password-subtitle">
                    Enter your email address and we'll send you a link to reset your password.
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
                        <label htmlFor="email" className="forgot-password-label">Email Address</label>
                        <div className="forgot-password-input-wrapper">
                            <svg className="forgot-password-input-icon" viewBox="0 0 24 24" fill="none">
                                <path d="M3 8L12 13L21 8M21 8V16C21 16.5304 20.7893 17.0391 20.4142 17.4142C20.0391 17.7893 19.5304 18 19 18H5C4.46957 18 3.96086 17.7893 3.58579 17.4142C3.21071 17.0391 3 16.5304 3 16V8M21 8L12 3L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. name@company.com"
                                className="forgot-password-input"
                                disabled={isSubmitting}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="forgot-password-submit-btn" 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                        {!isSubmitting && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        )}
                    </button>
                </form>

                {/* Back to Login */}
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

export default ForgotPassword;
