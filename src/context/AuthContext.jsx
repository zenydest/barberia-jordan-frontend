import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

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
    if (token) {
      verificarToken();
    }
  }, [token]);

  const verificarToken = async () => {
    try {
      const res = await axiosInstance.get('/auth/me');
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
      const res = await axiosInstance.post('/auth/registro', {
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
      const res = await axiosInstance.post('/auth/login', {
        email,
        password
      });
      
      const newToken = res.data.token;
      setToken(newToken);
      setUsuario(res.data.usuario);
      localStorage.setItem('token', newToken);
      
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

  // Interceptor de respuesta para manejar 401
  useEffect(() => {
    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.warn('⚠️ 401 Unauthorized - Logout');
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, []);

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
      axios: axiosInstance  // ← Exporta la instancia
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export default axiosInstance;
