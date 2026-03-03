import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReporterDashboard from '../../../pages/private/ReporterDashboard';

vi.mock('../../../components/shared/NotificationBell', () => ({
  default: () => <div>NotificationBell</div>,
}));

vi.mock('../../../pages/private/ReportDog', () => ({
  default: () => <div>ReportDog</div>,
}));

vi.mock('../../../utils/api', () => ({
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

describe('ReporterDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage.clear();
    global.localStorage.setItem('user', JSON.stringify({
      id: '1',
      username: 'reporter',
      email: 'reporter@example.com',
      role: 'user',
      token: 'fake-token'
    }));
    global.localStorage.setItem('isAuthenticated', 'true');
  });

  const renderReporterDashboard = () => {
    return render(
      <BrowserRouter>
        <ReporterDashboard />
      </BrowserRouter>
    );
  };

  it('should render reporter dashboard', async () => {
    renderReporterDashboard();
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
    const elements = screen.getAllByText(/streetshelter/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('should display my reports section', async () => {
    renderReporterDashboard();
    
    await waitFor(() => {
      const elements = screen.getAllByText(/my reports/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('should have create new report button', async () => {
    renderReporterDashboard();
    await waitFor(() => {
      const createButton = screen.getByText(/submit report/i);
      expect(createButton).toBeInTheDocument();
    });
  });

  it('should show user information', async () => {
    renderReporterDashboard();
    await waitFor(() => {
      const elements = screen.getAllByText(/reporter/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});
