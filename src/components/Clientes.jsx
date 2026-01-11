import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API_URL from '../config.js';


export default function Clientes() {
  const { axios } = useContext(AuthContext);
  const [clientes, setClientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });

  useEffect(() => {
    cargarClientes();
  }, [axios]);

  const cargarClientes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/clientes');
      setClientes(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar clientes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      setLoading(true);
      
      if (editingId) {
        await axios.put(`/clientes/${editingId}`, formData);
        setSuccess('¡Cliente actualizado exitosamente!');
      } else {
        await axios.post(`/clientes`, formData);
        setSuccess('¡Cliente creado exitosamente!');
      }
      
      setFormData({
        nombre: '',
        email: '',
        telefono: ''
      });
      setShowForm(false);
      setEditingId(null);
      setError('');
      await cargarClientes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar cliente');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (cliente) => {
    setFormData({
      nombre: cliente.nombre,
      email: cliente.email || '',
      telefono: cliente.telefono || ''
    });
    setEditingId(cliente.id);
    setShowForm(true);
    setError('');
  };

  const handleCancelar = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: ''
    });
    setShowForm(false);
    setEditingId(null);
    setError('');
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        setLoading(true);
        await axios.delete(`/clientes/${id}`);
        setSuccess('Cliente eliminado correctamente');
        setError('');
        await cargarClientes();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Error al eliminar cliente');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Filtrar clientes por búsqueda
  const clientesFiltrados = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefono?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="ml-64 mt-16 p-8 bg-gradient-to-br from-white to-yellow-50 min-h-screen">
      {/* Título */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">👥 Clientes</h2>
          <p className="text-gray-500 mt-2">Gestiona los clientes de tu barberia</p>
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
          {showForm ? '❌ Cancelar' : '➕ Agregar Cliente'}
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
            {editingId ? '✏️ Editar Cliente' : 'Crear Nuevo Cliente'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Juan García"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Ej: juan@email.com (opcional)"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="Ej: +54 9 11 1234-5678 (opcional)"
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
                {loading ? '⏳ Guardando...' : editingId ? '✅ Actualizar Cliente' : '✅ Crear Cliente'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de clientes */}
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-300">
        {/* Buscador */}
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
          />
        </div>

        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Lista de Clientes ({clientesFiltrados.length})
        </h3>

        {loading && !showForm ? (
          <div className="text-center py-8 text-gray-500">⏳ Cargando...</div>
        ) : clientesFiltrados.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            📭 No hay clientes registrados. ¡Agrega uno nuevo!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-yellow-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Teléfono</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha Registro</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="border-b border-gray-200 hover:bg-yellow-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{cliente.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{cliente.email || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{cliente.telefono || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{cliente.fecha_registro}</td>
                    <td className="px-4 py-3 text-center flex gap-2 justify-center">
                      <button
                        onClick={() => handleEditar(cliente)}
                        disabled={loading}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded transition disabled:opacity-50"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(cliente.id)}
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
