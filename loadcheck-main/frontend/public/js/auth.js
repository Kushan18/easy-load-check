const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000'
    : ''; // Empty string for relative path on production (since frontend served by backend)

const auth = {
    // Register
    async register(data) {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || 'Registration failed');
        }

        // Auto login / save user
        this.setUser(result);
        window.location.href = 'dashboard.html';
        return result;
    },

    // Login
    async login(email, password) {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.detail || 'Login failed');
        }

        this.setUser(result);
        window.location.href = 'dashboard.html';
        return result;
    },

    // Logout
    logout() {
        localStorage.removeItem('user_data');
        window.location.href = 'index.html';
    },

    // Get current user
    getUser() {
        const data = localStorage.getItem('user_data');
        return data ? JSON.parse(data) : null;
    },

    // Set user data
    setUser(data) {
        localStorage.setItem('user_data', JSON.stringify(data));
    },

    // Check auth guard (redirect if not logged in)
    requireAuth() {
        const user = this.getUser();
        if (!user) {
            window.location.href = 'login.html';
        }
        return user;
    }
};
