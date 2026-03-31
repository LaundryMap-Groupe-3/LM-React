
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const professionalService = {
  /**
   * Récupère les statistiques et la liste des laveries du professionnel
   */
  getLaundriesStats: async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/professional/laundries`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Gestion 401 : suppression du token et redirection
        if (response.status === 401) {
          localStorage.removeItem('jwt_token');
          window.location.href = '/login';
        }
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

  /**
   * Supprime une laverie par son ID
   */
  deleteLaundry: async (laundryId) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/professional/laundries/${laundryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('jwt_token');
          window.location.href = '/login';
        }
        throw {
          status: response.status,
          body: data,
        };
      }

      return true;
    } catch (error) {
      throw error;
    }
  },
};

export default professionalService;
