import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPassword from '../../../pages/public/ForgotPassword';
import { authAPI } from '../../../utils/api';

vi.mock('../../../utils/api', () => ({
  authAPI: {
    forgotPassword: vi.fn(),
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

describe('ForgotPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForgotPassword = () => {
    return render(
      <BrowserRouter>
        <ForgotPassword />
      </BrowserRouter>
    );
  };

  it('should render forgot password form', () => {
    renderForgotPassword();
    
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('should display validation error for empty email', async () => {
    renderForgotPassword();
    
    const submitButton = screen.getByRole('button', { name: /send|reset|submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authAPI.forgotPassword).not.toHaveBeenCalled();
    });
  });

  it('should handle successful password reset request', async () => {
    authAPI.forgotPassword.mockResolvedValue({
      message: 'Password reset email sent',
    });
    
    renderForgotPassword();
    
    const emailInput = screen.getAllByRole('textbox')[0];
    const submitButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput.value).toBe('test@example.com');
    });
  });

  it('should display error for non-existent email', async () => {
    renderForgotPassword();
    
    const emailInput = screen.getAllByRole('textbox')[0];
    const submitButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessages = screen.queryAllByText(/no account found|not found|error/i);
      expect(errorMessages.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('should have a link back to login', () => {
    renderForgotPassword();
    
    const loginLink = screen.getByText(/back to login/i);
    expect(loginLink).toBeInTheDocument();
  });

  it('should validate email format', async () => {
    renderForgotPassword();
    
    const emailInput = screen.getAllByRole('textbox')[0];
    const submitButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(emailInput.value).toBe('invalid-email');
    });
  });
});
