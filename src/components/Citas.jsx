import React, { useState, useEffect } from 'react';
import axios from 'axios';

import API_URL from '../config.js';


export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingCita, setEditingCita] = useState(null);
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    barbero_id: '',
    servicio_id: '',
    precio: '',
    notas: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [citasRes, clientesRes, barberosRes, serviciosRes] = await Promise.all([
        axios.get(`${API_URL}/citas`),
        axios.get(`${API_URL}/clientes`),
        axios.get(`${API_URL}/barberos`),
        axios.get(`${API_URL}/servicios`)
      ]);
      
      setCitas(citasRes.data);
      setClientes(clientesRes.data);
      setBarberos(barberosRes.data);
      setServicios(serviciosRes.data);
      setError('');
    } catch (err) {
      setError('Error al cargar datos');
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

    // Actualizar precio automáticamente
    if (name === 'servicio_id' && value) {
      const servicio = servicios.find(s => s.id === parseInt(value));
      if (servicio) {
        setFormData(prev => ({
          ...prev,
          precio: servicio.precio
        }));
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingCita(prev => ({
      ...prev,
      [name]: name === 'precio' ? (value === '' ? '' : Number(value)) : value
    }));

    // Actualizar precio automáticamente en edición
    if (name === 'servicio_id' && value) {
      const servicio = servicios.find(s => s.id === parseInt(value));
      if (servicio) {
        setEditingCita(prev => ({
          ...prev,
          precio: servicio.precio
        }));
      }
    }
  };

  // Crear cita
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.barbero_id || !formData.servicio_id) {
      setError('Barbero y Servicio son requeridos');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/citas`, formData);
      
      setSuccess('¡Cita registrada exitosamente!');
      setFormData({
        cliente_id: '',
        barbero_id: '',
        servicio_id: '',
        precio: '',
        notas: ''
      });
      setShowForm(false);
      setError('');
      await cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar cita');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Editar cita
  const handleEdit = (cita) => {
    setEditingCita({
      id: cita.id,
      cliente_id: cita.cliente_id || '',
      barbero_id: cita.barbero_id,
      servicio_id: cita.servicio_id,
      precio: cita.precio,
      notas: cita.notas || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    if (!editingCita.barbero_id || !editingCita.servicio_id) {
      setError('Barbero y Servicio son requeridos');
      return;
    }

    try {
      setLoading(true);
      await axios.put(`${API_URL}/citas/${editingCita.id}`, {
        cliente_id: editingCita.cliente_id || null,
        barbero_id: editingCita.barbero_id,
        servicio_id: editingCita.servicio_id,
        precio: editingCita.precio,
        notas: editingCita.notas
      });
      
      setSuccess('¡Cita actualizada exitosamente!');
      setShowEditModal(false);
      setEditingCita(null);
      setError('');
      await cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar cita');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/citas/${id}`);
        setSuccess('Cita eliminada correctamente');
        setError('');
        await cargarDatos();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Error al eliminar cita');
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
          <h2 className="text-3xl font-bold text-gray-800">📅 Registrar Cita</h2>
          <p className="text-gray-500 mt-2">Registra las citas de tus clientes</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-gray-800 font-bold rounded-lg shadow-md transition"
        >
          {showForm ? '❌ Cancelar' : '➕ Registrar Cita'}
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

      {/* Formulario Crear */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 border-t-4 border-yellow-300">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Nueva Cita</h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cliente - OPCIONAL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cliente
              </label>
              <select
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
              >
                <option value="">Selecciona un cliente (opcional)</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Barbero - OBLIGATORIO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Barbero <span className="text-red-500">*</span>
              </label>
              <select
                name="barbero_id"
                value={formData.barbero_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
              >
                <option value="">Selecciona un barbero</option>
                {barberos.map(barbero => (
                  <option key={barbero.id} value={barbero.id}>
                    {barbero.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Servicio - OBLIGATORIO */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Servicio <span className="text-red-500">*</span>
              </label>
              <select
                name="servicio_id"
                value={formData.servicio_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
              >
                <option value="">Selecciona un servicio</option>
                {servicios.map(servicio => (
                  <option key={servicio.id} value={servicio.id}>
                    {servicio.nombre} - ${servicio.precio.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Precio ($)
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                placeholder="Se auto-completa al seleccionar servicio"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition bg-gray-50"
                readOnly
              />
            </div>

            {/* Notas */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                name="notas"
                value={formData.notas}
                onChange={handleInputChange}
                placeholder="Ej: Cliente pidió detalles especiales"
                rows="2"
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
                {loading ? '⏳ Guardando...' : '✅ Registrar Cita'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Editar */}
      {showEditModal && editingCita && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8 border-t-4 border-blue-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">✏️ Editar Cita</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCita(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cliente */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cliente
                </label>
                <select
                  name="cliente_id"
                  value={editingCita.cliente_id}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-300 transition"
                >
                  <option value="">Sin cliente</option>
                  {clientes.map(cliente => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Barbero */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Barbero <span className="text-red-500">*</span>
                </label>
                <select
                  name="barbero_id"
                  value={editingCita.barbero_id}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-300 transition"
                >
                  {barberos.map(barbero => (
                    <option key={barbero.id} value={barbero.id}>
                      {barbero.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Servicio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Servicio <span className="text-red-500">*</span>
                </label>
                <select
                  name="servicio_id"
                  value={editingCita.servicio_id}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-300 transition"
                >
                  {servicios.map(servicio => (
                    <option key={servicio.id} value={servicio.id}>
                      {servicio.nombre} - ${servicio.precio.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Precio ($)
                </label>
                <input
                  type="number"
                  name="precio"
                  value={editingCita.precio}
                  onChange={handleEditChange}
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-300 transition"
                />
              </div>

              {/* Notas */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  name="notas"
                  value={editingCita.notas}
                  onChange={handleEditChange}
                  rows="2"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-300 transition"
                />
              </div>

              {/* Botones */}
              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-md transition disabled:opacity-50"
                >
                  {loading ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCita(null);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-400 hover:bg-gray-500 text-white font-bold rounded-lg shadow-md transition"
                >
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de citas */}
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-300">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Últimas Citas ({citas.length})
        </h3>

        {loading && !showForm ? (
          <div className="text-center py-8 text-gray-500">⏳ Cargando...</div>
        ) : citas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            📭 No hay citas registradas. ¡Registra una nueva!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-yellow-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Cliente</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Barbero</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Servicio</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Precio</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Notas</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citas.map((cita) => (
                  <tr key={cita.id} className="border-b border-gray-200 hover:bg-yellow-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{cita.cliente}</td>
                    <td className="px-4 py-3 text-gray-600">{cita.barbero}</td>
                    <td className="px-4 py-3 text-gray-600">{cita.servicio}</td>
                    <td className="px-4 py-3 font-semibold text-orange-600">${cita.precio.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-600">{cita.fecha}</td>
                    <td className="px-4 py-3 text-gray-600">{cita.notas || '-'}</td>
                    <td className="px-4 py-3 text-center space-x-2 flex justify-center">
                      <button
                        onClick={() => handleEdit(cita)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded transition"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(cita.id)}
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
