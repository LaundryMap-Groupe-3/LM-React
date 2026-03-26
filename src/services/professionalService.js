const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const professionalService = {
  async getLaundriesStats() {
    const token = localStorage.getItem('jwt_token');
    const response = await fetch(`${API_BASE_URL}/api/professional/laundries`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
    return await response.json();
  }
};

export default professionalService;
