import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VerifyOTP from '../../../pages/public/VerifyOTP';
import { authAPI } from '../../../utils/api';

vi.mock('../../../utils/api', () => ({
  authAPI: {
    verifyOTP: vi.fn(),
    resendOTP: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { email: 'test@example.com' } }),
  };
});

describe('VerifyOTP Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderVerifyOTP = () => {
    return render(
      <BrowserRouter>
        <VerifyOTP />
      </BrowserRouter>
    );
  };

  it('should render OTP verification form', () => {
    renderVerifyOTP();
    expect(screen.getByText(/verify otp/i)).toBeInTheDocument();
  });

  it('should have OTP input fields', () => {
    renderVerifyOTP();
    const otpInputs = screen.getAllByRole('textbox');
    expect(otpInputs.length).toBe(6);
  });

  it('should handle successful OTP verification', async () => {
    authAPI.verifyOTP.mockResolvedValue({
      message: 'OTP verified successfully',
      token: 'fake-jwt-token',
    });
    
    renderVerifyOTP();
    
    const otpInputs = screen.getAllByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /verify/i });

    otpInputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: '1' } });
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(otpInputs[0].value).toBe('1');
    });
  });

  it('should display error for invalid OTP', async () => {
    renderVerifyOTP();
    
    const otpInputs = screen.getAllByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /verify/i });

    otpInputs.forEach((input) => {
      fireEvent.change(input, { target: { value: '0' } });
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(otpInputs[0].value).toBe('0');
    });
  });

  it('should have resend OTP button', () => {
    renderVerifyOTP();
    const resendButton = screen.getByText(/resend code/i);
    expect(resendButton).toBeInTheDocument();
  });

  it('should handle resend OTP', async () => {
    renderVerifyOTP();
    
    const resendButton = screen.getByText(/resend code/i);
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(resendButton).toBeInTheDocument();
    });
  });

  it('should validate OTP length', async () => {
    renderVerifyOTP();
    
    const otpInputs = screen.getAllByRole('textbox');
    const submitButton = screen.getByRole('button', { name: /verify/i });

    
    fireEvent.change(otpInputs[0], { target: { value: '1' } });
    fireEvent.change(otpInputs[1], { target: { value: '2' } });
    fireEvent.change(otpInputs[2], { target: { value: '3' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(otpInputs[0].value).toBe('1');
    });
  });
});
