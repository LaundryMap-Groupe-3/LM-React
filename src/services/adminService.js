import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const adminService = {
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
};

export default adminService;
