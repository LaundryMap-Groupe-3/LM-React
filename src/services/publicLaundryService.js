const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const publicLaundryService = {
  /**
   * Récupère le détail d'une laverie publique
   */
  getLaundry: async (laundryId) => {
    const normalizedId = typeof laundryId === 'string' ? laundryId.replace(/^:/, '') : String(laundryId ?? '');

    if (!/^\d+$/.test(normalizedId)) {
      throw {
        status: 400,
        body: { error: 'invalid_laundry_id' },
      };
    }

    const response = await fetch(`${API_BASE_URL}/api/laundries/${normalizedId}`);
    const data = await response.json();
    if (!response.ok) {
      throw {
        status: response.status,
        body: data,
      };
    }
    return data;
  },

  getFirstAvailableLaundryId: async () => {
    const response = await fetch(`${API_BASE_URL}/api/laundries/nearby?limit=1`);
    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        body: data,
      };
    }

    const firstLaundry = data?.laundries?.[0];

    if (!firstLaundry?.id) {
      throw {
        status: 404,
        body: { error: 'no_laundry_available' },
      };
    }

    return firstLaundry.id;
  },

  /**
   * Récupère les avis/commentaires publics d'une laverie
   */
  getLaundryReviews: async (laundryId, { limit = 20 } = {}) => {
    const normalizedId = typeof laundryId === 'string' ? laundryId.replace(/^:/, '') : String(laundryId ?? '');

    if (!/^\d+$/.test(normalizedId)) {
      throw {
        status: 400,
        body: { error: 'invalid_laundry_id' },
      };
    }

    const safeLimit = Math.max(1, Math.min(50, Number(limit) || 20));

    const response = await fetch(`${API_BASE_URL}/api/laundries/${normalizedId}/reviews?limit=${safeLimit}`);
    const data = await response.json();
    if (!response.ok) {
      throw {
        status: response.status,
        body: data,
      };
    }
    return data;
  },

  /**
   * Publie un avis (note + commentaire) sur une laverie (auth requise)
   */
  createLaundryReview: async (laundryId, { rating, comment } = {}) => {
    const normalizedId = typeof laundryId === 'string' ? laundryId.replace(/^:/, '') : String(laundryId ?? '');

    if (!/^\d+$/.test(normalizedId)) {
      throw {
        status: 400,
        body: { error: 'invalid_laundry_id' },
      };
    }

    const token = localStorage.getItem('jwt_token') || localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/api/laundries/${normalizedId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ rating, comment }),
    });

    let data;
    try {
      data = await response.json();
    } catch (_e) {
      data = null;
    }

    if (!response.ok) {
      throw {
        status: response.status,
        body: data,
      };
    }

    return data;
  },
};

export default publicLaundryService;
