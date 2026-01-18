import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';



export const AuthContext = createContext();



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState('');


  // ✅ URL CORRECTA DE RAILWAY
  const API_URL = import.meta.env.VITE_API_URL || 'https://barberia-jordan-backend.railway.app';



  // Al montar, recuperar token del localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔍 Verificando token en localStorage...');
        const savedToken = localStorage.getItem('token');
        
        if (savedToken) {
          console.log('✅ Token encontrado:', savedToken.substring(0, 20) + '...');
          
          // Configurar axios con el token
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          
          try {
            // Intenta verificar token
            const response = await axios.get(`${API_URL}/api/auth/me`);
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
  }, [API_URL]);



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



  // ✅ NUEVO: Función apiUrl para compatibilidad con Usuarios.jsx
  const apiUrl = API_URL;



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
    apiUrl,
    axios
  };



  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};