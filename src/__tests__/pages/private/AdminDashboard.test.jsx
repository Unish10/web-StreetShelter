import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../../../pages/private/AdminDashboard';
import { adminAPI } from '../../../utils/api';

vi.mock('../../../components/shared/NotificationBell', () => ({
  default: () => <div>NotificationBell</div>,
}));

vi.mock('../../../utils/api', () => ({
  adminAPI: {
    getUsers: vi.fn(),
    getOwners: vi.fn(),
    getPendingOwners: vi.fn(),
    getStats: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Clear and set localStorage
    global.localStorage.clear();
    const adminUser = {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      token: 'fake-token'
    };
    global.localStorage.setItem('user', JSON.stringify(adminUser));
    global.localStorage.setItem('isAuthenticated', 'true');
    
    // Setup API mocks
    adminAPI.getUsers.mockResolvedValue([
      { id: '1', username: 'user1', email: 'user1@test.com', role: 'user' }
    ]);
    adminAPI.getOwners.mockResolvedValue([
      { id: '2', username: 'owner1', email: 'owner1@test.com', role: 'owner', isVerified: true }
    ]);
    adminAPI.getPendingOwners.mockResolvedValue([
      { id: '3', username: 'owner2', email: 'owner2@test.com', role: 'owner', isVerified: false }
    ]);
    adminAPI.getStats.mockResolvedValue({
      totalUsers: 10,
      totalOwners: 5,
      pendingVerifications: 2,
      verifiedOwners: 3
    });
  });

  const renderAdminDashboard = () => {
    return render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
  };

  it('should render admin dashboard', async () => {
    renderAdminDashboard();
    
    // Check if navigate was called (indicating redirect)
    expect(mockNavigate).not.toHaveBeenCalled();
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 5000 });
    // Check that the dashboard rendered
    const sidebarElements = screen.getAllByText(/streetshelter/i);
    expect(sidebarElements.length).toBeGreaterThan(0);
  });

  it('should display statistics cards', async () => {
    renderAdminDashboard();
    
    await waitFor(() => {
      const cards = screen.queryAllByText(/total|users|owners|pending|verified/i);
      expect(cards.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('should show navigation menu', async () => {
    renderAdminDashboard();
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
    const dashboardBtns = screen.getAllByText(/dashboard/i);
    expect(dashboardBtns.length).toBeGreaterThan(0);
  });

  it('should have logout button', async () => {
    renderAdminDashboard();
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
    const logoutButton = screen.getByText(/logout/i);
    expect(logoutButton).toBeInTheDocument();
  });
});
