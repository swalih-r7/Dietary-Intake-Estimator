// src/services/api.js
const API_BASE_URL = 'http://localhost:8000/api';

const getToken = () => localStorage.getItem('access_token');

const handleResponse = async (response) => {
  if (response.status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    window.location.href = '/login';
    throw new Error('Session expired');
  }
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.detail || 'Request failed');
  }
  return data;
};

export const api = {
  // Auth endpoints
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await handleResponse(response);
    if (data.access) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      if (data.role) {
        localStorage.setItem('user_role', data.role);
      }
    }
    return data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const token = getToken();
    
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ refresh: refreshToken })
        });
      } catch (e) {
        // Ignore logout errors
      }
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
  },

  // Food endpoints
  getFoods: async () => {
    const response = await fetch(`${API_BASE_URL}/foods/`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  predictFood: async (imageFile, portionG = 100) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('portion_g', portionG);
    
    const response = await fetch(`${API_BASE_URL}/predict/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData
    });
    return handleResponse(response);
  },

  getHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/history/`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/profile/`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/profile/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);
  },

  // Patient management (for nutritionists)
  getMyPatients: async () => {
    const response = await fetch(`${API_BASE_URL}/patients/my-patients/`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  getPatientHistory: async (patientId) => {
    const response = await fetch(`${API_BASE_URL}/patients/history/${patientId}/`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  },

  deleteAnalysis: async (analysisId) => {
    const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}/delete/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return handleResponse(response);
  }
};

// Helper functions
export const getUserRole = () => {
  return localStorage.getItem('user_role') || 'patient';
};

export const isAuthenticated = () => {
  return !!getToken();
};