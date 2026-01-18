import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Servicios() {
  const { token, authLoading } = useContext(AuthContext);
  const [servicios, setServicios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [citasCount, setCitasCount] = useState({});
  
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    descripcion: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'https://web-production-ae8e1.up.railway.app';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  useEffect(() => {
    if (authLoading) return;
    if (!token) return;
    cargarServicios();
    cargarCitas();
  }, [token, authLoading]);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/servicios`, {
        headers: getHeaders()
      });
      
      if (Array.isArray(response.data)) {
        setServicios(response.data);
      } else {
        console.error('❌ La respuesta no es un array:', response.data);
        setError('Error: respuesta inválida del servidor');
        setServicios([]);
      }
      setError('');
    } catch (err) {
      setError('Error al cargar servicios');
      console.error(err);
      setServicios([]);
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
          conteo[cita.servicio_id] = (conteo[cita.servicio_id] || 0) + 1;
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
      [name]: name === 'precio' ? (value === '' ? '' : Number(value)) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      setError('El nombre del servicio es requerido');
      return;
    }

    if (!formData.precio || formData.precio <= 0) {
      setError('El precio debe ser mayor a 0');
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        await axios.put(`${API_URL}/api/servicios/${editingId}`, formData, {
          headers: getHeaders()
        });
        setSuccess('¡Servicio actualizado exitosamente!');
      } else {
        await axios.post(`${API_URL}/api/servicios`, formData, {
          headers: getHeaders()
        });
        setSuccess('¡Servicio creado exitosamente!');
      }
      
      setFormData({
        nombre: '',
        precio: '',
        descripcion: ''
      });
      setShowForm(false);
      setEditingId(null);
      setError('');
      await cargarServicios();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar servicio');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (servicio) => {
    setFormData({
      nombre: servicio.nombre,
      precio: servicio.precio,
      descripcion: servicio.descripcion || ''
    });
    setEditingId(servicio.id);
    setShowForm(true);
    setError('');
  };

  const handleCancelar = () => {
    setFormData({
      nombre: '',
      precio: '',
      descripcion: ''
    });
    setShowForm(false);
    setEditingId(null);
    setError('');
  };

  const handleEliminar = async (id, nombreServicio) => {
    const citasDelServicio = citasCount[id] || 0;

    if (citasDelServicio > 0) {
      if (!window.confirm(
        `⚠️ ATENCIÓN\n\n"${nombreServicio}" tiene ${citasDelServicio} cita${citasDelServicio > 1 ? 's' : ''}.\n\n` +
        `✅ Las citas se guardarán con el servicio como "❌ (Eliminado)"\n` +
        `✅ Los datos de la cita (precio, notas, fecha) se mantienen intactos\n\n` +
        `¿Deseas continuar?`
      )) {
        return;
      }
    }

    if (window.confirm(`¿Estás SEGURO de que deseas eliminar "${nombreServicio}"?`)) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/api/servicios/${id}`, {
          headers: getHeaders()
        });
        setSuccess('✅ Servicio eliminado correctamente. Las citas se mantienen intactas.');
        setError('');
        await cargarServicios();
        await cargarCitas();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al eliminar servicio');
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
          <h2 className="text-3xl font-bold text-gray-800">✂️ Servicios</h2>
          <p className="text-gray-500 mt-2">Gestiona los servicios disponibles</p>
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
          {showForm ? '❌ Cancelar' : '➕ Agregar Servicio'}
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
            {editingId ? '✏️ Editar Servicio' : 'Crear Nuevo Servicio'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre del Servicio <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Corte de Cabello"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Precio ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                placeholder="Ej: 150"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Ej: Corte clásico con detalles"
                rows="3"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-gray-800 font-bold rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Guardando...' : editingId ? '✅ Actualizar Servicio' : '✅ Crear Servicio'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-300">
        <h3 className="text-lg font-bold text-gray-800 mb-6">
          Lista de Servicios ({servicios.length})
        </h3>

        {loading && !showForm ? (
          <div className="text-center py-8 text-gray-500">⏳ Cargando...</div>
        ) : servicios.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">📭</div>
            No hay servicios registrados. ¡Agrega uno nuevo!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicios.map((servicio) => {
              const tieneCitas = (citasCount[servicio.id] || 0) > 0;
              
              return (
                <div 
                  key={servicio.id} 
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-300 overflow-hidden group"
                >
                  <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-4 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl">✂️</span>
                      <h4 className="text-xl font-bold truncate">{servicio.nombre}</h4>
                    </div>
                    <div className="text-lg font-bold">
                      ${servicio.precio.toFixed(2)}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="space-y-3">
                        {servicio.descripcion && (
                          <div>
                            <p className="text-gray-600 text-sm">{servicio.descripcion}</p>
                          </div>
                        )}
                        
                        <div className="pt-2 border-t border-gray-200">
                          <span className="text-gray-600 text-sm font-medium">📅 Citas:</span>
                          <span className={`ml-2 font-bold text-sm ${tieneCitas ? 'text-blue-600' : 'text-green-600'}`}>
                            {citasCount[servicio.id] || 0}
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
                        onClick={() => handleEditar(servicio)}
                        disabled={loading}
                        className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <span>✏️</span> Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(servicio.id, servicio.nombre)}
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