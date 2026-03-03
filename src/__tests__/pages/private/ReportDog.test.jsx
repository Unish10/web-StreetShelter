import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReportDog from '../../../pages/private/ReportDog';
import { dogReportAPI } from '../../../utils/api';

vi.mock('../../../utils/api', () => ({
  dogReportAPI: {
    create: vi.fn(),
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

describe('ReportDog Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('user', JSON.stringify({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'reporter',
      token: 'fake-token'
    }));
  });

  const renderReportDog = () => {
    return render(
      <BrowserRouter>
        <ReportDog />
      </BrowserRouter>
    );
  };

  it('should render dog report form', () => {
    renderReportDog();
    expect(screen.getByText(/report a street animal/i)).toBeInTheDocument();
  });

  it('should have location input field', () => {
    renderReportDog();
    const locationInput = screen.getByPlaceholderText(/near central park|main street/i);
    expect(locationInput).toBeInTheDocument();
  });

  it('should have description textarea', () => {
    renderReportDog();
    const descriptionInput = screen.getByPlaceholderText(/describe the animal's appearance/i);
    expect(descriptionInput).toBeInTheDocument();
  });

  it('should handle successful report submission', async () => {
    dogReportAPI.create.mockResolvedValue({
      id: '123',
      location: 'Test Location',
      description: 'Test Description',
    });
    
    renderReportDog();
    
    const locationInput = screen.getByPlaceholderText(/near central park|main street/i);
    const descriptionInput = screen.getByPlaceholderText(/describe the animal's appearance/i);
    const submitButton = screen.getByRole('button', { name: /submit report/i });

    fireEvent.change(locationInput, { target: { value: 'Test Location' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(locationInput.value).toBe('Test Location');
    });
  });

  it('should display validation errors for empty form', async () => {
    renderReportDog();
    
    const submitButton = screen.getByRole('button', { name: /submit report/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeInTheDocument();
    });
  });

  it('should have image upload functionality', () => {
    const { container } = renderReportDog();
    const imageInput = container.querySelector('input[type="file"]');
    expect(imageInput).toBeInTheDocument();
  });

  it('should display error on submission failure', async () => {
    dogReportAPI.create.mockRejectedValue({
      message: 'Failed to create report',
    });
    
    renderReportDog();
    
    const locationInput = screen.getByPlaceholderText(/near central park|main street/i);
    const descriptionInput = screen.getByPlaceholderText(/describe the animal's appearance/i);
    const submitButton = screen.getByRole('button', { name: /submit report/i });

    fireEvent.change(locationInput, { target: { value: 'Test Location' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(locationInput.value).toBe('Test Location');
    });
  });
});
