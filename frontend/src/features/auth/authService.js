import apiClient from '../../services/apiClient';

export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', {
      username: credentials.username,
      password: credentials.password
    });
    
    // Store the token in localStorage
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await apiClient.get('/auth/profile');
    return response;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};
