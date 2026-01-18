import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Barberos() {
  const { token, authLoading } = useContext(AuthContext);
  const [barberos, setBarberos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [citasCount, setCitasCount] = useState({});
  
  const [formData, setFormData] = useState({
    nombre: '',
    comision: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'https://web-production-ae8e1.up.railway.app';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  useEffect(() => {
    if (authLoading) return;
    if (!token) return;
    cargarBarberos();
    cargarCitas();
  }, [token, authLoading]);

  const cargarBarberos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/barberos`, {
        headers: getHeaders()
      });
      
      if (Array.isArray(response.data)) {
        setBarberos(response.data);
      } else {
        console.error('❌ La respuesta no es un array:', response.data);
        setError('Error: respuesta inválida del servidor');
        setBarberos([]);
      }
      setError('');
    } catch (err) {
      setError('Error al cargar barberos');
      console.error(err);
      setBarberos([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarCitas = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/citas`, {
        headers: getHeaders()
      });
      
      if (Array.isArray(response.data)) {
        const conteo = {};
        response.data.forEach(cita => {
          conteo[cita.barbero_id] = (conteo[cita.barbero_id] || 0) + 1;
        });
        setCitasCount(conteo);
      }
    } catch (err) {
      console.error('Error al cargar citas:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'comision' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      setError('El nombre del barbero es requerido');
      return;
    }

    if (!formData.comision || formData.comision <= 0) {
      setError('La comisión debe ser mayor a 0');
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        await axios.put(`${API_URL}/api/barberos/${editingId}`, formData, {
          headers: getHeaders()
        });
        setSuccess('¡Barbero actualizado exitosamente!');
      } else {
        await axios.post(`${API_URL}/api/barberos`, formData, {
          headers: getHeaders()
        });
        setSuccess('¡Barbero creado exitosamente!');
      }
      
      setFormData({
        nombre: '',
        comision: ''
      });
      setShowForm(false);
      setEditingId(null);
      setError('');
      await cargarBarberos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar barbero');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (barbero) => {
    setFormData({
      nombre: barbero.nombre,
      comision: barbero.comision
    });
    setEditingId(barbero.id);
    setShowForm(true);
    setError('');
  };

  const handleCancelar = () => {
    setFormData({
      nombre: '',
      comision: ''
    });
    setShowForm(false);
    setEditingId(null);
    setError('');
  };

  const handleEliminar = async (id, nombreBarbero) => {
    const citasDelBarbero = citasCount[id] || 0;

    if (citasDelBarbero > 0) {
      if (!window.confirm(
        `⚠️ ATENCIÓN\n\n"${nombreBarbero}" tiene ${citasDelBarbero} cita${citasDelBarbero > 1 ? 's' : ''}.\n\n` +
        `✅ Las citas se guardarán con el barbero como "❌ (Eliminado)"\n` +
        `✅ Los datos de la cita (precio, notas, fecha) se mantienen intactos\n\n` +
        `¿Deseas continuar?`
      )) {
        return;
      }
    }

    if (window.confirm(`¿Estás SEGURO de que deseas eliminar "${nombreBarbero}"?`)) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/api/barberos/${id}`, {
          headers: getHeaders()
        });
        setSuccess('✅ Barbero eliminado correctamente. Las citas se mantienen intactas.');
        setError('');
        await cargarBarberos();
        await cargarCitas();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al eliminar barbero');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <main className="ml-64 mt-16 p-8 bg-gradient-to-br from-white to-yellow-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">💇 Barberos</h2>
          <p className="text-gray-500 mt-2">Gestiona tu equipo de barberos</p>
        </div>
        <button
          onClick={() => {
            if (showForm && !editingId) {
              handleCancelar();
            } else {
              setShowForm(!showForm);
              if (!showForm) setEditingId(null);
            }
          }}
          className="px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-gray-800 font-bold rounded-lg shadow-md transition"
        >
          {showForm ? '❌ Cancelar' : '➕ Agregar Barbero'}
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 border-t-4 border-yellow-300">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {editingId ? '✏️ Editar Barbero' : 'Crear Nuevo Barbero'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del Barbero <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Juan Pérez"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Comisión (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="comision"
                value={formData.comision}
                onChange={handleInputChange}
                placeholder="Ej: 50"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-gray-800 font-bold rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Guardando...' : editingId ? '✅ Actualizar Barbero' : '✅ Crear Barbero'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-300">
        <h3 className="text-lg font-bold text-gray-800 mb-6">
          Lista de Barberos ({barberos.length})
        </h3>

        {loading && !showForm ? (
          <div className="text-center py-8 text-gray-500">⏳ Cargando...</div>
        ) : barberos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">📭</div>
            No hay barberos registrados. ¡Agrega uno nuevo!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barberos.map((barbero) => {
              const tieneCitas = (citasCount[barbero.id] || 0) > 0;
              
              return (
                <div 
                  key={barbero.id} 
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-300 overflow-hidden group"
                >
                  <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-4 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">💇</span>
                      <h4 className="text-xl font-bold truncate">{barbero.nombre}</h4>
                    </div>
                    <div className="text-sm font-semibold">
                      Comisión: {barbero.comision}%
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="space-y-3">
                        <div className="pt-2 border-t border-gray-200">
                          <span className="text-gray-600 text-sm font-medium">📅 Citas:</span>
                          <span className={`ml-2 font-bold text-sm ${tieneCitas ? 'text-blue-600' : 'text-green-600'}`}>
                            {citasCount[barbero.id] || 0}
                          </span>
                          {tieneCitas && (
                            <div className="text-xs text-blue-600 mt-2 p-2 bg-blue-50 rounded">
                              ℹ️ Tiene citas. Al eliminar, mostrarán "❌ (Eliminado)"
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditar(barbero)}
                        disabled={loading}
                        className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <span>✏️</span> Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(barbero.id, barbero.nombre)}
                        disabled={loading}
                        className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <span>🗑️</span> Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all rounded-xl pointer-events-none" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}