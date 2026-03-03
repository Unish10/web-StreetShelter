

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';


const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.token || '';
};


export const apiRequest = async (endpoint, options = {}) => {
  const defaultHeaders = {
    'Authorization': `Bearer ${getAuthToken()}`,
  };

  
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const defaultOptions = {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    
    if (!response.ok) {
      
      let errorMessage = `API Error: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};


export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  logout: () => apiRequest('/auth/logout', {
    method: 'POST',
  }),
};


export const dogReportsAPI = {
  getAll: () => apiRequest('/dog-reports'),
  
  getById: (id) => apiRequest(`/dog-reports/${id}`),
  
  create: (formData) => apiRequest('/dog-reports', {
    method: 'POST',
    body: formData, 
  }),
  
  update: (id, data) => {
    
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiRequest(`/dog-reports/${id}`, {
      method: 'PUT',
      body: body,
    });
  },
  
  delete: (id) => apiRequest(`/dog-reports/${id}`, {
    method: 'DELETE',
  }),
};


export const ownerAPI = {
  register: (ownerData) => apiRequest('/owners/register', {
    method: 'POST',
    body: JSON.stringify(ownerData),
  }),
  
  getProfile: () => apiRequest('/owners/profile'),
  
  updateProfile: (profileData) => apiRequest('/owners/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
};


export const adminAPI = {
  getUsers: () => apiRequest('/admin/users'),
  
  getOwners: () => apiRequest('/admin/owners'),
  
  getPendingOwners: () => apiRequest('/admin/owners/pending'),
  
  verifyOwner: (ownerId) => apiRequest(`/admin/owners/${ownerId}/verify`, {
    method: 'PUT',
  }),
  
  rejectOwner: (ownerId) => apiRequest(`/admin/owners/${ownerId}/reject`, {
    method: 'PUT',
  }),
  
  deleteUser: (userId) => apiRequest(`/admin/users/${userId}`, {
    method: 'DELETE',
  }),
  
  getStats: () => apiRequest('/admin/stats'),
};


export const notificationAPI = {
  getAll: () => apiRequest('/notifications'),
  
  getUnreadCount: () => apiRequest('/notifications/unread'),
  
  markAsRead: (notificationId) => apiRequest(`/notifications/${notificationId}/read`, {
    method: 'PUT',
  }),
  
  markAllAsRead: () => apiRequest('/notifications/read-all', {
    method: 'PUT',
  }),
  
  delete: (notificationId) => apiRequest(`/notifications/${notificationId}`, {
    method: 'DELETE',
  }),
};

export const passwordResetAPI = {
  requestOTP: (email) => apiRequest('/password-reset/request-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  
  verifyOTP: (email, otp) => apiRequest('/password-reset/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  }),
  
  resetPassword: (email, resetToken, newPassword) => apiRequest('/password-reset/reset-password', {
    method: 'POST',
    body: JSON.stringify({ email, resetToken, newPassword }),
  }),
};

export default {
  apiRequest,
  authAPI,
  dogReportsAPI,
  ownerAPI,
  adminAPI,
  notificationAPI,
  passwordResetAPI,
};
