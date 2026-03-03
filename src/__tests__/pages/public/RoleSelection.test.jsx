import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RoleSelection from '../../../pages/public/RoleSelection';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('RoleSelection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRoleSelection = () => {
    return render(
      <BrowserRouter>
        <RoleSelection />
      </BrowserRouter>
    );
  };

  it('should render role selection page', () => {
    renderRoleSelection();
    expect(screen.getByText(/how would you like to continue/i)).toBeInTheDocument();
  });

  it('should display reporter role option', () => {
    renderRoleSelection();
    expect(screen.getByText(/i am a reporter/i)).toBeInTheDocument();
  });

  it('should display owner role option', () => {
    renderRoleSelection();
    expect(screen.getByText(/i am a rescue owner/i)).toBeInTheDocument();
  });

  it('should not display admin role option', () => {
    renderRoleSelection();
    const adminText = screen.queryByText(/^admin$/i);
    expect(adminText).toBeNull();
  });

  it('should navigate when reporter role is selected', () => {
    renderRoleSelection();
    
    const reporterButton = screen.getByRole('button', { name: /continue as reporter/i });
    fireEvent.click(reporterButton);

    expect(mockNavigate).toHaveBeenCalled();
  });

  it('should navigate when owner role is selected', () => {
    renderRoleSelection();
    
    const ownerButton = screen.getByRole('button', { name: /continue as rescue owner/i });
    fireEvent.click(ownerButton);

    expect(mockNavigate).toHaveBeenCalled();
  });

  it('should have role descriptions', () => {
    renderRoleSelection();
    
    const descriptions = screen.getAllByText(/report|rescue|animal|shelter/i);
    expect(descriptions.length).toBeGreaterThan(0);
  });

  it('should have back navigation', () => {
    renderRoleSelection();
    
    const backButton = screen.getByText(/back|return/i);
    expect(backButton).toBeInTheDocument();
  });
});
