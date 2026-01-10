import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo-jordan.png';

export default function Login() {
  const { login, registro, loading, error } = useContext(AuthContext);
  const [isRegistro, setIsRegistro] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nombre: ''
  });
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    try {
      if (isRegistro) {
        if (!formData.nombre.trim()) {
          setLocalError('El nombre es requerido');
          return;
        }
        await registro(formData.email, formData.password, formData.nombre);
      } else {
        await login(formData.email, formData.password);
      }
    } catch (err) {
      setLocalError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden border-t-4 border-yellow-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-8 text-center">
            <img src={logo} alt="Logo" className="w-16 h-16 mx-auto mb-4 rounded-full shadow-lg" />
            <h1 className="text-3xl font-bold text-white">Barberia Jordan</h1>
            <p className="text-gray-400 text-sm mt-2">Sistema de Gestión Digital</p>
          </div>

          {/* Body */}
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
              {isRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </h2>
            <p className="text-gray-500 text-center text-sm mb-6">
              {isRegistro 
                ? 'Regístrate para acceder al sistema' 
                : 'Ingresa tus credenciales'}
            </p>

            {/* Errores */}
            {(error || localError) && (
              <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm rounded">
                ❌ {error || localError}
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre - Solo en registro */}
              {isRegistro && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Juan Pérez"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
                />
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
                />
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-yellow-300 to-orange-300 hover:from-yellow-400 hover:to-orange-400 text-gray-800 font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading 
                  ? '⏳ Cargando...' 
                  : isRegistro ? '✅ Registrarse' : '🔓 Iniciar Sesión'}
              </button>
            </form>

            {/* Toggle */}
            <p className="text-center text-gray-600 mt-6 text-sm">
              {isRegistro 
                ? '¿Ya tienes cuenta? '
                : '¿No tienes cuenta? '}
              <button
                type="button"
                onClick={() => {
                  setIsRegistro(!isRegistro);
                  setLocalError('');
                  setFormData({ email: '', password: '', nombre: '' });
                }}
                className="text-yellow-600 font-bold hover:text-yellow-700 transition"
              >
                {isRegistro ? 'Inicia Sesión' : 'Regístrate'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
