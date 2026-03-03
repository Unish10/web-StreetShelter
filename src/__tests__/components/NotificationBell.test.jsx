import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationBell from '../../components/shared/NotificationBell';
import { notificationAPI } from '../../utils/api';


vi.mock('../../utils/api', () => ({
  notificationAPI: {
    getAll: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('NotificationBell Component', () => {
  const mockNotifications = [
    {
      id: '1',
      type: 'report_submitted',
      title: 'New Report',
      message: 'New dog report submitted',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'owner_registered',
      title: 'New Owner',
      message: 'New owner registered',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      type: 'rescue_started',
      title: 'Rescue Started',
      message: 'Rescue operation started',
      isRead: true,
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    notificationAPI.getAll.mockResolvedValue(mockNotifications);
    notificationAPI.getUnreadCount.mockResolvedValue({ count: 2 });
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should render notification bell icon', async () => {
    const { container } = render(<NotificationBell />);
    
    await waitFor(() => {
      const bellIcon = container.querySelector('.notification-bell-btn');
      expect(bellIcon).toBeInTheDocument();
    });
  });

  it('should display unread count badge', async () => {
    render(<NotificationBell />);
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('should load notifications when bell icon is clicked', async () => {
    const { container } = render(<NotificationBell />);
    
    const bellIcon = container.querySelector('.notification-bell-btn');
    fireEvent.click(bellIcon);

    await waitFor(() => {
      expect(notificationAPI.getAll).toHaveBeenCalled();
      expect(screen.getByText('New dog report submitted')).toBeInTheDocument();
      expect(screen.getByText('New owner registered')).toBeInTheDocument();
    });
  });

  it('should toggle dropdown visibility on bell click', async () => {
    const { container } = render(<NotificationBell />);
    
    const bellIcon = container.querySelector('.notification-bell-btn');
    
    
    fireEvent.click(bellIcon);
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    
    fireEvent.click(bellIcon);
    await waitFor(() => {
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  it('should mark notification as read when clicked', async () => {
    notificationAPI.markAsRead.mockResolvedValue({});
    
    const { container } = render(<NotificationBell />);
    
    const bellIcon = container.querySelector('.notification-bell-btn');
    fireEvent.click(bellIcon);

    await waitFor(() => {
      expect(screen.getByText('New dog report submitted')).toBeInTheDocument();
    });

    const notification = screen.getByText('New dog report submitted');
    fireEvent.click(notification);

    await waitFor(() => {
      expect(notificationAPI.markAsRead).toHaveBeenCalledWith('1');
    });
  });

  it('should mark all notifications as read', async () => {
    notificationAPI.markAllAsRead.mockResolvedValue({});
    
    const { container } = render(<NotificationBell />);
    
    const bellIcon = container.querySelector('.notification-bell-btn');
    fireEvent.click(bellIcon);

    await waitFor(() => {
      const markAllButton = screen.getByText(/mark all read/i);
      expect(markAllButton).toBeInTheDocument();
      fireEvent.click(markAllButton);
    });

    await waitFor(() => {
      expect(notificationAPI.markAllAsRead).toHaveBeenCalled();
    });
  });

  it('should delete notification', async () => {
    notificationAPI.delete.mockResolvedValue({});
    
    const { container } = render(<NotificationBell />);
    
    const bellIcon = container.querySelector('.notification-bell-btn');
    fireEvent.click(bellIcon);

    await waitFor(() => {
      const deleteButtons = container.querySelectorAll('.notification-delete-btn');
      fireEvent.click(deleteButtons[0]);
    });

    await waitFor(() => {
      expect(notificationAPI.delete).toHaveBeenCalledWith('1');
    });
  });

  it('should display empty state when no notifications', async () => {
    notificationAPI.getAll.mockResolvedValue([]);
    
    const { container } = render(<NotificationBell />);
    
    const bellIcon = container.querySelector('.notification-bell-btn');
    fireEvent.click(bellIcon);

    await waitFor(() => {
      expect(screen.getByText(/no notifications/i)).toBeInTheDocument();
    });
  });

  it('should display loading state while fetching notifications', async () => {
    notificationAPI.getAll.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([]), 100)));
    
    const { container } = render(<NotificationBell />);
    
    const bellIcon = container.querySelector('.notification-bell-btn');
    fireEvent.click(bellIcon);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
  });

  it('should close dropdown when clicking outside', async () => {
    const { container } = render(
      <div>
        <NotificationBell />
        <div data-testid="outside">Outside</div>
      </div>
    );
    
    const bellIcon = container.querySelector('.notification-bell-btn');
    fireEvent.click(bellIcon);

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);

    await waitFor(() => {
      expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
    });
  });

  it.skip('should poll for new notifications every 30 seconds', async () => {
    
    
  });

  it.skip('should handle API errors gracefully', async () => {
    
    
  });
});
