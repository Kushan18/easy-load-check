/* Real API Wrapper connecting to FastAPI */
const API = {
    baseUrl: '/api', // Relative path since served by same backend

    async login(email, password) {
        // Mock auth for now (Backend auth route not fully implemented for users, just officers)
        if (email && password) return { token: "mock_transporter_token", role: "transporter" };
        throw new Error("Invalid credentials");
    },

    async createTrip(tripData) {
        try {
            const response = await fetch(`${this.baseUrl}/trip/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tripData)
            });

            if (!response.ok) throw new Error('Failed to create trip');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    async getTrip(id) {
        try {
            const response = await fetch(`${this.baseUrl}/trip/${id}`);
            if (!response.ok) throw new Error('Trip not found');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    async verifyOfficer(userId, pin) {
        try {
            const response = await fetch(`${this.baseUrl}/officer/verify-access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin: pin })
            });
            if (!response.ok) throw new Error('Invalid PIN');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    async authorizeTrip(tripId, officerState, pin) {
        try {
            const response = await fetch(`${this.baseUrl}/officer/authorize-trip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trip_id: tripId, state: officerState, pin: pin })
            });
            if (!response.ok) throw new Error('Authorization failed');
            return await response.json();
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    }
};
