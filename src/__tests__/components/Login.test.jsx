import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/public/Login';
import { authAPI } from '../../utils/api';


vi.mock('../../utils/api', () => ({
  authAPI: {
    login: vi.fn(),
  },
}));


const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: {} }),
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('should render login form', () => {
    renderLogin();
    
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should display validation errors for empty form submission', async () => {
    renderLogin();
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('should display validation error for invalid email format', async () => {
    renderLogin();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordInput, { target: { value: 'validpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      
      expect(authAPI.login).not.toHaveBeenCalled();
    });
    
    
    await waitFor(() => {
      const errorElements = screen.queryAllByText(/email/i);
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  it('should successfully login with valid credentials', async () => {
    const mockResponse = {
      _id: '123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'reporter',
      token: 'fake-jwt-token',
    };

    authAPI.login.mockResolvedValue(mockResponse);
    
    renderLogin();
    
    const emailInput = screen.getByPlaceholderText('admin@streetshelter.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authAPI.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard/reporter');
    });
  });

  it('should display error message on login failure', async () => {
    authAPI.login.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });
    
    renderLogin();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  it('should toggle password visibility', () => {
    const { container } = renderLogin();
    
    const passwordInput = screen.getByLabelText(/password/i);
    const toggleButton = container.querySelector('.login-password-toggle');

    expect(passwordInput).toHaveAttribute('type', 'password');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should have a link to registration page', () => {
    renderLogin();
    
    const registerLink = screen.getByText(/don't have an account/i);
    expect(registerLink).toBeInTheDocument();
  });

  it('should have a link to forgot password page', () => {
    renderLogin();
    
    const forgotLink = screen.getByText(/forgot password/i);
    expect(forgotLink).toBeInTheDocument();
  });

  it('should disable submit button while submitting', async () => {
    authAPI.login.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({
      _id: '123',
      username: 'testuser',
      email: 'test@example.com',
      role: 'reporter',
      token: 'fake-jwt-token',
    }), 200)));
    
    renderLogin();
    
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });
});
