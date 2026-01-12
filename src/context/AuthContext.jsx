import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Crear instancia axios independiente
  const axiosInstance = axios.create({
    baseURL: 'https://web-production-ae8e1.up.railway.app/api',
    timeout: 10000
  });

  // Interceptor para requests - Agrega el token
  axiosInstance.interceptors.request.use(
    (config) => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
        console.log('✅ Token configurado en axios');
      } else {
        console.log('⚠️ No hay token en localStorage');
      }
      return config;
    },
    (error) => {
      console.error('Error en request:', error);
      return Promise.reject(error);
    }
  );

  // Interceptor para responses - Maneja 401
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.log('⚠️ 401 Unauthorized - Logout');
        
        // LIMPIA TODO al recibir 401
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        
        // Redirecciona al login
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  // Al cargar la app, verifica si hay token guardado
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          console.log('✅ Token encontrado en localStorage');
          console.log('✅ Usuario restaurado:', JSON.parse(storedUser).email);
        } else {
          console.log('⚠️ No hay sesión guardada');
          setIsAuthenticated(false);
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Error al inicializar auth:', error);
        setIsAuthenticated(false);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Función de LOGIN
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Primero, LIMPIA cualquier token viejo
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      
      // Espera un bit para que los interceptores se actualicen
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await axiosInstance.post('/auth/login', { email, password });
      
      const { token: newToken, user: userData } = response.data;
      
      // Guarda el nuevo token y usuario
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('✅ Login exitoso');
      console.log('✅ Token verificado para usuario:', userData.email);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Error en login:', error);
      
      // Limpia en caso de error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      return {
        success: false,
        error: error.response?.data?.error || 'Error en login'
      };
    } finally {
      setLoading(false);
    }
  };

  // Función de LOGOUT
  const logout = async () => {
    try {
      setLoading(true);
      
      // Intenta notificar al backend (opcional)
      try {
        await axiosInstance.post('/auth/logout');
      } catch (err) {
        console.log('⚠️ No se pudo notificar logout al backend');
      }
      
      // LIMPIA TODO localmente
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout completado');
      
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      
      // Limpia igual aunque haya error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      return { success: true }; // Considera logout exitoso de todas formas
    } finally {
      setLoading(false);
    }
  };

  // Función para hacer requests autenticadas
  const request = async (method, endpoint, data = null) => {
    try {
      const config = {
        method,
        url: endpoint
      };
      
      if (data) {
        config.data = data;
      }
      
      const response = await axiosInstance(config);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    loading,
    token,
    user,
    axios: axiosInstance,
    login,
    logout,
    request
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
