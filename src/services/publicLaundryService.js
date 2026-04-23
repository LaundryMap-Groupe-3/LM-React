const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const publicLaundryService = {
  /**
   * Récupère le détail d'une laverie publique
   */
  getLaundry: async (laundryId) => {
    const response = await fetch(`${API_BASE_URL}/api/laundries/${laundryId}`);
    const data = await response.json();
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
