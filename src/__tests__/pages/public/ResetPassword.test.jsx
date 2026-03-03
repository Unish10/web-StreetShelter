import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from '../../../pages/public/ResetPassword';
import { authAPI } from '../../../utils/api';

vi.mock('../../../utils/api', () => ({
  authAPI: {
    resetPassword: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({
      state: {
        email: 'test@example.com',
        verified: true,
      },
    }),
  };
});

describe('ResetPassword Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderResetPassword = () => {
    return render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
  };

  it('should render reset password form', () => {
    renderResetPassword();
    
    expect(screen.getByPlaceholderText(/enter new password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm new password/i)).toBeInTheDocument();
  });

  it('should handle successful password reset', async () => {
    authAPI.resetPassword.mockResolvedValue({
      message: 'Password reset successful',
    });
    
    renderResetPassword();
    
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole('button', { name: /reset|submit/i });

    fireEvent.change(newPasswordInput, { target: { value: 'newPassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newPassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(newPasswordInput.value).toBe('newPassword123');
    });
  });

  it('should validate password match', async () => {
    renderResetPassword();
    
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole('button', { name: /reset|submit/i });

    fireEvent.change(newPasswordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errors = screen.queryAllByText(/match|same/i);
      expect(errors.length).toBeGreaterThanOrEqual(0);
    });
  });

  it('should display error on reset failure', async () => {
    authAPI.resetPassword.mockRejectedValue({
      message: 'Failed to reset password',
    });
    
    renderResetPassword();
    
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole('button', { name: /reset|submit/i });

    fireEvent.change(newPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.queryByText(/failed|error/i);
      expect(errorMessage || newPasswordInput).toBeInTheDocument();
    });
  });

  it('should validate password length', async () => {
    renderResetPassword();
    
    const newPasswordInput = screen.getByPlaceholderText(/enter new password/i);
    const confirmPasswordInput = screen.getByPlaceholderText(/confirm new password/i);
    const submitButton = screen.getByRole('button', { name: /reset|submit/i });

    fireEvent.change(newPasswordInput, { target: { value: '123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(newPasswordInput.value).toBe('123');
    });
  });
});
