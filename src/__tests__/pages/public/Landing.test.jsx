import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Landing from '../../../pages/public/Landing';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Landing Component', () => {
  const renderLanding = () => {
    return render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );
  };

  it('should render landing page', async () => {
    renderLanding();
    await waitFor(() => {
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    }, { timeout: 10000 });
  }, 10000);

  it('should have a get started or login button', () => {
    renderLanding();
    const button = screen.queryAllByText(/report emergency|sign in/i)[0];
    expect(button).toBeInTheDocument();
  });

  it('should display project description or tagline', () => {
    renderLanding();
    const elements = screen.queryAllByText(/dog|rescue|shelter|help/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it('should have navigation links', () => {
    renderLanding();
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should render footer information', () => {
    renderLanding();
    const footer = screen.getByText(/©|copyright|2024|2025|2026/i) || screen.getByText(/streetshelter/i);
    expect(footer).toBeInTheDocument();
  });
});
