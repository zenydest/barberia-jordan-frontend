import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

import API_URL from '../config.js';

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verificar token al cargar
  useEffect(() => {
    if (token) {
      verificarToken();
    }
  }, [token]);

  const verificarToken = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuario(res.data);
    } catch (err) {
      console.error('Token inválido');
      logout();
    }
  };

  const registro = async (email, password, nombre) => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.post(`${API_URL}/auth/registro`, {
        email,
        password,
        nombre,
        rol: 'barbero'
      });
      
      setToken(res.data.token);
      setUsuario(res.data.usuario);
      localStorage.setItem('token', res.data.token);
      
      return res.data;
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error en el registro';
      setError(mensaje);
      throw new Error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      setToken(res.data.token);
      setUsuario(res.data.usuario);
      localStorage.setItem('token', res.data.token);
      
      return res.data;
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error en el login';
      setError(mensaje);
      throw new Error(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUsuario(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  // Configurar interceptor para todas las peticiones
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      loading,
      error,
      login,
      registro,
      logout,
      isAutenticado: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}
