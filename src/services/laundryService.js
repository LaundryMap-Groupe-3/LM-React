import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function toQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return;
      }
      searchParams.set(key, value.join(','));
      return;
    }

    searchParams.set(key, String(value));
  });

  return searchParams.toString();
}

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
  async getNearbyLaundries({
    latitude,
    longitude,
    radius = 20,
    limit = 50,
    query = '',
    city = '',
    services = [],
    payments = [],
    openAt = '',
    closeAt = '',
  } = {}) {
    const queryString = toQueryString({
      lat: latitude,
      lng: longitude,
      radius,
      limit,
      query,
      city: city && city !== 'all' ? city : '',
      services,
      payments,
      openAt,
      closeAt,
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

  addFavorite: async (laundryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/laundries/${laundryId}/favorite/add`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
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
    } catch (err) {
      throw err;
    }
  },

  removeFavorite: async (laundryId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/laundries/${laundryId}/favorite/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
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
    } catch (err) {
      throw err;
    }
  },

  getFavoritesIds: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/laundries/favorite/ids`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`,
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
    } catch (err) {
      throw err;
    }
  },

  getFavorites: async (page, limit) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/user/favorites?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authService.getToken()}`,
          },
        }
      );

      if (response.status === 403) {
        throw new Error('Unauthorized - authentication required');
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch favorites laundries');
      }

      return await response.json();

    } catch (err) {
      throw err;
    }
  }
}

export default laundryService;
