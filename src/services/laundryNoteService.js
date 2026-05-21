import authService from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const laundryNoteService = {
    getLaundryComments: async (laundryId, page = 1, limit = 10) => {
        const response = await fetch(
            `${API_BASE_URL}/api/laundry/${laundryId}/comments?page=${page}&limit=${limit}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch laundry comments');
        }

        return await response.json();
    },
}

export default laundryNoteService;