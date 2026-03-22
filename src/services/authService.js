const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const authService = {
  handleGoogleSuccess: async (accessToken) => {
    try{
      const response = await fetch(`${API_BASE_URL}/api/auth-google`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({token: accessToken})
      });

      const data = await response.json();

      if (!response.ok) {
        throw { status: response.status, body: data };
      }

      if (data.token) {
        localStorage.setItem('jwt_token', data.token);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.name, // Map 'name' from form to 'lastName' in API
        }),
      });

      const data = await response.json();

      if (!response.ok) {
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

  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          body: data,
        };
      }

      // Extract JWT token from the response
      if (data.token) {
        localStorage.setItem('jwt_token', data.token);
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('jwt_token');
  },

  getToken: () => {
    return localStorage.getItem('jwt_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('jwt_token');
  },

  registerProfessional: async (professionalData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/register/professional`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: professionalData.email,
          password: professionalData.password,
          firstName: professionalData.firstName,
          lastName: professionalData.name,
          phone: professionalData.phone,
          companyName: professionalData.companyName,
          siret: professionalData.siret,
          street: professionalData.street,
          postalCode: professionalData.postalCode,
          city: professionalData.city,
          country: professionalData.country,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
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

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/api/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('jwt_token');
        }
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },

  // Helper method to make authenticated API requests
  fetchWithAuth: async (endpoint, options = {}) => {
    const token = localStorage.getItem('jwt_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('jwt_token');
      // Optionally redirect to login
    }

    return response;
  },
};

export default authService;
