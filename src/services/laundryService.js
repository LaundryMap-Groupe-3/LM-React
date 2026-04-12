import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const laundryService = {
  async getPendingLaudries(page = 1, limit = 10) {
    const response = await fetch(
      `${API_BASE_URL}/api/admin/laundry/prending?page=${page}&limit=${limit}`,
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
};

export default laundryService;