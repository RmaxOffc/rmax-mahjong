import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data)
};

export const walletAPI = {
  getBalance: () => api.get('/wallet'),
  deposit: (amount) => api.post('/wallet/deposit', { amount }),
  withdraw: (amount) => api.post('/wallet/withdraw', { amount }),
  getTransactions: () => api.get('/wallet/transactions')
};

export const gameAPI = {
  start: (betAmount) => api.post('/game/start', { betAmount }),
  end: (gameId, status, winAmount) => api.post(`/game/end/${gameId}`, { status, winAmount }),
  getHistory: () => api.get('/game/history')
};

export const adminAPI = {
  getPendingTransactions: () => api.get('/admin/transactions/pending'),
  approveTransaction: (id) => api.post(`/admin/transactions/${id}/approve`),
  rejectTransaction: (id) => api.post(`/admin/transactions/${id}/reject`),
  getUsers: () => api.get('/admin/users'),
  updateBalance: (userId, amount, note) => api.post(`/admin/users/${userId}/balance`, { amount, note })
};

export default api;
