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
  async getNearbyLaundries({ latitude, longitude, radius = 20, limit = 50, query = '', city = '' } = {}) {
    const queryString = toQueryString({
      lat: latitude,
      lng: longitude,
      radius,
      limit,
      query,
      city: city && city !== 'all' ? city : '',
    })

    try {
      const response = await fetch(`${API_BASE_URL}/api/laundries/nearby?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const text = await response.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        throw new Error('Réponse non JSON du serveur')
      }
      if (!response.ok) {
        throw {
          status: response.status,
          body: data,
        }
      }
      return data
    } catch (err) {
      throw err
    }
  },

  async addFavorite(laundryId) {
    try {
      // Unifie la récupération du token (jwt_token ou token)
      const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/laundries/${laundryId}/favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = text;
        }
        throw { status: response.status, body: data };
      }
      return true;
    } catch (err) {
      throw err;
    }
  },

  async removeFavorite(laundryId) {
    try {
      // Unifie la récupération du token (jwt_token ou token)
      const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/laundries/${laundryId}/favorite`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) {
        const text = await response.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = text;
        }
        throw { status: response.status, body: data };
      }
      return true;
    } catch (err) {
      throw err;
    }
  },
}

export default laundryService;
