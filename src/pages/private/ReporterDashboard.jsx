import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dogReportsAPI } from '../../utils/api';
import NotificationBell from '../../components/shared/NotificationBell';
import ReportDog from './ReportDog';
import './AdminDashboard.css';

const ReporterDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [reportView, setReportView] = useState('dashboard'); 
    const [stats, setStats] = useState({
        totalReports: 0,
        pendingReports: 0,
        rescuedDogs: 0,
        myReports: 0,
        successStories: 0
    });
    const [liveReports, setLiveReports] = useState([]);
    const [recentReports, setRecentReports] = useState([]);
    const [myReports, setMyReports] = useState([]);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            navigate('/');
            return;
        }
        setUser(userData);
        calculateStats(userData);
        loadReports();
        
        
        const handleReportSubmitted = () => {
            calculateStats(userData);
            loadReports();
            setReportView('myreports'); 
        };
        
        const handleRescueStatusUpdate = () => {
            console.log('Rescue status update detected in ReporterDashboard');
            calculateStats(userData);
            loadReports();
        };
        
        window.addEventListener('reportSubmitted', handleReportSubmitted);
        window.addEventListener('rescueStatusUpdated', handleRescueStatusUpdate);
        return () => {
            window.removeEventListener('reportSubmitted', handleReportSubmitted);
            window.removeEventListener('rescueStatusUpdated', handleRescueStatusUpdate);
        };
    }, [navigate]);

    const calculateStats = async (userData) => {
        try {
            const reports = await dogReportsAPI.getAll();

            const rescued = reports.filter(r => r.status === 'Rescued' || r.status === 'Completed');
            const pendingReports = reports.filter(r => r.status === 'Pending');
            const userReports = reports.filter(r => r.reportedBy === userData.id);

            setStats({
                totalReports: reports.length,
                pendingReports: pendingReports.length,
                rescuedDogs: rescued.length,
                myReports: userReports.length,
                successStories: rescued.length
            });
        } catch (error) {
            console.error('Error calculating stats:', error);
        }
    };

    const loadReports = async () => {
        try {
            const reports = await dogReportsAPI.getAll();
            const sortedReports = reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setLiveReports(sortedReports.filter(r => r.status !== 'Completed').slice(0, 3));
            setRecentReports(sortedReports.slice(0, 5));
            
            
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData) {
                const userReports = reports.filter(r => r.reportedBy === userData.id);
                setMyReports(userReports);
            }
        } catch (error) {
            console.error('Error loading reports:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        navigate('/');
    };

    if (!user) return null;

    return (
        <div className="admin-dashboard-container">
            
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <img src="/logo.svg" alt="StreetShelter" className="admin-sidebar-logo-image" style={{width: '80px', height: 'auto', display: 'block', margin: '0 auto'}} />
                </div>

                <nav className="admin-sidebar-menu">
                    <button 
                        className={`admin-menu-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                        onClick={() => { setActiveSection('dashboard'); setReportView('dashboard'); }}
                    >
                        <span className="admin-menu-icon"></span>
                        <span className="admin-menu-text">Dashboard</span>
                    </button>
                    
                    <button 
                        className={`admin-menu-item ${activeSection === 'live' ? 'active' : ''}`}
                        onClick={() => { setActiveSection('live'); setReportView('live'); }}
                    >
                        <span className="admin-menu-icon"></span>
                        <span className="admin-menu-text">Live Reports</span>
                    </button>
                    
                    <button 
                        className={`admin-menu-item ${activeSection === 'myreports' ? 'active' : ''}`}
                        onClick={() => { setActiveSection('myreports'); setReportView('myreports'); }}
                    >
                        <span className="admin-menu-icon"></span>
                        <span className="admin-menu-text">My Reports</span>
                        {stats.myReports > 0 && (
                            <span className="admin-menu-badge">{stats.myReports}</span>
                        )}
                    </button>
                    
                    <button 
                        className={`admin-menu-item ${activeSection === 'submit' ? 'active' : ''}`}
                        onClick={() => { setActiveSection('submit'); setReportView('newreport'); }}
                    >
                        <span className="admin-menu-icon"></span>
                        <span className="admin-menu-text">Submit Report</span>
                    </button>
                </nav>

                <div className="admin-sidebar-footer">
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>
                        Logged in as:
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#e5e7eb', marginBottom: '12px', wordBreak: 'break-word' }}>
                        {user.email}
                    </div>
                    <button className="admin-logout-btn" onClick={handleLogout}>
                        <span>Logout</span>
                        <span>→</span>
                    </button>
                </div>
            </aside>

            
            <main className="admin-main-content">
                
                <header className="admin-header">
                    <input
                        type="search"
                        placeholder="Search reports..."
                        className="admin-search-bar"
                    />
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <NotificationBell />
                        <div className="admin-profile-section">
                            <div>
                                <div className="admin-profile-name">{user.name}</div>
                                <div className="admin-profile-role">Reporter</div>
                            </div>
                            <div className="admin-profile-avatar">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="admin-dashboard-content">
                    {/* Dashboard Section */}
                    {activeSection === 'dashboard' && (
                        <>
                            <div className="admin-welcome-section">
                                <h1 className="admin-welcome-title">Reporter Dashboard</h1>
                                <p className="admin-welcome-subtitle">Welcome back, {user.name}! Track your impact and submit new reports.</p>
                            </div>

                            <div className="admin-stats-grid">
                                <div className="admin-stat-card">
                                    <div className="admin-stat-header">
                                        <div className="admin-stat-icon blue"></div>
                                        <div className="admin-stat-trend up">Total</div>
                                    </div>
                                    <div className="admin-stat-label">Total Reports</div>
                                    <div className="admin-stat-number">{stats.totalReports}</div>
                                </div>

                                <div className="admin-stat-card">
                                    <div className="admin-stat-header">
                                        <div className="admin-stat-icon orange"></div>
                                        <div className="admin-stat-trend up">Pending</div>
                                    </div>
                                    <div className="admin-stat-label">Pending Rescues</div>
                                    <div className="admin-stat-number">{stats.pendingReports}</div>
                                </div>

                                <div className="admin-stat-card">
                                    <div className="admin-stat-header">
                                        <div className="admin-stat-icon green"></div>
                                        <div className="admin-stat-trend up">Success</div>
                                    </div>
                                    <div className="admin-stat-label">Rescued Dogs</div>
                                    <div className="admin-stat-number">{stats.rescuedDogs}</div>
                                </div>

                                <div className="admin-stat-card">
                                    <div className="admin-stat-header">
                                        <div className="admin-stat-icon purple"></div>
                                        <div className="admin-stat-trend up">Yours</div>
                                    </div>
                                    <div className="admin-stat-label">My Reports</div>
                                    <div className="admin-stat-number">{stats.myReports}</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '32px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
                                    Recent Activity
                                </h2>
                                <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                    {recentReports.length === 0 ? (
                                        <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                                            No reports yet. Start by submitting your first report!
                                        </p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {recentReports.slice(0, 5).map(report => (
                                                <div key={report.id} style={{
                                                    padding: '16px',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>                                                            {report.location}
                                                        </div>
                                                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                                            Status: {report.status} • {new Date(report.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        padding: '6px 12px',
                                                        background: report.status === 'resolved' ? '#d1fae5' : report.status === 'in_progress' ? '#fed7aa' : '#fee2e2',
                                                        color: report.status === 'resolved' ? '#065f46' : report.status === 'in_progress' ? '#92400e' : '#991b1b',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        fontWeight: '700'
                                                    }}>
                                                        {report.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    
                    {activeSection === 'live' && (
                        <>
                            <div className="admin-welcome-section">
                                <h1 className="admin-welcome-title">Live Reports</h1>
                                <p className="admin-welcome-subtitle">Real-time tracking of all active dog reports in your area.</p>
                            </div>

                            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                {liveReports.length === 0 ? (
                                    <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
                                        No active reports at the moment.
                                    </p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {liveReports.map(report => (
                                            <div key={report.id} style={{
                                                padding: '20px',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '12px',
                                                background: '#fefefe'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '18px', marginBottom: '8px' }}>                                                            {report.location}
                                                        </div>
                                                        <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                                                            {report.description}
                                                        </div>
                                                        <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                                                            Reported: {new Date(report.createdAt).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        padding: '8px 16px',
                                                        background: report.status === 'resolved' ? '#10b981' : report.status === 'in_progress' ? '#f59e0b' : '#ef4444',
                                                        color: 'white',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase'
                                                    }}>                                                        {report.status}
                                                    </span>
                                                </div>
                                                {report.imageUrl && (() => {
                                                    try {
                                                        const images = JSON.parse(report.imageUrl);
                                                        return (
                                                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                                                                {images.map((imgUrl, idx) => (
                                                                    <img 
                                                                        key={idx}
                                                                        src={`http://localhost:3000${imgUrl}`}
                                                                        alt={`Report ${idx + 1}`}
                                                                        style={{ width: 'calc(50% - 4px)', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px', background: '#f3f4f6' }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        );
                                                    } catch (e) {
                                                        // Fallback for old single image format
                                                        return (
                                                            <img 
                                                                src={`http://localhost:3000${report.imageUrl}`}
                                                                alt="Report"
                                                                style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '8px', marginTop: '12px', background: '#f3f4f6' }}
                                                            />
                                                        );
                                                    }
                                                })()}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    
                    {activeSection === 'myreports' && (
                        <>
                            <div className="admin-welcome-section">
                                <h1 className="admin-welcome-title">My Reports</h1>
                                <p className="admin-welcome-subtitle">Track all your submitted reports and their rescue status.</p>
                            </div>

                            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                {myReports.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}>
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            background: '#e5e7eb',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '40px',
                                            margin: '0 auto 16px'
                                        }}></div>
                                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>
                                            No Reports Yet
                                        </h3>
                                        <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '24px' }}>
                                            Start making a difference by submitting your first report
                                        </p>
                                        <button 
                                            onClick={() => setActiveSection('submit')}
                                            style={{
                                                padding: '12px 24px',
                                                background: '#5b5bd6',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                fontSize: '14px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Submit Your First Report
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {myReports.map(report => (
                                            <div key={report.id} style={{
                                                padding: '20px',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '12px',
                                                display: 'flex',
                                                gap: '20px'
                                            }}>
                                                {report.imageUrl && (() => {
                                                    try {
                                                        const images = JSON.parse(report.imageUrl);
                                                        return (
                                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '120px', flexShrink: 0 }}>
                                                                {images.slice(0, 2).map((imgUrl, idx) => (
                                                                    <img
                                                                        key={idx}
                                                                        src={`http://localhost:3000${imgUrl}`}
                                                                        alt={`Report ${idx + 1}`}
                                                                        style={{
                                                                            width: images.length === 1 ? '120px' : '56px',
                                                                            height: '56px',
                                                                            borderRadius: '8px',
                                                                            objectFit: 'contain',
                                                                            background: '#f3f4f6'
                                                                        }}
                                                                    />
                                                                ))}
                                                                {images.length > 2 && (
                                                                    <div style={{
                                                                        width: '56px',
                                                                        height: '56px',
                                                                        borderRadius: '8px',
                                                                        background: '#e5e7eb',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '12px',
                                                                        fontWeight: '600',
                                                                        color: '#6b7280'
                                                                    }}>+{images.length - 2}</div>
                                                                )}
                                                            </div>
                                                        );
                                                    } catch (e) {
                                                        
                                                        return (
                                                            <img
                                                                src={`http://localhost:3000${report.imageUrl}`}
                                                                alt="Report"
                                                                style={{
                                                                    width: '120px',
                                                                    height: '120px',
                                                                    borderRadius: '12px',
                                                                    objectFit: 'contain',
                                                                    flexShrink: 0,
                                                                    background: '#f3f4f6'
                                                                }}
                                                            />
                                                        );
                                                    }
                                                })()}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', margin: 0 }}>                                                            {report.location}
                                                        </h3>
                                                        <span style={{
                                                            padding: '6px 12px',
                                                            background: report.status === 'resolved' ? '#d1fae5' : report.status === 'in_progress' ? '#fed7aa' : '#fee2e2',
                                                            color: report.status === 'resolved' ? '#065f46' : report.status === 'in_progress' ? '#92400e' : '#991b1b',
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            fontWeight: '700'
                                                        }}>
                                                            {report.status}
                                                        </span>
                                                    </div>
                                                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px', lineHeight: '1.6' }}>
                                                        {report.description}
                                                    </p>
                                                    <p style={{ color: '#9ca3af', fontSize: '12px', margin: 0 }}>
                                                        Reported on {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    
                    {activeSection === 'submit' && (
                        <>
                            <div className="admin-welcome-section">
                                <h1 className="admin-welcome-title">Submit Report</h1>
                                <p className="admin-welcome-subtitle">Report a dog in need of rescue.</p>
                            </div>

                            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <ReportDog 
                                    embedded={true}
                                    onSuccess={() => {
                                        calculateStats(user);
                                        loadReports();
                                        setActiveSection('myreports');
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ReporterDashboard;
