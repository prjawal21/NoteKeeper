// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Configure axios base URL - using proxy from package.json
axios.defaults.baseURL = '';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Try to get user info from token
      const userInfo = JSON.parse(localStorage.getItem('user'));
      if (userInfo) {
        setUser(userInfo);
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { token: authToken, email: userEmail, userId } = response.data;
      
      setToken(authToken);
      setUser({ email: userEmail, id: userId });
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify({ email: userEmail, id: userId }));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response?.status === 400) {
        return { 
          success: false, 
          error: error.response?.data?.message || 'Invalid credentials' 
        };
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        return { 
          success: false, 
          error: 'Cannot connect to server. Please check if the backend is running.' 
        };
      } else {
        return { 
          success: false, 
          error: error.response?.data?.message || 'Login failed. Please try again.' 
        };
      }
    }
  };

  const register = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { email, password });
      const { token: authToken, email: userEmail, userId } = response.data;
      
      setToken(authToken);
      setUser({ email: userEmail, id: userId });
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify({ email: userEmail, id: userId }));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle different types of errors
      if (error.response?.status === 400) {
        return { 
          success: false, 
          error: error.response?.data?.message || 'Invalid registration data' 
        };
      } else if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        return { 
          success: false, 
          error: 'Cannot connect to server. Please check if the backend is running.' 
        };
      } else {
        return { 
          success: false, 
          error: error.response?.data?.message || 'Registration failed. Please try again.' 
        };
      }
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!token 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ custom hook so you can use `useAuth()` anywhere
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
