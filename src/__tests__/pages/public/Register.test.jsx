import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../../../pages/public/Register';
import { authAPI } from '../../../utils/api';

vi.mock('../../../utils/api', () => ({
  authAPI: {
    register: vi.fn(),
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

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  };

  it('should render registration form', async () => {
    renderRegister();
    
    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    }, { timeout: 10000 });
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  }, 10000);

  it('should display validation errors for empty form submission', async () => {
    renderRegister();
    
    const submitButton = screen.getByRole('button', { name: /register|sign up|create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryAllByText(/required/i).length).toBeGreaterThan(0);
    });
  });

  it('should handle successful registration', async () => {
    const mockResponse = {
      _id: '123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user',
      token: 'fake-jwt-token',
    };

    authAPI.register.mockResolvedValue(mockResponse);
    
    renderRegister();
    
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const phoneInput = screen.getByLabelText(/phone number/i);
    const addressInput = screen.getByLabelText(/^address$/i);
    const roleSelect = screen.getByRole('combobox');
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '+1234567890' } });
    fireEvent.change(addressInput, { target: { value: 'Test Address' } });
    fireEvent.change(roleSelect, { target: { value: 'user' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authAPI.register).toHaveBeenCalled();
    });
  });

  it('should display error on registration failure', async () => {
    authAPI.register.mockRejectedValue({
      message: 'Email already exists',
    });
    
    renderRegister();
    
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const phoneInput = screen.getByLabelText(/phone number/i);
    const addressInput = screen.getByLabelText(/^address$/i);
    const roleSelect = screen.getByRole('combobox');
    const passwordInputs = screen.getAllByPlaceholderText(/••••••••/);
    const passwordInput = passwordInputs[0];
    const confirmPasswordInput = passwordInputs[1];
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(nameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '+1234567890' } });
    fireEvent.change(addressInput, { target: { value: 'Test Address' } });
    fireEvent.change(roleSelect, { target: { value: 'user' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.queryByText(/email already exists/i) || screen.queryByText(/already be in use/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('should have a link to login page', () => {
    renderRegister();
    
    const loginLinks = screen.queryAllByText(/already have an account|sign in|login/i);
    expect(loginLinks.length).toBeGreaterThan(0);
  });

  it('should validate email format', async () => {
    renderRegister();
    
    const emailInput = screen.getByPlaceholderText(/your@email/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authAPI.register).not.toHaveBeenCalled();
    });
  });

  it('should validate password length', async () => {
    renderRegister();
    
    const passwordInput = screen.getAllByPlaceholderText(/••••••••/)[0];
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authAPI.register).not.toHaveBeenCalled();
    });
  });
});
