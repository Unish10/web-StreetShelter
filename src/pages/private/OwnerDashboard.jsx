import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ownerAPI, dogReportsAPI } from '../../utils/api';
import NotificationBell from '../../components/shared/NotificationBell';
import './AdminDashboard.css';

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [ownerProfile, setOwnerProfile] = useState(null);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [pendingReports, setPendingReports] = useState([]);
    const [inProgressReports, setInProgressReports] = useState([]);
    const [rescuedReports, setRescuedReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pendingReports: 0,
        activeRescues: 0,
        successStories: 0
    });

    useEffect(() => {
        const loadUserAndProfile = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('user'));
                if (!userData) {
                    navigate('/');
                    return;
                }
                setUser(userData);
                
                
                try {
                    const profile = await ownerAPI.getProfile();
                    setOwnerProfile(profile);
                    
                    
                    if (!profile.isVerified) {
                        
                    }
                } catch (err) {
                    
                    if (err.message.includes('not found')) {
                        navigate('/dashboard/owner-registration');
                    }
                }
            } catch (error) {
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        
        loadUserAndProfile();
    }, [navigate]);

    const calculateStats = useCallback(async () => {
        if (!user || !ownerProfile || !ownerProfile.isVerified) {
            return;
        }
        
        try {
            const reports = await dogReportsAPI.getAll();
            const pending = reports.filter(r => r.status === 'pending');
            const inProgress = reports.filter(r => r.status === 'in_progress');
            const resolved = reports.filter(r => r.status === 'resolved' || r.status === 'closed');

            setStats({
                pendingReports: pending.length,
                activeRescues: inProgress.length,
                successStories: resolved.length
            });
        } catch (error) {
            
        }
    }, [user, ownerProfile]);

    const loadAllReports = useCallback(async () => {
        if (!user || !ownerProfile || !ownerProfile.isVerified) {
            return;
        }
        
        try {
            const reports = await dogReportsAPI.getAll();
            
            
            const pending = reports.filter(r => r.status === 'pending');
            const inProgress = reports.filter(r => r.status === 'in_progress');
            const rescued = reports.filter(r => r.status === 'resolved' || r.status === 'closed');
            
            setPendingReports(pending);
            setInProgressReports(inProgress);
            setRescuedReports(rescued);
        } catch (error) {
            
        }
    }, [user, ownerProfile]);

    
    useEffect(() => {
        if (!user || !ownerProfile) return;
        
        calculateStats();
        loadAllReports();
        
        
        const handleReportSubmitted = () => {
            calculateStats();
            loadAllReports();
        };
        
        window.addEventListener('reportSubmitted', handleReportSubmitted);
        return () => {
            window.removeEventListener('reportSubmitted', handleReportSubmitted);
        };
    }, [user, ownerProfile, calculateStats, loadAllReports]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        navigate('/');
    };

    const handleViewReport = (report) => {
        setSelectedReport(report);
        setShowReportModal(true);
    };

    const handleRescue = async (reportId) => {
        if (!window.confirm('Are you sure you want to start rescuing this animal?')) {
            return;
        }

        try {
            
            const response = await fetch(`http://localhost:3000/api/dog-reports/${reportId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).token}`
                },
                body: JSON.stringify({ status: 'in_progress' })
            });

            if (!response.ok) {
                let errorMessage = 'Failed to update status';
                try {
                    const error = await response.json();
                    errorMessage = error.message || errorMessage;
                } catch (parseError) {
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            
            await loadAllReports();
            await calculateStats();

            
            setShowReportModal(false);
            alert('Rescue action initiated successfully! The rescue is now In Progress.');

        } catch (err) {
            alert(err.message || 'Failed to initiate rescue. Please try again.');
        }
    };

    const completeRescue = async (reportId) => {
        if (!window.confirm('Mark this rescue as completed?')) {
            return;
        }

        try {
            
            const response = await fetch(`http://localhost:3000/api/dog-reports/${reportId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).token}`
                },
                body: JSON.stringify({ status: 'resolved' })
            });

            if (!response.ok) {
                let errorMessage = 'Failed to update status';
                try {
                    const error = await response.json();
                    errorMessage = error.message || errorMessage;
                } catch (parseError) {
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            
            await loadAllReports();
            await calculateStats();

            
            setShowReportModal(false);
            alert('Rescue completed successfully! The animal has been rescued.');

        } catch (err) {
            alert(err.message || 'Failed to complete rescue. Please try again.');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    
    if (!ownerProfile) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f9fafb',
                padding: '20px'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '40px',
                    maxWidth: '500px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: '#1f2937' }}>
                        Complete Your Owner Profile
                    </h2>
                    <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
                        Please complete your organization profile to access the rescue dashboard.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard/owner-registration')}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            padding: '12px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginBottom: '12px'
                        }}
                    >
                        Complete Profile
                    </button>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'transparent',
                            color: '#6b7280',
                            padding: '12px 24px',
                            borderRadius: '10px',
                            border: '1px solid #d1d5db',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginLeft: '12px'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        );
    }

    // Check if owner profile is not verified yet
    if (!ownerProfile.isVerified) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f9fafb',
                padding: '20px'
            }}>
                <div style={{
                    maxWidth: '500px',
                    width: '100%',
                    background: 'white',
                    borderRadius: '16px',
                    padding: '40px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            fontSize: '40px'
                        }}>
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                            Complete Your Organization Profile
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '24px', lineHeight: '1.6' }}>
                            Before you can start rescuing animals, please complete your organization details. 
                            This information will be verified by our admin team.
                        </p>
                        <button 
                            onClick={() => navigate('/dashboard/owner-registration')}
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                marginBottom: '12px'
                            }}
                        >
                            Complete Profile →
                        </button>
                        <button 
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                background: 'white',
                                color: '#6b7280',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Logout
                        </button>
                </div>
            </div>
        );
    }

    const isVerified = ownerProfile && ownerProfile.isVerified === true;
    
    const isPending = ownerProfile && !ownerProfile.isVerified;
    
    // Allow pending owners to access dashboard (removed strict verification requirement)
    // Verification status will be shown in the UI instead of blocking access
    /*
    if (ownerProfile && !isVerified) {
        console.log('OwnerDashboard: Showing verification pending screen');
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f9fafb',
                padding: '20px'
            }}>
                <div style={{
                    maxWidth: '500px',
                    width: '100%',
                    background: 'white',
                    borderRadius: '16px',
                    padding: '40px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 20px',
                            fontSize: '40px'
                        }}>
                            ⏳
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                            Verification Pending
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '24px', lineHeight: '1.6' }}>
                            Your organization profile is currently under review by our admin team. 
                            You'll be able to view and rescue reported dogs once your profile is verified.
                        </p>
                        <div style={{
                            background: '#fef3c7',
                            border: '1px solid #fbbf24',
                            borderRadius: '12px',
                            padding: '16px',
                            marginBottom: '24px',
                            textAlign: 'left'
                        }}>
                            <p style={{ fontSize: '14px', color: '#92400e', fontWeight: '600', marginBottom: '8px' }}>
                                Profile Details:
                            </p>
                            <p style={{ fontSize: '13px', color: '#92400e', marginBottom: '4px' }}>
                                <strong>Organization:</strong> {ownerProfile.business_name}
                            </p>
                            <p style={{ fontSize: '13px', color: '#92400e', marginBottom: '4px' }}>
                                <strong>Type:</strong> {ownerProfile.ownership_type}
                            </p>
                            <p style={{ fontSize: '13px', color: '#92400e' }}>
                                <strong>Status:</strong> Pending Verification
                            </p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            style={{
                                width: '100%',
                                padding: '14px 24px',
                                background: 'white',
                                color: '#6b7280',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </div>
        );
    }
    */

    return (
        <div className="admin-dashboard-container">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <img src="/logo.svg" alt="StreetShelter" className="admin-sidebar-logo-image" style={{width: '80px', height: 'auto', display: 'block', margin: '0 auto'}} />
                </div>

                <nav className="admin-sidebar-menu">
                    <div className="admin-menu-section">
                        <div className="admin-menu-label">Menu</div>
                        <button 
                            onClick={() => setActiveSection('dashboard')} 
                            className={`admin-menu-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                        >
                            <svg className="admin-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="admin-menu-text">Dashboard</span>
                        </button>
                        <button 
                            onClick={() => setActiveSection('reports')} 
                            className={`admin-menu-item ${activeSection === 'reports' ? 'active' : ''}`}
                        >
                            <svg className="admin-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="admin-menu-text">All Reports</span>
                        </button>
                        <button 
                            onClick={() => setActiveSection('rescues')} 
                            className={`admin-menu-item ${activeSection === 'rescues' ? 'active' : ''}`}
                        >
                            <svg className="admin-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="admin-menu-text">Active Rescues</span>
                            {stats.activeRescues > 0 && (
                                <span className="admin-menu-badge">{stats.activeRescues}</span>
                            )}
                        </button>
                        <button 
                            onClick={() => setActiveSection('profile')} 
                            className={`admin-menu-item ${activeSection === 'profile' ? 'active' : ''}`}
                        >
                            <svg className="admin-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="admin-menu-text">My Profile</span>
                        </button>
                    </div>
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user-info">
                        <div className="admin-user-label">Logged in as</div>
                        <div className="admin-user-email">{user.email}</div>
                    </div>
                    <button className="admin-logout-btn" onClick={handleLogout}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </aside>

            
            <main className="admin-main-content">
                
                <header className="admin-header">
                    <div className="admin-search-wrapper">
                        <input 
                            type="text" 
                            className="admin-search-input" 
                            placeholder="Search reports..." 
                        />
                    </div>

                    <div className="admin-header-actions">
                        <NotificationBell />

                        <div className="admin-profile-section">
                            <div className="admin-profile-info">
                                <div className="admin-profile-name">{user.name}</div>
                                <div className="admin-profile-role">Rescue Owner</div>
                            </div>
                            <img 
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=10b981&color=fff`}
                                alt={user.name} 
                                className="admin-profile-avatar" 
                            />
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="admin-dashboard-content">
                    {/* Dashboard Section */}
                    {activeSection === 'dashboard' && (
                        <>
                            <div className="admin-welcome-section">
                                <h1 className="admin-welcome-title">Rescue Owner Dashboard</h1>
                                <p className="admin-welcome-subtitle">
                                    Welcome back! {isVerified ? 'Monitor rescue operations and help save animals.' : 'Complete your profile to start rescue operations.'}
                                </p>
                            </div>

                            {!isVerified && (
                                <div style={{
                                    background: '#fef3c7',
                                    border: '2px solid #fbbf24',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    marginBottom: '24px'
                                }}>
                                    <h3 style={{ color: '#92400e', marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>⚠️ Profile Verification Pending</h3>
                                    <p style={{ color: '#78350f', marginBottom: '12px', fontSize: '14px' }}>
                                        Your profile is awaiting admin verification. You'll be able to access all features once verified.
                                    </p>
                                    <button
                                        onClick={() => setActiveSection('profile')}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#f59e0b',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '14px'
                                        }}
                                    >
                                        View Profile
                                    </button>
                                </div>
                            )}

                            {!ownerProfile && (
                                <div style={{
                                    background: '#fef3c7',
                                    border: '2px solid #fbbf24',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    marginBottom: '24px'
                                }}>
                                    <h3 style={{ color: '#92400e', marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>Complete Your Owner Profile</h3>
                                    <p style={{ color: '#78350f', marginBottom: '12px', fontSize: '14px' }}>
                                        You need to complete your rescue owner registration to access all features.
                                    </p>
                                    <button
                                        onClick={() => navigate('/dashboard/owner-registration')}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#f59e0b',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            fontSize: '14px'
                                        }}
                                    >
                                        Complete Registration →
                                    </button>
                                </div>
                            )}

                            {isVerified && (
                                <>
                                    <div className="admin-stats-grid">
                                        <div className="admin-stat-card">
                                            <div className="admin-stat-header">
                                                <div className="admin-stat-icon blue"></div>
                                                <div className="admin-stat-trend up">New</div>
                                            </div>
                                            <div className="admin-stat-label">Pending Reports</div>
                                            <div className="admin-stat-number">{stats.pendingReports}</div>
                                        </div>

                                        <div className="admin-stat-card">
                                            <div className="admin-stat-header">
                                                <div className="admin-stat-icon purple"></div>
                                                <div className="admin-stat-trend up">Active</div>
                                            </div>
                                            <div className="admin-stat-label">Active Rescues</div>
                                            <div className="admin-stat-number">{stats.activeRescues}</div>
                                        </div>

                                        <div className="admin-stat-card">
                                            <div className="admin-stat-header">
                                                <div className="admin-stat-icon green"></div>
                                                <div className="admin-stat-trend up">Success</div>
                                            </div>
                                            <div className="admin-stat-label">Successful Rescues</div>
                                            <div className="admin-stat-number">{stats.successStories}</div>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '32px' }}>
                                        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
                                            Recent Reports
                                        </h2>
                                        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                            {pendingReports.length === 0 ? (
                                                <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                                                    No pending reports at the moment.
                                                </p>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                    {pendingReports.slice(0, 5).map(report => (
                                                        <div key={report.id} style={{
                                                            padding: '16px',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '8px',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}>
                                                            <div>
                                                                <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                                                                    {report.location}
                                                                </div>
                                                                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                                                    Status: Pending • {new Date(report.createdAt).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedReport(report);
                                                                    setShowReportModal(true);
                                                                }}
                                                                style={{
                                                                    padding: '8px 16px',
                                                                    background: '#5b5bd6',
                                                                    color: 'white',
                                                                    border: 'none',
                                                                    borderRadius: '8px',
                                                                    cursor: 'pointer',
                                                                    fontWeight: '600',
                                                                    fontSize: '14px'
                                                                }}
                                                            >
                                                                View Details
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {/* All Reports Section */}
                    {activeSection === 'reports' && isVerified && (
                        <>
                            <div className="admin-welcome-section">
                                <h1 className="admin-welcome-title">All Reports</h1>
                                <p className="admin-welcome-subtitle">View and manage all dog reports in your area.</p>
                            </div>

                            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                {[...pendingReports, ...inProgressReports, ...rescuedReports].length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                                        No reports available.
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {[...pendingReports, ...inProgressReports, ...rescuedReports].map(report => (
                                            <div key={report.id} style={{
                                                padding: '16px',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>                                                        {report.location}
                                                    </div>
                                                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                                                        {report.description?.substring(0, 100)}{report.description?.length > 100 ? '...' : ''}
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                                                        Status: {report.status} • {new Date(report.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                                    {report.status === 'pending' && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await dogReportsAPI.update(report.id, { status: 'in_progress' });
                                                                    await loadAllReports();
                                                                    await calculateStats();
                                                                } catch (error) {
                                                                    alert(error.message || 'Failed to start rescue');
                                                                }
                                                            }}
                                                            style={{
                                                                padding: '8px 16px',
                                                                background: '#10b981',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                fontWeight: '600',
                                                                fontSize: '14px'
                                                            }}
                                                        >
                                                            Start Rescue
                                                        </button>
                                                    )}
                                                    {report.status === 'in_progress' && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await dogReportsAPI.update(report.id, { status: 'resolved' });
                                                                    await loadAllReports();
                                                                    await calculateStats();
                                                                } catch (error) {
                                                                    alert(error.message || 'Failed to complete rescue');
                                                                }
                                                            }}
                                                            style={{
                                                                padding: '8px 16px',
                                                                background: '#5b5bd6',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                fontWeight: '600',
                                                                fontSize: '14px'
                                                            }}
                                                        >
                                                            Complete Rescue
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            setSelectedReport(report);
                                                            setShowReportModal(true);
                                                        }}
                                                        style={{
                                                            padding: '8px 16px',
                                                            background: '#6b7280',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            cursor: 'pointer',
                                                            fontWeight: '600',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Active Rescues Section */}
                    {activeSection === 'rescues' && isVerified && (
                        <>
                            <div className="admin-welcome-section">
                                <h1 className="admin-welcome-title">Active Rescues</h1>
                                <p className="admin-welcome-subtitle">Track and manage ongoing rescue operations.</p>
                            </div>

                            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                {inProgressReports.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                                        No active rescues at the moment.
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {inProgressReports.map(report => (
                                            <div key={report.id} style={{
                                                padding: '20px',
                                                border: '2px solid #10b981',
                                                borderRadius: '12px',
                                                background: '#f0fdf4'
                                            }}>
                                                <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '18px', marginBottom: '8px' }}>                                                    {report.location}
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                                                    {report.description}
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
                                                    Started: {new Date(report.updatedAt).toLocaleString()}
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await dogReportsAPI.update(report.id, { status: 'resolved' });
                                                            await loadAllReports();
                                                            await calculateStats();
                                                        } catch (error) {
                                                            alert(error.message || 'Failed to complete rescue');
                                                        }
                                                    }}
                                                    style={{
                                                        padding: '10px 20px',
                                                        background: '#10b981',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontWeight: '600',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    Mark as Rescued
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Profile Section */}
                    {activeSection === 'profile' && (
                        <>
                            <div className="admin-welcome-section">
                                <h1 className="admin-welcome-title">My Profile</h1>
                                <p className="admin-welcome-subtitle">View and manage your rescue organization profile.</p>
                            </div>

                            {ownerProfile ? (
                                <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                    <div style={{ marginBottom: '24px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
                                            Organization Details
                                        </h3>
                                        <div style={{ display: 'grid', gap: '16px' }}>
                                            <div>
                                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Business Name</div>
                                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                                                    {ownerProfile.business_name}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>License Number</div>
                                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                                                    {ownerProfile.license_number}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>ID Number</div>
                                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                                                    {ownerProfile.id_number}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Address</div>
                                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                                                    {ownerProfile.address}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Phone</div>
                                                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                                                    {ownerProfile.phone}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>Verification Status</div>
                                                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                                                    {ownerProfile.isVerified ? (
                                                        <span style={{ color: '#10b981' }}>Verified</span>
                                                    ) : (
                                                        <span style={{ color: '#f59e0b' }}>Pending Verification</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ background: 'white', borderRadius: '12px', padding: '40px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                    <p style={{ color: '#6b7280', marginBottom: '16px' }}>No profile found.</p>
                                    <button
                                        onClick={() => navigate('/dashboard/owner-registration')}
                                        style={{
                                            padding: '10px 20px',
                                            background: '#5b5bd6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Complete Registration
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Report Details Modal */}
            {showReportModal && selectedReport && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }} onClick={() => setShowReportModal(false)}>
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        maxWidth: '600px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflow: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        <h2 style={{ marginBottom: '16px', color: '#1f2937' }}>Report Details</h2>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <strong>Location:</strong> {selectedReport.location}
                        </div>
                        
                        {selectedReport.latitude && selectedReport.longitude && (
                            <div style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
                                Coordinates: {parseFloat(selectedReport.latitude).toFixed(6)}, {parseFloat(selectedReport.longitude).toFixed(6)}
                            </div>
                        )}
                        
                        <div style={{ marginBottom: '16px' }}>
                            <strong>Description:</strong> {selectedReport.description}
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <strong>Status:</strong> {selectedReport.status}
                        </div>
                        
                        <div style={{ marginBottom: '16px' }}>
                            <strong>Reported:</strong> {new Date(selectedReport.createdAt).toLocaleString()}
                        </div>

                        {selectedReport.imageUrl && (() => {
                            try {
                                const images = JSON.parse(selectedReport.imageUrl);
                                return (
                                    <div style={{ marginBottom: '16px' }}>
                                        <strong>Images ({images.length}):</strong><br/>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '8px' }}>
                                            {images.map((imgUrl, idx) => (
                                                <img 
                                                    key={idx}
                                                    src={`http://localhost:3000${imgUrl}`}
                                                    alt={`Report ${idx + 1}`}
                                                    style={{ width: '100%', height: '200px', objectFit: 'contain', borderRadius: '8px', background: '#f3f4f6' }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            } catch (e) {
                                
                                return (
                                    <div style={{ marginBottom: '16px' }}>
                                        <strong>Image:</strong><br/>
                                        <img 
                                            src={`http://localhost:3000${selectedReport.imageUrl}`}
                                            alt="Report"
                                            style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '8px', background: '#f3f4f6' }}
                                        />
                                    </div>
                                );
                            }
                        })()}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                            {selectedReport.status === 'pending' && (
                                <button
                                    onClick={() => handleRescue(selectedReport.id)}
                                    style={{
                                        flex: 1,
                                        padding: '10px 20px',
                                        background: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    Start Rescue
                                </button>
                            )}
                            {selectedReport.status === 'in_progress' && (
                                <button
                                    onClick={() => completeRescue(selectedReport.id)}
                                    style={{
                                        flex: 1,
                                        padding: '10px 20px',
                                        background: '#5b5bd6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600'
                                    }}
                                >
                                    Complete Rescue
                                </button>
                            )}
                            <button
                                onClick={() => setShowReportModal(false)}
                                style={{
                                    flex: 1,
                                    padding: '10px 20px',
                                    background: '#6b7280',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600'
                                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerDashboard;
