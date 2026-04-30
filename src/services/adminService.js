import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const adminService = {
    getProfile: async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          body: data,
        };
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
  async getPendingProfessionals(page = 1, limit = 10) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/professionals/pending?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (response.status === 403) {
      throw new Error('Unauthorized - Admin access required');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch pending professionals');
    }

    return await response.json();
  },

  async getPendingLaundriesCount() {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/laundries/pending/count`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (response.status === 403) {
      throw new Error('Unauthorized - Admin access required');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch pending laundries count');
    }

    return await response.json();
  },

  async getPendingLaundries(page = 1, limit = 10) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/laundries/pending?page=${page}&limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (response.status === 403) {
      throw new Error('Unauthorized - Admin access required');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch pending laundries');
    }

    return await response.json();
  },

  async getLaundryDetails(laundryId) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/laundries/${laundryId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (response.status === 403) {
      throw new Error('Unauthorized - Admin access required');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch professional details');
    }

    return await response.json();
  },
  
  async approveLaundry(laundryId) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/laundries/${laundryId}/approve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (response.status === 403) {
      throw new Error('Unauthorized - Admin access required');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to approve professional');
    }

    return await response.json();
  },

  async rejectLaundry(laundryId, reason) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/laundries/${laundryId}/reject`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (response.status === 403) {
      throw new Error('Unauthorized - Admin access required');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reject professional');
    }

    return await response.json();
  },

  async getProfessionalDetails(professionalId) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/professionals/${professionalId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (response.status === 403) {
      throw new Error('Unauthorized - Admin access required');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch professional details');
    }

    return await response.json();
  },

  async approveProfessional(professionalId) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/professionals/${professionalId}/approve`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (response.status === 403) {
      throw new Error('Unauthorized - Admin access required');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to approve professional');
    }

    return await response.json();
  },

  async rejectProfessional(professionalId, reason) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/professionals/${professionalId}/reject`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (response.status === 403) {
      throw new Error('Unauthorized - Admin access required');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reject professional');
    }

    return await response.json();
  },

  getOffensiveWords: async () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      throw { status: 401, body: { error: 'Token required' } };
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/offensive-words`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw { status: response.status, body: data };
    }

    return data;
  },

  createOffensiveWord: async (label) => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      throw { status: 401, body: { error: 'Token required' } };
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/offensive-words`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ label }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw { status: response.status, body: data };
    }

    return data;
  },

  deleteOffensiveWord: async (id) => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      throw { status: 401, body: { error: 'Token required' } };
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/offensive-words/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw { status: response.status, body: data };
    }

    return data;
  },

  async getTotalUsersCount() {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/count`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      return { count: 0 };
    }

    return await response.json();
  },

  async getTotalLaundriesCount() {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/laundries/count`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      return { count: 0 };
    }

    return await response.json();
  },

  async getTotalReportsCount() {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/reviews/reports/count`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      return { count: 0 };
    }

    return await response.json();
  },

  async getPendingProfessionalsCount() {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/professionals/pending/count`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      return { count: 0 };
    }

    return await response.json();
  },
};

export default adminService;
