import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ownerAPI, dogReportsAPI } from '../../utils/api';
import './Home.css';

const DogReports = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('all'); 
    const [user, setUser] = useState(null);
    const [ownerProfile, setOwnerProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserAndProfile = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem('user'));
                if (!userData) {
                    navigate('/');
                    return;
                }
                setUser(userData);
                
                
                if (userData.role === 'owner') {
                    try {
                        const profile = await ownerAPI.getProfile();
                        setOwnerProfile(profile);
                    } catch (err) {
                        console.error('Error loading owner profile:', err);
                        
                        setOwnerProfile(null);
                    }
                }
                
                await loadReports();
                setLoading(false);
            } catch (error) {
                console.error('Error loading user:', error);
                setLoading(false);
            }
        };
        
        loadUserAndProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        navigate('/');
    };

    const loadReports = async () => {
        try {
            const allReports = await dogReportsAPI.getAll();
            setReports(allReports);
        } catch (err) {
            console.error('Error loading reports:', err);
            setReports([]);
        }
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
                const error = await response.json();
                throw new Error(error.message || 'Failed to update status');
            }

            alert('Rescue action initiated successfully! The rescue is now In Progress.');
            await loadReports();

        } catch (err) {
            console.error('Rescue error:', err);
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
                const error = await response.json();
                throw new Error(error.message || 'Failed to update status');
            }

            alert('Rescue completed successfully! The animal has been rescued.');
            await loadReports();

        } catch (err) {
            console.error('Complete rescue error:', err);
            alert(err.message || 'Failed to complete rescue. Please try again.');
        }
    };

    const filteredReports = reports.filter(report => {
        if (filter === 'all') return true;
        if (filter === 'pending') return report.status === 'pending';
        if (filter === 'rescued') return report.status === 'resolved';
        if (filter === 'in-progress') return report.status === 'in_progress';
        return true;
    });

    const getStatusClass = (status) => {
        switch (status) {
            case 'pending': return 'status-pending';
            case 'in_progress': return 'status-in-progress';
            case 'resolved': return 'status-rescued';
            default: return '';
        }
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'in_progress': return 'In Progress';
            case 'resolved': return 'Rescued';
            default: return status;
        }
    };

    
    if (loading) {
        return (
            <div className="dashboard-container">
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f9fafb',
                    padding: '20px'
                }}>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // Check if owner profile needs to be completed
    if (user?.role === 'owner' && !ownerProfile) {
        return (
            <div className="dashboard-container">
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
                            Complete Your Profile
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '24px', lineHeight: '1.6' }}>
                            Please complete your organization profile to access dog reports.
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
                                cursor: 'pointer'
                            }}
                        >
                            Complete Profile
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    // Check if owner profile is not verified
    if (user?.role === 'owner' && ownerProfile && !ownerProfile.isVerified) {
        return (
            <div className="dashboard-container">
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
                                Your organization profile is under review. You'll be able to view reports once verified by admin.
                            </p>
                            <button 
                                onClick={() => navigate('/dashboard')}
                                style={{
                                    width: '100%',
                                    padding: '14px 24px',
                                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
    }

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className="dashboard-sidebar">
                <div className="sidebar-logo">
                    <img src="/logo.svg" alt="StreetShelter" className="sidebar-logo-image" style={{width: '80px', height: 'auto', display: 'block', margin: '0 auto 10px'}} />
                    <span className="sidebar-pro-badge" style={{display: 'block', textAlign: 'center'}}>PRO</span>
                </div>

                <nav className="sidebar-nav">
                    <button 
                        className="sidebar-nav-item"
                        onClick={() => navigate('/dashboard')}
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                        </svg>
                        Dashboard
                    </button>
                    <button 
                        className="sidebar-nav-item active"
                        onClick={() => navigate('/dashboard/dog-reports')}
                    >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Dog Reports
                    </button>
                </nav>

                <div className="sidebar-user">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-avatar">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="sidebar-user-details">
                                <p className="sidebar-user-name">{user?.name}</p>
                                <p className="sidebar-user-role">Rescue Owner</p>
                            </div>
                        </div>
                        <button className="sidebar-settings-btn" onClick={handleLogout}>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-main">
                {/* Header */}
                <div style={{ 
                    padding: '32px 40px',
                    background: 'white',
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <button 
                        onClick={() => navigate('/dashboard')} 
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#6366f1',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0'
                        }}
                    >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px'
                        }}>
                        </div>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
                                Dog Reports
                            </h1>
                            <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 0 0' }}>
                                View and rescue reported street dogs in your area.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div style={{ 
                    padding: '0 40px',
                    background: 'white',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    gap: '24px'
                }}>
                    <button 
                        onClick={() => setFilter('all')}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '16px 0',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: filter === 'all' ? '#6366f1' : '#6b7280',
                            cursor: 'pointer',
                            borderBottom: filter === 'all' ? '2px solid #6366f1' : '2px solid transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        All <span style={{ 
                            display: 'inline-block',
                            marginLeft: '6px',
                            padding: '2px 8px',
                            background: filter === 'all' ? '#eef2ff' : '#f3f4f6',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: filter === 'all' ? '#6366f1' : '#6b7280'
                        }}>{reports.length}</span>
                    </button>
                    <button 
                        onClick={() => setFilter('pending')}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '16px 0',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: filter === 'pending' ? '#6366f1' : '#6b7280',
                            cursor: 'pointer',
                            borderBottom: filter === 'pending' ? '2px solid #6366f1' : '2px solid transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        Pending <span style={{ 
                            display: 'inline-block',
                            marginLeft: '6px',
                            padding: '2px 8px',
                            background: filter === 'pending' ? '#eef2ff' : '#f3f4f6',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: filter === 'pending' ? '#6366f1' : '#6b7280'
                        }}>{reports.filter(r => r.status === 'pending').length}</span>
                    </button>
                    <button 
                        onClick={() => setFilter('in-progress')}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '16px 0',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: filter === 'in-progress' ? '#6366f1' : '#6b7280',
                            cursor: 'pointer',
                            borderBottom: filter === 'in-progress' ? '2px solid #6366f1' : '2px solid transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        In Progress <span style={{ 
                            display: 'inline-block',
                            marginLeft: '6px',
                            padding: '2px 8px',
                            background: filter === 'in-progress' ? '#eef2ff' : '#f3f4f6',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: filter === 'in-progress' ? '#6366f1' : '#6b7280'
                        }}>{reports.filter(r => r.status === 'in_progress').length}</span>
                    </button>
                    <button 
                        onClick={() => setFilter('rescued')}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '16px 0',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: filter === 'rescued' ? '#6366f1' : '#6b7280',
                            cursor: 'pointer',
                            borderBottom: filter === 'rescued' ? '2px solid #6366f1' : '2px solid transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        Rescued <span style={{ 
                            display: 'inline-block',
                            marginLeft: '6px',
                            padding: '2px 8px',
                            background: filter === 'rescued' ? '#eef2ff' : '#f3f4f6',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: filter === 'rescued' ? '#6366f1' : '#6b7280'
                        }}>{reports.filter(r => r.status === 'resolved').length}</span>
                    </button>
                </div>

                {/* Reports Content */}
                <div style={{ padding: '32px 40px', background: '#f9fafb', minHeight: 'calc(100vh - 280px)' }}>
                    {filteredReports.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '80px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '16px'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: '#e5e7eb',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '40px',
                                marginBottom: '8px'
                            }}>
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', margin: 0 }}>
                                Waiting for reports
                            </h3>
                            <p style={{ color: '#9ca3af', fontSize: '14px', maxWidth: '400px', margin: 0 }}>
                                New dog reports will appear here as they come in.
                            </p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                            gap: '24px'
                        }}>
                            {filteredReports.map(report => (
                                <div key={report.id} style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    border: '1px solid #e5e7eb',
                                    transition: 'all 0.3s'
                                }}>
                                    {/* Image Section */}
                                    {report.imageUrl && (() => {
                                        try {
                                            const images = JSON.parse(report.imageUrl);
                                            return (
                                                <div style={{ 
                                                    position: 'relative',
                                                    height: '240px',
                                                    background: '#f3f4f6',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    gap: '4px'
                                                }}>
                                                    {images.slice(0, 3).map((imgUrl, idx) => (
                                                        <img 
                                                            key={idx}
                                                            src={`http://localhost:3000${imgUrl}`} 
                                                            alt={`Reported dog ${idx + 1}`}
                                                            style={{
                                                                width: images.length === 1 ? '100%' : 'calc(33.33% - 3px)',
                                                                height: '100%',
                                                                objectFit: 'contain',
                                                                background: '#e5e7eb'
                                                            }}
                                                        />
                                                    ))}
                                                    {images.length > 3 && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            bottom: '12px',
                                                            right: '12px',
                                                            padding: '8px 12px',
                                                            background: 'rgba(0,0,0,0.7)',
                                                            color: 'white',
                                                            borderRadius: '8px',
                                                            fontSize: '12px',
                                                            fontWeight: '600'
                                                        }}>+{images.length - 3} more</div>
                                                    )}
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '12px',
                                                        left: '12px',
                                                        padding: '6px 12px',
                                                        background: report.status === 'resolved' ? '#10b981' : report.status === 'in_progress' ? '#f59e0b' : '#ef4444',
                                                        color: 'white',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                {report.status === 'resolved' && '✓'} {getStatusDisplay(report.status)}
                                            </span>
                                        </div>
                                            );
                                        } catch (e) {
                                            // Fallback for old single image format
                                            return (
                                                <div style={{ 
                                                    position: 'relative',
                                                    height: '240px',
                                                    background: '#f3f4f6',
                                                    overflow: 'hidden'
                                                }}>
                                                    <img 
                                                        src={`http://localhost:3000${report.imageUrl}`} 
                                                        alt="Reported dog"
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'contain'
                                                        }}
                                                    />
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '12px',
                                                        left: '12px',
                                                        padding: '6px 12px',
                                                        background: report.status === 'resolved' ? '#10b981' : report.status === 'in_progress' ? '#f59e0b' : '#ef4444',
                                                        color: 'white',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}>
                                                        {report.status === 'resolved' && '✓'} {getStatusDisplay(report.status)}
                                                    </span>
                                                </div>
                                            );
                                        }
                                    })()}
                                    
                                    {/* Content Section */}
                                    <div style={{ padding: '20px' }}>
                                        <div style={{ marginBottom: '16px' }}>
                                            <h3 style={{ 
                                                fontSize: '18px', 
                                                fontWeight: '700', 
                                                color: '#111827',
                                                margin: '0 0 8px 0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <span style={{ color: '#ef4444' }}></span>
                                                {report.location}
                                            </h3>
                                            <p style={{ 
                                                color: '#6b7280', 
                                                fontSize: '14px',
                                                margin: 0,
                                                lineHeight: '1.6'
                                            }}>
                                                {report.description}
                                            </p>
                                        </div>
                                        
                                        {report.additionalNotes && (
                                            <div style={{
                                                background: '#f9fafb',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                padding: '12px',
                                                marginBottom: '16px'
                                            }}>
                                                <p style={{ 
                                                    fontSize: '11px',
                                                    fontWeight: '700',
                                                    color: '#6b7280',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                    margin: '0 0 6px 0'
                                                }}>
                                                    Observation Note
                                                </p>
                                                <p style={{ 
                                                    fontSize: '13px',
                                                    color: '#374151',
                                                    margin: 0,
                                                    lineHeight: '1.5'
                                                }}>
                                                    {report.additionalNotes}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* Reporter Info */}
                                        <div style={{ 
                                            borderTop: '1px solid #e5e7eb',
                                            paddingTop: '16px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    background: '#eef2ff',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '14px',
                                                    fontWeight: '700',
                                                    color: '#6366f1'
                                                }}>
                                                    {report.reporter_name?.charAt(0).toUpperCase()}
                                                </div>
                                                <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>
                                                    <span style={{ fontWeight: '600' }}>Reported by:</span> {report.reporter_name}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '40px' }}>
                                                <svg style={{ width: '14px', height: '14px', color: '#10b981' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>
                                                    <span style={{ fontWeight: '600' }}>Contact:</span> {report.reporter_phone}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '40px' }}>
                                                <svg style={{ width: '14px', height: '14px', color: '#6366f1' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>
                                                    <span style={{ fontWeight: '600' }}>Date:</span> {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        {user?.role === 'owner' && (
                                            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                                                {report.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleRescue(report.id)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '12px',
                                                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '10px',
                                                            fontSize: '14px',
                                                            fontWeight: '700',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s'
                                                        }}
                                                    >
                                                        Start Rescue
                                                    </button>
                                                )}
                                                {report.status === 'in_progress' && (
                                                    <button 
                                                        onClick={() => completeRescue(report.id)}
                                                        style={{
                                                            flex: 1,
                                                            padding: '12px',
                                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '10px',
                                                            fontSize: '14px',
                                                            fontWeight: '700',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s'
                                                        }}
                                                    >
                                                        Complete Rescue
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DogReports;
