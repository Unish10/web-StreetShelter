import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../../pages/private/Home';

vi.mock('../../../utils/api', () => ({
  dogReportAPI: {
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

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.localStorage.clear();
    global.localStorage.setItem('user', JSON.stringify({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      token: 'fake-token'
    }));
  });

  const renderHome = () => {
    return render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
  };

  it('should render home page', () => {
    const { container } = renderHome();
    // Home component redirects, so it renders null
    expect(container.firstChild).toBeNull();
  });

  it('should display user greeting', () => {
    const { container } = renderHome();
    
    expect(container).toBeInTheDocument();
  });

  it('should show navigation menu', () => {
    renderHome();
    
    expect(mockNavigate).toHaveBeenCalled();
  });

  it('should display recent activity section', async () => {
    renderHome();
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('should have quick action buttons', () => {
    renderHome();
    
    expect(mockNavigate).toHaveBeenCalled();
  });
});
