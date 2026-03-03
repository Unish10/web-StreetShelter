import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import NotificationBell from '../../components/shared/NotificationBell';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [activeSection, setActiveSection] = useState('dashboard');
    const [pendingOwners, setPendingOwners] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [allOwners, setAllOwners] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOwners: 0,
        pendingVerifications: 0,
        verifiedOwners: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            navigate('/admin/login');
            return;
        }
        setAdmin(user);
        loadData();
    }, [navigate]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            
            const [usersData, ownersData, pendingData, statsData] = await Promise.all([
                adminAPI.getUsers(),
                adminAPI.getOwners(),
                adminAPI.getPendingOwners(),
                adminAPI.getStats()
            ]);

            setAllUsers(usersData);
            setAllOwners(ownersData);
            setPendingOwners(pendingData);
            setStats(statsData);
        } catch (err) {
            console.error('Error loading admin data:', err);
            setError(err.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('adminAuthenticated');
        navigate('/admin/login');
    };

    const handleVerifyOwner = async (ownerId) => {
        try {
            await adminAPI.verifyOwner(ownerId);
            alert('Owner verified successfully!');
            loadData(); 
        } catch (err) {
            console.error('Error verifying owner:', err);
            alert(err.message || 'Failed to verify owner');
        }
    };

    const handleRejectOwner = async (ownerId) => {
        if (!confirm('Are you sure you want to reject this owner registration?')) {
            return;
        }
        
        try {
            await adminAPI.rejectOwner(ownerId);
            alert('Owner registration rejected');
            loadData(); 
        } catch (err) {
            console.error('Error rejecting owner:', err);
            alert(err.message || 'Failed to reject owner');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            await adminAPI.deleteUser(userId);
            alert('User deleted successfully!');
            loadData(); 
        } catch (err) {
            console.error('Error deleting user:', err);
            alert(err.message || 'Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!admin) return null;

    return (
        <div className="admin-dashboard-container">
            
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
                            onClick={() => setActiveSection('users')} 
                            className={`admin-menu-item ${activeSection === 'users' ? 'active' : ''}`}
                        >
                            <svg className="admin-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span className="admin-menu-text">Users</span>
                        </button>
                        <button 
                            onClick={() => setActiveSection('owners')} 
                            className={`admin-menu-item ${activeSection === 'owners' ? 'active' : ''}`}
                        >
                            <svg className="admin-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            <span className="admin-menu-text">Shelter Owners</span>
                        </button>
                        <button 
                            onClick={() => setActiveSection('verifications')} 
                            className={`admin-menu-item ${activeSection === 'verifications' ? 'active' : ''}`}
                        >
                            <svg className="admin-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="admin-menu-text">Verifications</span>
                            {stats.pendingVerifications > 0 && (
                                <span className="admin-menu-badge">{stats.pendingVerifications}</span>
                            )}
                        </button>
                    </div>

                    <div className="admin-menu-section">
                        <div className="admin-menu-label">System</div>
                        <button 
                            onClick={() => setActiveSection('settings')} 
                            className={`admin-menu-item ${activeSection === 'settings' ? 'active' : ''}`}
                        >
                            <svg className="admin-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="admin-menu-text">Settings</span>
                        </button>
                    </div>
                </nav>

                <div className="admin-sidebar-footer">
                    <div className="admin-user-info">
                        <div className="admin-user-label">Logged in as</div>
                        <div className="admin-user-email">{admin.email}</div>
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
                            placeholder="Search users, shelters..." 
                        />
                    </div>

                    <div className="admin-header-actions">
                        <NotificationBell />

                        <div className="admin-profile-section">
                            <div className="admin-profile-info">
                                <div className="admin-profile-name">Admin Panel</div>
                                <div className="admin-profile-role">Administrator</div>
                            </div>
                            <img 
                                src="https://ui-avatars.com/api/?name=Admin&background=5b5bd6&color=fff" 
                                alt="Admin" 
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
                                <h1 className="admin-welcome-title">Admin Dashboard</h1>
                                <p className="admin-welcome-subtitle">
                                    Monitor and manage your animal rescue platform. Review pending verifications and track user activity.
                                </p>
                            </div>

                            <div className="admin-stats-grid">
                                <div className="admin-stat-card">
                                    <div className="admin-stat-header">
                                        <div className="admin-stat-icon blue"></div>
                                        <div className="admin-stat-trend up">↑ +12%</div>
                                    </div>
                                    <div className="admin-stat-label">Total Users</div>
                                    <div className="admin-stat-number">{stats.totalUsers}</div>
                                </div>

                                <div className="admin-stat-card">
                                    <div className="admin-stat-header">
                                        <div className="admin-stat-icon purple"></div>
                                        <div className="admin-stat-trend up">↑ +5%</div>
                                    </div>
                                    <div className="admin-stat-label">Rescue Owners</div>
                                    <div className="admin-stat-number">{stats.totalOwners}</div>
                                </div>

                                <div className="admin-stat-card">
                                    <div className="admin-stat-header">
                                        <div className="admin-stat-icon orange"></div>
                                        <div className="admin-stat-trend warning">! Pending</div>
                                    </div>
                                    <div className="admin-stat-label">Verifications</div>
                                    <div className="admin-stat-number">{stats.pendingVerifications}</div>
                                </div>

                                <div className="admin-stat-card">
                                    <div className="admin-stat-header">
                                        <div className="admin-stat-icon green">✓</div>
                                        <div className="admin-stat-trend complete">✓</div>
                                    </div>
                                    <div className="admin-stat-label">Verified Shelters</div>
                                    <div className="admin-stat-number">{stats.verifiedOwners}</div>
                                </div>
                            </div>

                            <div className="admin-section">
                                <div className="admin-section-header">
                                    <h2 className="admin-section-title">
                                        <span className="admin-section-title-icon"></span>
                                        Quick Overview
                                    </h2>
                                </div>
                                <div className="admin-empty-state">
                                    <div className="admin-empty-icon"></div>
                                    <div className="admin-empty-title">Welcome to your dashboard!</div>
                                    <p className="admin-empty-text">
                                        Use the menu on the left to navigate between different sections.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Users Section */}
                    {activeSection === 'users' && (
                        <>
                            <div className="admin-welcome-section">
                                <h1 className="admin-welcome-title">User Management</h1>
                                <p className="admin-welcome-subtitle">
                                    View and manage all users on the platform.
                                </p>
                            </div>

                            <div className="admin-section">
                                <div className="admin-section-header">
                                    <h2 className="admin-section-title">
                                        <span className="admin-section-title-icon"></span>
                                        All Users
                                    </h2>
                                </div>
                                
                                {allUsers.length === 0 ? (
                                    <div className="admin-empty-state">
                                        <div className="admin-empty-icon"></div>
                                        <p className="admin-empty-text">No users registered yet</p>
                                    </div>
                                ) : (
                                    <div className="admin-table-wrapper">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Username</th>
                                                    <th>Email</th>
                                                    <th>Role</th>
                                                    <th>Joined</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allUsers.map((user) => (
                                                    <tr key={user.id}>
                                                        <td className="admin-table-name">{user.username}</td>
                                                        <td>{user.email}</td>
                                                        <td>
                                                            <span className={`admin-badge ${
                                                                user.role === 'admin' 
                                                                    ? 'role-admin'
                                                                    : 'role-reporter'
                                                            }`}>
                                                                {user.role === 'admin' ? 'Admin' : 'User'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td>
                                                            {user.role !=='admin' && (
                                                                <button
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="admin-btn admin-btn-reject"
                                                                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Shelter Owners Section */}
                    {activeSection === 'owners' && (
                        <>
                            <div className="admin-welcome-section">
                                <h1 className="admin-welcome-title">Shelter Owners</h1>
                                <p className="admin-welcome-subtitle">
                                    Manage all shelter owners registered on the platform.
                                </p>
                            </div>

                            <div className="admin-section">
                                <div className="admin-section-header">
                                    <h2 className="admin-section-title">
                                        <span className="admin-section-title-icon"></span>
                                        All Shelter Owners
                                    </h2>
                                </div>
                                
                                {allOwners.length === 0 ? (
                                    <div className="admin-empty-state">
                                        <div className="admin-empty-icon"></div>
                                        <div className="admin-empty-title">No shelter owners yet</div>
                                        <p className="admin-empty-text">
                                            Shelter owners will appear here once they register.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="admin-table-wrapper">
                                        <table className="admin-table">
                                            <thead>
                                                <tr>
                                                    <th>Business Name</th>
                                                    <th>Owner Email</th>
                                                    <th>Type</th>
                                                    <th>Capacity</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {allOwners.map((owner) => (
                                                    <tr key={owner.id}>
                                                        <td className="admin-table-name">{owner.business_name}</td>
                                                        <td>{owner.user?.email || 'N/A'}</td>
                                                        <td>{owner.ownership_type}</td>
                                                        <td>{owner.capacity || 'Not specified'}</td>
                                                        <td>
                                                            {owner.isVerified ? (
                                                                <span className="admin-badge status-verified">
                                                                    Verified
                                                                </span>
                                                            ) : (
                                                                <span className="admin-badge status-pending">
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {!owner.isVerified && (
                                                                <button
                                                                    onClick={() => handleVerifyOwner(owner.id)}
                                                                    className="admin-btn admin-btn-verify"
                                                                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', marginRight: '0.5rem' }}
                                                                >
                                                                    Verify
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDeleteUser(owner.userId)}
                                                                className="admin-btn admin-btn-reject"
                                                                style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Verifications Section */}
                    {activeSection === 'verifications' && (
                        <>
                            <div className="admin-welcome-section">
                                <h1 className="admin-welcome-title">Verifications</h1>
                                <p className="admin-welcome-subtitle">
                                    Review and approve pending shelter owner verifications.
                                </p>
                            </div>

                            <div className="admin-section">
                                <div className="admin-section-header">
                                    <h2 className="admin-section-title">
                                        <span className="admin-section-title-icon"></span>
                                        Pending Verifications
                                    </h2>
                                </div>
                                
                                {pendingOwners.length === 0 ? (
                                    <div className="admin-empty-state">
                                        <div className="admin-empty-icon"></div>
                                        <div className="admin-empty-title">All caught up!</div>
                                        <p className="admin-empty-text">No pending verifications at the moment.</p>
                                    </div>
                                ) : (
                                    <div className="admin-verification-list">
                                        {pendingOwners.map((owner) => (
                                            <div key={owner.id} className="admin-verification-card">
                                                <div className="admin-verification-content">
                                                    <div className="admin-verification-info">
                                                        <h3 className="admin-verification-name">{owner.business_name}</h3>
                                                        <div className="admin-verification-details">
                                                            <p className="admin-verification-detail">
                                                                <span className="admin-verification-detail-label">Contact Person:</span> {owner.user?.username || 'N/A'}
                                                            </p>
                                                            <p className="admin-verification-detail">
                                                                <span className="admin-verification-detail-label">Email:</span> {owner.user?.email || 'N/A'}
                                                            </p>
                                                            <p className="admin-verification-detail">
                                                                <span className="admin-verification-detail-label">Organization Type:</span> {owner.ownership_type}
                                                            </p>
                                                            <p className="admin-verification-detail">
                                                                <span className="admin-verification-detail-label">ID Number:</span> {owner.id_number}
                                                            </p>
                                                            <p className="admin-verification-detail">
                                                                <span className="admin-verification-detail-label">Capacity:</span> {owner.capacity || 'Not specified'}
                                                            </p>
                                                            {owner.description && (
                                                                <p className="admin-verification-detail">
                                                                    <span className="admin-verification-detail-label">Description:</span> {owner.description}
                                                                </p>
                                                            )}
                                                            <p className="admin-verification-detail">
                                                                <span className="admin-verification-detail-label">Registered:</span> {new Date(owner.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="admin-verification-actions">
                                                        <button
                                                            onClick={() => handleVerifyOwner(owner.id)}
                                                            className="admin-btn admin-btn-verify"
                                                        >
                                                            Verify
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectOwner(owner.id)}
                                                            className="admin-btn admin-btn-reject"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {/* Settings Section */}
                    {activeSection === 'settings' && (
                        <>
                            <div className="admin-welcome-section">
                                <h1 className="admin-welcome-title">Settings</h1>
                                <p className="admin-welcome-subtitle">
                                    Configure platform settings and preferences.
                                </p>
                            </div>

                            <div className="admin-section">
                                <div className="admin-section-header">
                                    <h2 className="admin-section-title">
                                        Account Information
                                    </h2>
                                </div>
                                
                                <div style={{ padding: '1rem' }}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Email:</strong>
                                        <span>{admin.email}</span>
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Role:</strong>
                                        <span className="admin-badge role-owner">Administrator</span>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-section">
                                <div className="admin-section-header">
                                    <h2 className="admin-section-title">
                                        <span className="admin-section-title-icon"></span>
                                        Platform Settings
                                    </h2>
                                </div>
                                
                                <div className="admin-empty-state">
                                    <div className="admin-empty-icon"></div>
                                    <div className="admin-empty-title">Settings Panel</div>
                                    <p className="admin-empty-text">
                                        Platform configuration options will be available here.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <footer className="admin-footer">
                    <div className="admin-footer-links">
                        <a href="#" className="admin-footer-link">Privacy Policy</a>
                        <a href="#" className="admin-footer-link">Terms of Service</a>
                        <a href="#" className="admin-footer-link">Support</a>
                    </div>
                    <p>&copy; 2024 StreetShelter. All rights reserved.</p>
                </footer>
            </main>
        </div>
    );
};

export default AdminDashboard;
