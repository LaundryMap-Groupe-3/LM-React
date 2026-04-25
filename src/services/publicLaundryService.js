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
};

export default publicLaundryService;
