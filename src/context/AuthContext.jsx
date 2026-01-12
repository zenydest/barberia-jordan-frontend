import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config.js';

export const AuthContext = createContext();

// Crear instancia de axios con interceptor
const axiosInstance = axios.create({
  baseURL: API_URL
});

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(true);

  // Configurar el token en axios cuando cambia
  useEffect(() => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ Token configurado en axios');
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
      delete axios.defaults.headers.common['Authorization'];
      console.log('❌ Token removido de axios');
    }
  }, [token]);

  // Verificar token al cargar
  useEffect(() => {
    const verificarAlCargar = async () => {
      if (token) {
        try {
          const res = await axiosInstance.get('/auth/me');
          setUsuario(res.data);
        } catch (err) {
          console.error('Token inválido al verificar');
          // NO hacer logout aquí, solo limpiar
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsVerifying(false);
    };

    verificarAlCargar();
  }, []); // ← Solo ejecutar al montar

  const verificarToken = async () => {
    try {
      const res = await axiosInstance.get('/auth/me');
      setUsuario(res.data);
      return true;
    } catch (err) {
      console.error('Token inválido');
      return false;
    }
  };

  const registro = async (email, password, nombre) => {
    try {
      setLoading(true);
      setError('');
      const res = await axiosInstance.post('/auth/registro', {
        email,
        password,
        nombre,
        rol: 'barbero'
      });
      
      const newToken = res.data.token;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUsuario(res.data.usuario);
      
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
      const res = await axiosInstance.post('/auth/login', {
        email,
        password
      });
      
      const newToken = res.data.token;
      localStorage.setItem('token', newToken); // ← PRIMERO guardar
      setToken(newToken); // ← DESPUÉS setear
      setUsuario(res.data.usuario);
      
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

  // Interceptor MEJORADO - solo logout si NO es login/registro
  useEffect(() => {
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // NO hacer logout si estamos en /auth/login o /auth/registro
        if (error.response?.status === 401) {
          const config = error.config;
          if (!config.url?.includes('/auth/login') && !config.url?.includes('/auth/registro')) {
            console.warn('⚠️ 401 Unauthorized - Logout');
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Mostrar loading mientras se verifica
  if (isVerifying && token) {
    return <div>Verificando sesión...</div>;
  }

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      loading,
      error,
      login,
      registro,
      logout,
      isAutenticado: !!token,
      axios: axiosInstance
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export default axiosInstance;
