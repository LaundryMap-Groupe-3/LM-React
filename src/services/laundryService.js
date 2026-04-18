
import authService from './authService';

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

    console.log('[laundryService] URL:', `${API_BASE_URL}/api/laundries/nearby?${queryString}`)
    try {
      const response = await fetch(`${API_BASE_URL}/api/laundries/nearby?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log('[laundryService] Status:', response.status)
      const text = await response.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        console.error('[laundryService] JSON parse error:', e, text)
        throw new Error('Réponse non JSON du serveur')
      }
      console.log('[laundryService] Data:', data)
      if (!response.ok) {
        console.error('[laundryService] Erreur HTTP:', response.status, data)
        throw {
          status: response.status,
          body: data,
        }
      }
      return data
    } catch (err) {
      console.error('[laundryService] Exception attrapée:', err)
      throw err
    }
  },
}

export default laundryService

