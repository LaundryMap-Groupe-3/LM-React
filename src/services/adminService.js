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
  async getStats() {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/stats`,
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
      throw new Error(error.error || 'Failed to fetch admin stats');
    }

    return await response.json();
  },

  async getAllProfessionals(page = 1, limit = 10, search = '', status = '') {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set('search', search);
    if (status) params.set('status', status);

    const response = await fetch(
      `${API_BASE_URL}/api/admin/professionals?${params.toString()}`,
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
      throw new Error(error.error || 'Failed to fetch professionals');
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

    if (response.status === 403) {
      throw new Error('Unauthorized - Admin access required');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch pending professionals count');
    }

    const data = await response.json();
    return data;
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

  async getAllUsers(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set('search', search);

    const response = await fetch(
      `${API_BASE_URL}/api/admin/users?${params.toString()}`,
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
      throw new Error(error.error || 'Failed to fetch users');
    }

    return await response.json();
  },

  async getAllLaundries(page = 1, limit = 10, search = '', status = '') {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set('search', search);
    if (status) params.set('status', status);

    const response = await fetch(
      `${API_BASE_URL}/api/admin/laundries?${params.toString()}`,
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
      throw new Error(error.error || 'Failed to fetch laundries');
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

  async getHistory(page = 1, limit = 15, type = 'all') {
    const params = new URLSearchParams({ page, limit, type });
    const response = await fetch(
      `${API_BASE_URL}/api/admin/history?${params.toString()}`,
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
      throw new Error(error.error || 'Failed to fetch history');
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

  async getOffensiveWords(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set('search', search);

    const response = await fetch(
      `${API_BASE_URL}/api/admin/offensive-words?${params.toString()}`,
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
      throw new Error(error.error || 'Failed to fetch offensive words');
    }

    return await response.json();
  },

  async createOffensiveWord(label) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/offensive-words`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify({ label }),
      }
    );

    if (response.status === 403) {
      throw new Error('Unauthorized - Admin access required');
    }

    if (!response.ok) {
      const error = await response.json();
      const err = new Error(error.error || error.errors?.label || 'Failed to create offensive word');
      err.status = response.status;
      throw err;
    }

    return await response.json();
  },

  async updateOffensiveWord(id, payload) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/offensive-words/${id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.status === 403) {
      throw new Error('Unauthorized - Admin access required');
    }

    if (!response.ok) {
      const error = await response.json();
      const err = new Error(error.error || error.errors?.label || 'Failed to update offensive word');
      err.status = response.status;
      throw err;
    }

    return await response.json();
  },

  async deleteOffensiveWord(id) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/offensive-words/${id}`,
      {
        method: 'DELETE',
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
      throw new Error(error.error || 'Failed to delete offensive word');
    }

    return await response.json();
  },

  async getCommentReports(page = 1, limit = 10) {
    const params = new URLSearchParams({ page, limit });

    const response = await fetch(
      `${API_BASE_URL}/api/admin/comment-reports?${params.toString()}`,
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
      throw new Error(error.error || 'Failed to fetch comment reports');
    }

    return await response.json();
  },

  async getCommentReportDetails(laundryNoteId) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/comment-reports/${laundryNoteId}`,
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
      throw new Error(error.error || 'Failed to fetch comment report details');
    }

    return await response.json();
  },

  async dismissCommentReports(laundryNoteId) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/comment-reports/${laundryNoteId}/dismiss`,
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
      throw new Error(error.error || 'Failed to dismiss comment reports');
    }

    return await response.json();
  },

  async blockReportedComment(laundryNoteId, reason) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/comment-reports/${laundryNoteId}/block-comment`,
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
      throw new Error(error.error || 'Failed to block comment');
    }

    return await response.json();
  },

  async blockReportedCommentAuthor(laundryNoteId, reason) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/comment-reports/${laundryNoteId}/block-author`,
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
      throw new Error(error.error || 'Failed to block comment author');
    }

    return await response.json();
  },

  async toggleUserBlock(userId) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/users/${userId}/toggle-block`,
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
      throw new Error(error.error || 'Failed to update user status');
    }

    return await response.json();
  },
};

export default adminService;
