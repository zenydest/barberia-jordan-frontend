import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';


export const AuthContext = createContext();


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState('');


  const API_URL = import.meta.env.VITE_API_URL || 'https://barberia-jordan-backend.up.railway.app';


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
          
          // Verificar token con el backend
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${savedToken}`
            }
          });
          
          console.log('✅ Token válido. Usuario:', response.data);
          setUser(response.data);
          setToken(savedToken);
          setError('');
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
        setError('Token expirado. Por favor inicia sesión nuevamente.');
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

      const response = await axios.post(`${API_URL}/api/auth/login`, {
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

      const response = await axios.post(`${API_URL}/api/auth/registro`, {
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