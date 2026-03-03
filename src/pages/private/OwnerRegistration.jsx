import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ownerRegistrationSchema } from './schema/owner.schema';
import { ownerAPI } from '../../utils/api';
import './Home.css';

const OwnerRegistration = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            navigate('/');
            return;
        }
        setUser(userData);
    }, [navigate]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(ownerRegistrationSchema)
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setError('');
        
        try {
            
            const ownerData = {
                business_name: data.business_name,
                id_number: data.id_number,
                ownership_type: data.ownership_type,
                description: data.description || '',
                capacity: parseInt(data.capacity) || 0
            };
            
            await ownerAPI.register(ownerData);
            
            alert('Registration submitted successfully! Your profile is pending admin verification.');
            navigate('/dashboard/owner');
            
        } catch (err) {
            console.error('Owner registration error:', err);
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) return null;

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8f9fc',
            padding: '40px 20px'
        }}>
            <div style={{
                maxWidth: '900px',
                margin: '0 auto'
            }}>
                
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '20px',
                    padding: '40px',
                    marginBottom: '32px',
                    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.2)',
                    color: 'white'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        marginBottom: '16px'
                    }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px'
                        }}>

                        </div>
                        <div>
                            <h1 style={{
                                fontSize: '32px',
                                fontWeight: '700',
                                margin: '0 0 8px 0'
                            }}>
                                Complete Your Rescue Owner Profile
                            </h1>
                            <p style={{
                                fontSize: '16px',
                                opacity: '0.95',
                                margin: 0
                            }}>
                                Welcome, {user.name}! Fill in your organization details to get started
                            </p>
                        </div>
                    </div>
                </div>

                
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '40px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                    border: '1px solid #e5e7eb'
                }}>
                    {error && (
                        <div style={{
                            marginBottom: '24px',
                            padding: '16px',
                            background: '#fee2e2',
                            border: '1px solid #fca5a5',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'start',
                            gap: '12px'
                        }}>
                            <svg style={{ width: '20px', height: '20px', color: '#dc2626', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                            </svg>
                            <p style={{
                                fontSize: '14px',
                                color: '#991b1b',
                                fontWeight: '500',
                                margin: 0
                            }}>
                                {error}
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div style={{
                            display: 'grid',
                            gap: '24px'
                        }}>
                            {/* Business Name */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Business/Organization Name <span style={{ color: '#dc2626' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register('business_name')}
                                    placeholder="e.g., Happy Paws Rescue Center"
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        fontSize: '14px',
                                        border: errors.business_name ? '2px solid #dc2626' : '1px solid #d1d5db',
                                        borderRadius: '10px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s',
                                        fontFamily: 'inherit'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = errors.business_name ? '#dc2626' : '#d1d5db'}
                                />
                                {errors.business_name && (
                                    <p style={{
                                        marginTop: '6px',
                                        fontSize: '12px',
                                        color: '#dc2626'
                                    }}>
                                        {errors.business_name.message}
                                    </p>
                                )}
                            </div>

                            
                            <div className="owner-reg-grid" style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '20px'
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>
                                        Registration Number <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <input
                                        type="text"
                                        {...register('id_number')}
                                        placeholder="REG-123456"
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            fontSize: '14px',
                                            border: errors.id_number ? '2px solid #dc2626' : '1px solid #d1d5db',
                                            borderRadius: '10px',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                            textTransform: 'uppercase',
                                            fontFamily: 'inherit'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = errors.id_number ? '#dc2626' : '#d1d5db'}
                                    />
                                    {errors.id_number && (
                                        <p style={{
                                            marginTop: '6px',
                                            fontSize: '12px',
                                            color: '#dc2626'
                                        }}>
                                            {errors.id_number.message}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>
                                        Ownership Type <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <select
                                        {...register('ownership_type')}
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            fontSize: '14px',
                                            border: errors.ownership_type ? '2px solid #dc2626' : '1px solid #d1d5db',
                                            borderRadius: '10px',
                                            outline: 'none',
                                            background: 'white',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = errors.ownership_type ? '#dc2626' : '#d1d5db'}
                                    >
                                        <option value="">Select type</option>
                                        <option value="individual">Individual Owner</option>
                                        <option value="ngo">Non-Profit (NGO)</option>
                                        <option value="shelter">Registered Shelter</option>
                                        <option value="veterinary_clinic">Veterinary Clinic</option>
                                        <option value="rescue_center">Rescue Center</option>
                                    </select>
                                    {errors.ownership_type && (
                                        <p style={{
                                            marginTop: '6px',
                                            fontSize: '12px',
                                            color: '#dc2626'
                                        }}>
                                            {errors.ownership_type.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Shelter Capacity <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '400' }}>(Optional)</span>
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="number"
                                        {...register('capacity')}
                                        placeholder="Maximum animals you can accommodate"
                                        min="0"
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            paddingRight: '70px',
                                            fontSize: '14px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '10px',
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                            fontFamily: 'inherit'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                        onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        right: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: '12px',
                                        color: '#9ca3af',
                                        fontWeight: '500'
                                    }}>
                                        animals
                                    </span>
                                </div>
                                {errors.capacity && (
                                    <p style={{
                                        marginTop: '6px',
                                        fontSize: '12px',
                                        color: '#dc2626'
                                    }}>
                                        {errors.capacity.message}
                                    </p>
                                )}
                            </div>

                            
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    About Your Facility <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '400' }}>(Optional)</span>
                                </label>
                                <textarea
                                    {...register('description')}
                                    rows={4}
                                    placeholder="Tell us about your facility, services, experience, and mission..."
                                    style={{
                                        width: '100%',
                                        padding: '12px 16px',
                                        fontSize: '14px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '10px',
                                        outline: 'none',
                                        resize: 'vertical',
                                        transition: 'border-color 0.2s',
                                        fontFamily: 'inherit',
                                        lineHeight: '1.5'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                                />
                            </div>

                            {/* Information Box */}
                            <div style={{
                                padding: '16px',
                                background: '#eff6ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '12px',
                                display: 'flex',
                                gap: '12px'
                            }}>
                                <svg style={{ width: '20px', height: '20px', color: '#3b82f6', flexShrink: 0, marginTop: '2px' }} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                                </svg>
                                <div style={{ flex: 1 }}>
                                    <p style={{
                                        fontSize: '13px',
                                        color: '#1e40af',
                                        fontWeight: '500',
                                        margin: '0 0 4px 0'
                                    }}>
                                        Verification Required
                                    </p>
                                    <p style={{
                                        fontSize: '13px',
                                        color: '#1e40af',
                                        lineHeight: '1.5',
                                        margin: 0
                                    }}>
                                        Your profile will be reviewed by our admin team. You'll receive full access to rescue management features once verified.
                                    </p>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                paddingTop: '8px'
                            }}>
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard')}
                                    style={{
                                        flex: '1',
                                        padding: '14px 24px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        background: 'white',
                                        border: '2px solid #d1d5db',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontFamily: 'inherit'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.background = '#f9fafb';
                                        e.target.style.borderColor = '#9ca3af';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'white';
                                        e.target.style.borderColor = '#d1d5db';
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        flex: '2',
                                        padding: '14px 24px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: 'white',
                                        background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                        borderRadius: '10px',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        fontFamily: 'inherit',
                                        boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSubmitting) {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = isSubmitting ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)';
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
                                                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting Registration...
                                        </>
                                    ) : (
                                        <>
                                            Complete Registration
                                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Help */}
                <div style={{
                    marginTop: '24px',
                    textAlign: 'center'
                }}>
                    <p style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        margin: 0
                    }}>
                        Need help? <a href="#" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>Contact Support</a>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @media (max-width: 768px) {
                    .owner-reg-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default OwnerRegistration;
