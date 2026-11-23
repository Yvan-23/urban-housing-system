import api from './api';

export const authService = {
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data.data; // { user, token, refreshToken }
    } catch (error) {
      const message = typeof error.response?.data === 'string' 
        ? error.response.data 
        : error.response?.data?.message || 'Invalid email or password';
      throw new Error(message);
    }
  },

  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      const message = typeof error.response?.data === 'string' 
        ? error.response.data 
        : error.response?.data?.message || 'Registration failed';
      throw new Error(message);
    }
  },

  async verifyMFA(code) {
    try {
      const response = await api.post('/auth/mfa', { code });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid verification code');
    }
  },

  async requestPasswordReset(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data; // includes devOtp in dev mode
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Request failed. Please try again.');
    }
  },

  async resetPassword(email, otp, newPassword) {
    try {
      const response = await api.post('/auth/reset-password', { email, otp, password: newPassword });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Reset failed. The code may have expired.');
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed on server', error);
    }
  }
};
