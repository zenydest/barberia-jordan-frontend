import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';


export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState('');

  // Usar proxy CORS si está disponible, sino usar directo
  const API_URL = import.meta.env.VITE_API_URL || 'https://barberia-jordan-backend.up.railway.app';
  const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/'; // Workaround temporal

  // Función para hacer requests con reintentos
  const apiRequest = async (method, endpoint, data = null) => {
    const url = `${API_URL}${endpoint}`;
    
    try {
      // Intenta primero directo
      if (method === 'GET') {
        return await axios.get(url);
      } else if (method === 'POST') {
        return await axios.post(url, data);
      } else if (method === 'PUT') {
        return await axios.put(url, data);
      } else if (method === 'DELETE') {
        return await axios.delete(url);
      }
    } catch (directError) {
      console.warn('❌ Request directo falló, intentando con proxy...');
      
      // Si falla por CORS, intenta con fetch + proxy
      try {
        const response = await fetch(CORS_PROXY + url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: data ? JSON.stringify(data) : null
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return { data: await response.json() };
      } catch (proxyError) {
        throw directError; // Lanza el error original si ambos fallan
      }
    }
  };


  // Al montar, recuperar token del localStorage ANTES de cualquier cosa
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 Verificando token en localStorage...');
        const savedToken = localStorage.getItem('token');
        
        if (savedToken) {
          console.log('✅ Token encontrado:', savedToken.substring(0, 20) + '...');
          
          // Configurar axios con el token
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          axios.defaults.baseURL = API_URL;
          
          try {
            // Intenta verificar token
            const response = await apiRequest('GET', '/api/auth/me');
            console.log('✅ Token válido. Usuario:', response.data);
            setUser(response.data);
            setToken(savedToken);
            setError('');
          } catch (err) {
            console.error('❌ Token inválido:', err.message);
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        } else {
          console.log('❌ No hay token en localStorage');
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        console.error('❌ Error verificando token:', err.message);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, []);


  // Login
  const login = async (email, password) => {
    try {
      setAuthLoading(true);
      setError('');
      console.log('📝 Intentando login con:', email);

      const response = await apiRequest('POST', '/api/auth/login', {
        email,
        password
      });

      console.log('✅ Login exitoso:', response.data);
      const newToken = response.data.token;
      
      // Guardar token en localStorage
      localStorage.setItem('token', newToken);
      
      // Configurar axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      axios.defaults.baseURL = API_URL;
      
      setToken(newToken);
      setUser(response.data.usuario);
      setError('');
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error('❌ Error en login:', errorMsg);
      setError(errorMsg);
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      return { success: false, error: errorMsg };
    } finally {
      setAuthLoading(false);
    }
  };


  // Logout
  const logout = () => {
    console.log('🚪 Logout');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setError('');
  };


  // Signup
  const signup = async (email, password, nombre) => {
    try {
      setAuthLoading(true);
      setError('');
      console.log('📝 Intentando signup con:', email);

      const response = await apiRequest('POST', '/api/auth/registro', {
        email,
        password,
        nombre
      });

      console.log('✅ Signup exitoso:', response.data);
      const newToken = response.data.token;
      
      // Guardar token en localStorage
      localStorage.setItem('token', newToken);
      
      // Configurar axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      axios.defaults.baseURL = API_URL;
      
      setToken(newToken);
      setUser(response.data.usuario);
      setError('');
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error('❌ Error en signup:', errorMsg);
      setError(errorMsg);
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      return { success: false, error: errorMsg };
    } finally {
      setAuthLoading(false);
    }
  };


  const value = {
    user,
    token,
    authLoading,
    error,
    login,
    logout,
    signup,
    setError,
    isAuthenticated: !!user && !!token,
    axios
  };


  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};