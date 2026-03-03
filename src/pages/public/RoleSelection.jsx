import { Link, useNavigate } from 'react-router-dom';
import './RoleSelection.css';

const RoleSelection = () => {
    const navigate = useNavigate();

    const handleRoleSelect = (role) => {
        navigate('/login', { state: { role } });
    };

    return (
        <div className="role-selection-container">
            <div className="role-selection-card">
                <div className="role-selection-header">
                    <img src="/logo.svg" alt="StreetShelter" className="role-selection-logo-image" style={{width: '140px', height: 'auto', marginBottom: '1rem', display: 'block', margin: '0 auto 1rem'}} />
                    <h2 className="role-selection-title">How would you like to continue?</h2>
                    <p className="role-selection-subtitle">Select the role that best describes your intent today.</p>
                </div>

                <div className="role-options">
                    <div className="role-option-card" onClick={() => handleRoleSelect('reporter')}>
                        <div className="role-option-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                        </div>
                        <h3 className="role-option-title">I am a Reporter</h3>
                        <p className="role-option-description">
                            I want to report an animal in need and help them find safety.
                        </p>
                        <button className="role-option-button">
                            Continue as Reporter
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    <div className="role-option-card" onClick={() => handleRoleSelect('owner')}>
                        <div className="role-option-icon">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        <h3 className="role-option-title">I am a Rescue Owner</h3>
                        <p className="role-option-description">
                            I represent a shelter and want to rescue and care for animals.
                        </p>
                        <button className="role-option-button">
                            Continue as Rescue Owner
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="role-selection-footer">
                    <Link to="/" className="role-selection-back-link">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Home
                    </Link>
                    <p className="role-selection-support">
                        Need help? Contact our support team at{' '}
                        <a href="mailto:support@streetshelter.com">support@streetshelter.com</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RoleSelection;
