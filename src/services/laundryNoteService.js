import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const laundryNoteService = {
    getMeComments: async (page = 1, limit = 10) => {
        const response = await fetch(
            `${API_BASE_URL}/api/me/comments?page=${page}&limit=${limit}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`,
                },
            }
        );

        if (response.status === 403) {
            throw new Error('Unauthorized -  authentication required');
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch user comments');
        }

        return await response.json();
    },
    getLaundryComments: async (laundryId, page = 1, limit = 10) => {
        const response = await fetch(
            `${API_BASE_URL}/api/laundry/${laundryId}/comments?page=${page}&limit=${limit}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`,
                },
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch laundry comments');
        }

        return await response.json();
    },
    addComment: async (laundryId, laundryNoteData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/laundry/${laundryId}/comment/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authService.getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(laundryNoteData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    body: data,
                };
            }

            return data;
        } catch (err) {
            throw err;
        }
    },
    removeComment: async (laundryId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/laundry/${laundryId}/comment/remove`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`,
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
        } catch (err) {
            throw err;
        }
    },
    updateComment: async (laundryId, laundryNoteData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/laundry/${laundryId}/comment/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authService.getToken()}`,
                },
                body: JSON.stringify(laundryNoteData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    body: data,
                };
            }

            return data;
        } catch (err) {
            throw err;
        }
    },
}

export default laundryNoteService;