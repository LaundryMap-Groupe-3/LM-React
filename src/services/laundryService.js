const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const toQueryString = (params) => {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  return searchParams.toString()
}

const laundryService = {
  async getNearbyLaundries({ latitude, longitude, radius = 20, limit = 50, query = '', city = '' } = {}) {
    try {
      const params = new URLSearchParams();
      if (latitude !== undefined && latitude !== null) params.set('lat', latitude);
      if (longitude !== undefined && longitude !== null) params.set('lng', longitude);
      if (radius) params.set('radius', radius);
      if (limit) params.set('limit', limit);
      if (query) params.set('query', query);
      if (city) params.set('city', city);

      const response = await fetch(`${API_BASE_URL}/api/laundries/nearby?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error('Réponse non JSON du serveur');
      }
      if (!response.ok) {
        throw {
          status: response.status,
          body: data,
        };
      }
      return data;
    } catch (err) {
      throw err;
    }
  },

  async addFavorite(laundryId) {
    try {
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

export default laundryService
