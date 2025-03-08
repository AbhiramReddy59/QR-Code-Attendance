import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Important for sending cookies
    timeout: 10000 // Add timeout to prevent hanging requests
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

// Add response interceptor for error handling
api.interceptors.response.use(
    response => response.data,
    error => {
        // Handle authentication errors
        if (error.response?.status === 401) {
            // Clear any stored auth state
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            // Redirect to login if not already there
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        
        // Log the error for debugging
        if (error.response) {
            console.error('API Error Response:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        } else if (error.request) {
            // The request was made but no response was received
            console.error('API Error Request:', error.request);
        } else {
            // Something happened in setting up the request
            console.error('API Error Setup:', error.message);
        }
        
        return Promise.reject(error.response?.data || error);
    }
);

// Auth API calls
export const login = async (email, password) => {
    try {
        console.log('API login attempt with:', { email });
        const response = await api.post('/auth/login', { email, password });
        console.log('API login response:', response);
        
        if (response.success) {
            localStorage.setItem('user', JSON.stringify(response.data));
            localStorage.setItem('token', response.token);
        }
        return response;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        const response = await api.post('/auth/logout');
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return response;
    } catch (error) {
        console.error('Logout error:', error);
        // Still remove user from storage even if API call fails
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        throw error;
    }
};

// Profile API calls
export const getProfile = async () => {
    try {
        console.log('Fetching profile from:', `${API_URL}/profile`);
        return await api.get('/profile');
    } catch (error) {
        console.error('Get profile error:', error);
        if (error.message === 'Network Error') {
            console.error('Network error detected. Server might be down or unreachable.');
            return {
                success: false,
                message: 'Unable to connect to server. Please check your internet connection or try again later.'
            };
        }
        throw error;
    }
};

export const updateProfile = async (data) => {
    try {
        console.log('Updating profile with data:', data);
        return await api.put('/profile', data);
    } catch (error) {
        console.error('Update profile error:', error);
        if (error.message === 'Network Error') {
            console.error('Network error detected. Server might be down or unreachable.');
            return {
                success: false,
                message: 'Unable to connect to server. Please check your internet connection or try again later.'
            };
        }
        throw error;
    }
};

// Attendance API calls
export const markAttendance = async (qrData) => {
    try {
        console.log('Marking attendance with QR data:', JSON.stringify(qrData, null, 2));
        
        // Ensure we're sending a valid object
        const payload = { qrData };
        
        // Add current user ID if not present in the QR data
        if (!payload.qrData.userId) {
            try {
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                if (currentUser.id) {
                    console.log('Adding current user ID to QR data:', currentUser.id);
                    payload.qrData.userId = currentUser.id;
                }
            } catch (e) {
                console.error('Error getting current user:', e);
            }
        }
        
        console.log('Sending payload to server:', JSON.stringify(payload, null, 2));
        
        try {
            const response = await api.post('/attendance/mark', payload);
            console.log('Attendance response:', response);
            return response;
        } catch (apiError) {
            console.error('API call error:', apiError);
            if (apiError.response) {
                console.error('Response data:', apiError.response.data);
            }
            throw apiError;
        }
    } catch (error) {
        console.error('Mark attendance error:', error);
        if (error.error) {
            console.error('Server error details:', error.error);
        }
        return {
            success: false,
            message: error.message || 'Failed to mark attendance. Please try again.'
        };
    }
};

export const getPersonalAttendance = async () => {
    try {
        console.log('Fetching personal attendance records');
        return await api.get('/attendance/personal');
    } catch (error) {
        console.error('Get attendance error:', error);
        if (error.message === 'Network Error') {
            console.error('Network error detected. Server might be down or unreachable.');
            return {
                success: false,
                message: 'Unable to connect to server. Please check your internet connection or try again later.'
            };
        }
        throw error;
    }
};

export default api;
