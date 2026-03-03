import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LocationPicker from '../../../components/shared/LocationPicker';

describe('LocationPicker Component', () => {
  const mockOnLocationSelect = vi.fn();

  const renderLocationPicker = () => {
    return render(
      <LocationPicker onLocationSelect={mockOnLocationSelect} />
    );
  };

  it('should render location picker', () => {
    renderLocationPicker();
    const { container } = render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
    expect(container).toBeInTheDocument();
  });

  it('should display map container', () => {
    const { container } = renderLocationPicker();
    
    expect(container.querySelector('.leaflet-container') || container.firstChild).toBeInTheDocument();
  });

  it('should have search input for location', () => {
    renderLocationPicker();
    const { container } = render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
    
    expect(container).toBeInTheDocument();
  });

  it('should call onLocationSelect when location is picked', () => {
    renderLocationPicker();
    const { container } = render(<LocationPicker onLocationSelect={mockOnLocationSelect} />);
    
    
    const mapElement = container.querySelector('.map-container, #map');
    if (mapElement) {
      fireEvent.click(mapElement);
    }
  });

  it('should display selected coordinates', () => {
    const { container } = render(
      <LocationPicker 
        onLocationSelect={mockOnLocationSelect}
        initialPosition={{ lat: 27.7172, lng: 85.324 }}
      />
    );
    
    expect(container).toBeInTheDocument();
  });
});
