import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const userService = {
  /**
   * Get user profile information
   */
  getProfile: async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
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
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user profile (firstName, lastName)
   */
  updateProfile: async (profileData) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
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

  /**
   * Change user password
   */
  changePassword: async (passwordData) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/user/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
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

  /**
   * Delete user account
   */
  deleteAccount: async (password) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/user/account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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

      // Clear local storage on successful deletion
      localStorage.removeItem('jwt_token');

      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user preferences (language, theme notifications handled in app state)
   */
  updatePreferences: async (preferences) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/user/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
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

  /**
   * Get user preferences
   */
  getPreferences: async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/user/preferences`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
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
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update user preferences (language, theme, notifications)
   */
  updatePreferences: async (preferences) => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        throw { status: 401, body: { message: 'Token required' } };
      }

      const response = await fetch(`${API_BASE_URL}/api/user/preferences`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
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

  /**
   * Get list of available languages
   */
  getLanguages: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/languages`, {
        method: 'GET',
        headers: {
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

      return data?.languages || [];
    } catch (error) {
      throw error;
    }
  },
};

export default userService;
