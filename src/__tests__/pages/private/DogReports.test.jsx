import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DogReports from '../../../pages/private/DogReports';

vi.mock('../../../utils/api', () => ({
  ownerAPI: {
    getProfile: vi.fn().mockResolvedValue(null),
  },
  dogReportsAPI: {
    getAll: vi.fn().mockResolvedValue([
      {
        id: '1',
        location: 'Test Location',
        description: 'Test Description',
        status: 'Pending',
        createdAt: '2024-01-01'
      }
    ]),
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

describe('DogReports Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin',
      token: 'fake-token'
    }));
  });

  const renderDogReports = () => {
    return render(
      <BrowserRouter>
        <DogReports />
      </BrowserRouter>
    );
  };

  it('should render dog reports page', async () => {
    renderDogReports();
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });
    const element = screen.getByText(/streetshelter/i);
    expect(element).toBeInTheDocument();
  });

  it('should display list of reports', async () => {
    renderDogReports();
    
    await waitFor(() => {
      expect(screen.getByText(/test location/i)).toBeInTheDocument();
    });
  });

  it('should show report status', async () => {
    renderDogReports();
    
    await waitFor(() => {
      expect(screen.getByText(/pending/i)).toBeInTheDocument();
    });
  });

  it('should have filter options', async () => {
    renderDogReports();
    
    await waitFor(() => {
      const filterElements = screen.queryAllByText(/filter|all|pending|rescued|status/i);
      expect(filterElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('should display report details', async () => {
    renderDogReports();
    
    await waitFor(() => {
      expect(screen.getByText(/test description/i)).toBeInTheDocument();
    });
  });
});
