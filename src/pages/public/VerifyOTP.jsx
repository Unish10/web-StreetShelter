import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { passwordResetAPI } from '../../utils/api';
import './ForgotPassword.css';

const VerifyOTP = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); 
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef([]);
    
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
            return;
        }

        
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [email, navigate]);

    useEffect(() => {
        
        if (resendCooldown > 0) {
            const timer = setTimeout(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index, value) => {
        if (value.length > 1) {
            value = value.slice(0, 1);
        }

        if (!/^\d*$/.test(value)) {
            return;
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) {
            return;
        }

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length && i < 6; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        
        const nextIndex = Math.min(pastedData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const otpValue = otp.join('');
        if (otpValue.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            setIsSubmitting(false);
            return;
        }

        try {
            // Call backend API to verify OTP
            const response = await passwordResetAPI.verifyOTP(email, otpValue);

            // Store reset token for password reset
            sessionStorage.setItem('resetToken', response.resetToken);

            // Navigate to reset password page
            navigate('/reset-password', { state: { email, verified: true } });

        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to verify OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        try {
            // Call backend API to request new OTP
            await passwordResetAPI.requestOTP(email);

            // Reset UI state
            setTimeLeft(300);
            setOtp(['', '', '', '', '', '']);
            setResendCooldown(60);
            setError('');

            inputRefs.current[0]?.focus();
        } catch (err) {
            console.error('Error:', err);
            setError(err.message || 'Failed to resend OTP. Please try again.');
        }
    };

    if (!email) {
        return null;
    }

    return (
        <div className="forgot-password-page">
            <div className="forgot-password-card">
                
                <div className="forgot-password-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>

                
                <h1 className="forgot-password-title">Verify OTP</h1>
                <p className="forgot-password-subtitle">
                    Enter the 6-digit code sent to<br />
                    <strong style={{ color: '#6366f1' }}>{email}</strong>
                </p>

                
                <div style={{
                    background: timeLeft < 60 ? '#fef2f2' : '#f0fdf4',
                    border: `1px solid ${timeLeft < 60 ? '#fee2e2' : '#dcfce7'}`,
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '24px',
                    textAlign: 'center'
                }}>
                    <span style={{
                        fontSize: '14px',
                        color: timeLeft < 60 ? '#dc2626' : '#16a34a',
                        fontWeight: '600'
                    }}>
                        {timeLeft > 0 ? (
                            <>⏰ Code expires in {formatTime(timeLeft)}</>
                        ) : (
                            <>⌛ Code has expired</>
                        )}
                    </span>
                </div>

                
                {error && (
                    <div className="forgot-password-alert forgot-password-error">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="forgot-password-form">
                    {/* OTP Input */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center',
                        marginBottom: '24px'
                    }}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                disabled={isSubmitting || timeLeft === 0}
                                style={{
                                    width: '55px',
                                    height: '60px',
                                    fontSize: '24px',
                                    fontWeight: '700',
                                    textAlign: 'center',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '12px',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    background: digit ? '#f9fafb' : 'white'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#6366f1';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#e5e7eb';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        ))}
                    </div>

                    <button 
                        type="submit" 
                        className="forgot-password-submit-btn" 
                        disabled={isSubmitting || timeLeft === 0 || otp.some(d => !d)}
                    >
                        {isSubmitting ? 'Verifying...' : 'Verify Code'}
                    </button>
                </form>

                {/* Resend OTP */}
                <div style={{ 
                    textAlign: 'center', 
                    marginBottom: '1.5rem',
                    paddingBottom: '1.5rem',
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                        Didn't receive the code?
                    </p>
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || timeLeft === 0}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: resendCooldown > 0 ? '#9ca3af' : '#6366f1',
                            fontWeight: '600',
                            fontSize: '14px',
                            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                            textDecoration: 'none'
                        }}
                    >
                        {resendCooldown > 0 
                            ? `Resend Code (${resendCooldown}s)` 
                            : 'Resend Code'}
                    </button>
                </div>

                
                <div className="forgot-password-back">
                    <Link to="/forgot-password" className="forgot-password-back-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Forgot Password
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
