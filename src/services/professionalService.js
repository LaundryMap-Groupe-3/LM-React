
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const professionalService = {
  /**
   * Récupère les services et méthodes de paiement disponibles
   */
  getLaundryOptions: async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/professional/laundry-options`, {
        method: 'GET',
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

      return data;
    } catch (error) {
      throw error;
    }
  },

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
   * Récupère le détail d'une laverie
   */
  getLaundry: async (laundryId) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/professional/laundries/${laundryId}`, {
        method: 'GET',
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

      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupère les avis d'une laverie du professionnel
   */
  getLaundryReviews: async (laundryId) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/professional/laundries/${laundryId}/reviews`, {
        method: 'GET',
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

      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Publie ou met à jour la réponse du professionnel à un avis
   */
  updateLaundryReviewResponse: async (laundryId, reviewId, responseText) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/professional/laundries/${laundryId}/reviews/${reviewId}/response`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ response: responseText }),
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

      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Récupère les machines WI-LINE à partir d'un code client
   */
  fetchWiLineClientMachines: async (clientCode) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/professional/wiline/clients/${clientCode}/machines`, {
        method: 'GET',
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

      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crée une nouvelle laverie
   */
  createLaundry: async (laundryData) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/professional/laundries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(laundryData),
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

      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Met à jour une laverie existante
   */
  updateLaundry: async (laundryId, laundryData) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/professional/laundries/${laundryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(laundryData),
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

      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload le logo d'une laverie
   */
  uploadLaundryLogo: async (laundryId, logoFile) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await fetch(`${API_BASE_URL}/api/professional/laundries/${laundryId}/logo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
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

      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Upload des photos de galerie d'une laverie
   */
  uploadLaundryMedias: async (laundryId, mediaFiles) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const formData = new FormData();
      mediaFiles.forEach((file) => {
        formData.append('medias[]', file);
      });

      const response = await fetch(`${API_BASE_URL}/api/professional/laundries/${laundryId}/medias`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
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

      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Supprime une photo de galerie d'une laverie
   */
  deleteLaundryMedia: async (laundryId, mediaId) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/professional/laundries/${laundryId}/medias/${mediaId}`, {
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
