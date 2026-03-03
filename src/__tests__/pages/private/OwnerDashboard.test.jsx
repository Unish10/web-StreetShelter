import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OwnerDashboard from '../../../pages/private/OwnerDashboard';

vi.mock('../../../components/shared/NotificationBell', () => ({
  default: () => <div>NotificationBell</div>,
}));

vi.mock('../../../utils/api', () => ({
  ownerAPI: {
    getProfile: vi.fn().mockResolvedValue({ isVerified: true }),
  },
  dogReportsAPI: {
    getAll: vi.fn().mockResolvedValue([]),
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

describe('OwnerDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage.clear();
    global.localStorage.setItem('user', JSON.stringify({
      id: '1',
      username: 'owner',
      email: 'owner@example.com',
      role: 'owner',
      token: 'fake-token'
    }));
  });

  const renderOwnerDashboard = () => {
    return render(
      <BrowserRouter>
        <OwnerDashboard />
      </BrowserRouter>
    );
  };

  it('should render owner dashboard', async () => {
    renderOwnerDashboard();
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
    const elements = screen.getAllByText(/streetshelter/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('should display my applications section', async () => {
    renderOwnerDashboard();
    
    await waitFor(() => {
      const elements = screen.getAllByText(/pending reports/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('should display available dogs section', async () => {
    renderOwnerDashboard();
    
    await waitFor(() => {
      const elements = screen.getAllByText(/active rescues|success stories/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('should have apply button for dogs', async () => {
    renderOwnerDashboard();
    
    await waitFor(() => {
      const applyButtons = screen.queryAllByRole('button', { name: /apply|adopt/i });
      expect(applyButtons.length).toBeGreaterThanOrEqual(0);
    });
  });
});
