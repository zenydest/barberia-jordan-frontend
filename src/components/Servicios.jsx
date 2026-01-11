import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../config.js';


export default function Servicios() {
  const { axios } = useContext(AuthContext);
  const [servicios, setServicios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    descripcion: ''
  });

  useEffect(() => {
    cargarServicios();
  }, [axios]);

  const cargarServicios = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/servicios`);
      setServicios(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar servicios');
      console.error(err);
    } finally {
      setLoading(false);
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
        await axios.put(`${API_URL}/servicios/${editingId}`, formData);
        setSuccess('¡Servicio actualizado exitosamente!');
      } else {
        await axios.post(`${API_URL}/servicios`, formData);
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

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este servicio?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/servicios/${id}`);
        setSuccess('Servicio eliminado correctamente');
        setError('');
        await cargarServicios();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Error al eliminar servicio');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <main className="ml-64 mt-16 p-8 bg-gradient-to-br from-white to-yellow-50 min-h-screen">
      {/* Título */}
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

      {/* Mensajes */}
      {success && (
        <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          ❌ {error}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 border-t-4 border-yellow-300">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {editingId ? '✏️ Editar Servicio' : 'Crear Nuevo Servicio'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
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

            {/* Precio */}
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

            {/* Descripción */}
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

            {/* Botón */}
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

      {/* Tabla de servicios */}
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-300">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Lista de Servicios ({servicios.length})
        </h3>

        {loading && !showForm ? (
          <div className="text-center py-8 text-gray-500">⏳ Cargando...</div>
        ) : servicios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            📭 No hay servicios registrados. ¡Agrega uno nuevo!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-yellow-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Servicio</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Precio</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Descripción</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {servicios.map((servicio) => (
                  <tr key={servicio.id} className="border-b border-gray-200 hover:bg-yellow-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{servicio.nombre}</td>
                    <td className="px-4 py-3 font-semibold text-orange-600">${servicio.precio.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{servicio.descripcion || '-'}</td>
                    <td className="px-4 py-3 text-center flex gap-2 justify-center">
                      <button
                        onClick={() => handleEditar(servicio)}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded transition disabled:opacity-50"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(servicio.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded transition disabled:opacity-50"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
