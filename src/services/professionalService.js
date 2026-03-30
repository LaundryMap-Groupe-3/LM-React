const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';


const professionalService = {
  async getLaundriesStats() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      window.location.href = '/login';
      throw new Error('Utilisateur non authentifié');
    }
    const response = await fetch(`${API_BASE_URL}/api/professional/laundries`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
      throw new Error('Session expirée, veuillez vous reconnecter');
    }
    if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
    return await response.json();
  },

  async deleteLaundry(laundryId) {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      window.location.href = '/login';
      throw new Error('Utilisateur non authentifié');
    }
    const response = await fetch(`${API_BASE_URL}/api/professional/laundries/${laundryId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.status === 401) {
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
      throw new Error('Session expirée, veuillez vous reconnecter');
    }
    if (!response.ok) throw new Error('Erreur lors de la suppression de la laverie');
    return true;
  }
};

export default professionalService;
