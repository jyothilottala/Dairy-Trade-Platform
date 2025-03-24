import axios from 'axios';
import { AuthResponse, User, Product, Message } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth services
export const authService = {
    register: async (userData: Partial<User> & { password: string }): Promise<AuthResponse> => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};

// User services
export const userService = {
    getAllManufacturers: async (): Promise<User[]> => {
        const response = await api.get('/users/manufacturers');
        return response.data;
    },

    getAllImporters: async (): Promise<User[]> => {
        const response = await api.get('/users/importers');
        return response.data;
    },

    getUserProfile: async (id: string): Promise<User> => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    updateProfile: async (id: string, data: Partial<User>): Promise<User> => {
        const response = await api.put(`/users/${id}`, data);
        return response.data;
    },

    updatePassword: async (id: string, currentPassword: string, newPassword: string): Promise<void> => {
        await api.put(`/users/${id}/password`, { currentPassword, newPassword });
    },

    getProfile: async (userId: string): Promise<User> => {
        const response = await api.get(`/users/${userId}`);
        return response.data;
    },
};

// Product services
export const productService = {
    getAllProducts: async (): Promise<Product[]> => {
        const response = await api.get('/products');
        return response.data;
    },

    getProductById: async (productId: string): Promise<Product> => {
        const response = await api.get(`/products/${productId}`);
        return response.data;
    },

    getProductsByManufacturer: async (manufacturerId: string): Promise<Product[]> => {
        const response = await api.get(`/products/manufacturer/${manufacturerId}`);
        return response.data;
    },

    getProductsByCategory: async (category: string): Promise<Product[]> => {
        const response = await api.get(`/products/category/${category}`);
        return response.data;
    },

    createProduct: async (productData: Partial<Product>): Promise<Product> => {
        const response = await api.post('/products', productData);
        return response.data;
    },

    updateProduct: async (productId: string, productData: Partial<Product>): Promise<Product> => {
        const response = await api.put(`/products/${productId}`, productData);
        return response.data;
    },

    deleteProduct: async (productId: string): Promise<void> => {
        await api.delete(`/products/${productId}`);
    },
};

// Message services
export const messageService = {
    getAllMessages: async (): Promise<Message[]> => {
        const response = await api.get('/messages');
        return response.data;
    },

    getReceivedMessages: async (): Promise<Message[]> => {
        const response = await api.get('/messages/received');
        return response.data;
    },

    getSentMessages: async (): Promise<Message[]> => {
        const response = await api.get('/messages/sent');
        return response.data;
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await api.get('/messages/unread/count');
        return response.data.count;
    },

    sendMessage: async (messageData: Partial<Message>): Promise<Message> => {
        const response = await api.post('/messages', messageData);
        return response.data;
    },

    markAsRead: async (messageId: string): Promise<Message> => {
        const response = await api.put(`/messages/${messageId}/read`);
        return response.data;
    },

    deleteMessage: async (messageId: string): Promise<void> => {
        await api.delete(`/messages/${messageId}`);
    },
};

export const userApi = {
    // Get current user profile
    getProfile: async (): Promise<User> => {
        const response = await api.get('/users/profile');
        return response.data;
    },

    // Update user profile
    updateProfile: async (data: Partial<User>): Promise<User> => {
        const response = await api.put('/users/profile', data);
        return response.data;
    },

    // Update password
    updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
        await api.put('/users/password', { currentPassword, newPassword });
    },
};

export default api; 