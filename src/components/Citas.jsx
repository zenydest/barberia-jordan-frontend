import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function Citas() {
  const { token, authLoading } = useContext(AuthContext);
  const [citas, setCitas] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    barbero_id: '',
    servicio_id: '',
    precio: '',
    notas: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'https://web-production-ae8e1.up.railway.app';

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  useEffect(() => {
    if (authLoading) return;
    if (!token) return;
    cargarDatos();
  }, [token, authLoading]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [citasRes, barberosRes, serviciosRes, clientesRes] = await Promise.all([
        axios.get(`${API_URL}/api/citas`, { headers: getHeaders() }),
        axios.get(`${API_URL}/api/barberos`, { headers: getHeaders() }),
        axios.get(`${API_URL}/api/servicios`, { headers: getHeaders() }),
        axios.get(`${API_URL}/api/clientes`, { headers: getHeaders() })
      ]);
      
      setCitas(Array.isArray(citasRes.data) ? citasRes.data : []);
      setBarberos(Array.isArray(barberosRes.data) ? barberosRes.data : []);
      setServicios(Array.isArray(serviciosRes.data) ? serviciosRes.data : []);
      setClientes(Array.isArray(clientesRes.data) ? clientesRes.data : []);
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
    
    // Si cambia el servicio, auto-llenar el precio
    if (name === 'servicio_id' && value) {
      const servicioSeleccionado = servicios.find(s => s.id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        [name]: value,
        precio: servicioSeleccionado ? servicioSeleccionado.precio : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.precio || formData.precio <= 0) {
      setError('El precio es requerido y debe ser mayor a 0');
      return;
    }

    try {
      setLoading(true);
      
      const datos = {
        cliente_id: formData.cliente_id ? parseInt(formData.cliente_id) : null,
        barbero_id: formData.barbero_id ? parseInt(formData.barbero_id) : null,
        servicio_id: formData.servicio_id ? parseInt(formData.servicio_id) : null,
        precio: parseFloat(formData.precio),
        fecha: new Date().toISOString(),
        notas: formData.notas
      };

      if (editingId) {
        await axios.put(`${API_URL}/api/citas/${editingId}`, datos, {
          headers: getHeaders()
        });
        setSuccess('¡Cita actualizada exitosamente!');
      } else {
        await axios.post(`${API_URL}/api/citas`, datos, {
          headers: getHeaders()
        });
        setSuccess('¡Cita registrada exitosamente!');
      }
      
      setFormData({
        cliente_id: '',
        barbero_id: '',
        servicio_id: '',
        precio: '',
        notas: ''
      });
      setShowForm(false);
      setEditingId(null);
      setError('');
      await cargarDatos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar cita');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (cita) => {
    setFormData({
      cliente_id: cita.cliente_id || '',
      barbero_id: cita.barbero_id || '',
      servicio_id: cita.servicio_id || '',
      precio: cita.precio,
      notas: cita.notas || ''
    });
    setEditingId(cita.id);
    setShowForm(true);
    setError('');
  };

  const handleCancelar = () => {
    setFormData({
      cliente_id: '',
      barbero_id: '',
      servicio_id: '',
      precio: '',
      notas: ''
    });
    setShowForm(false);
    setEditingId(null);
    setError('');
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/api/citas/${id}`, {
          headers: getHeaders()
        });
        setSuccess('✅ Cita eliminada correctamente');
        setError('');
        await cargarDatos();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al eliminar cita');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getNombreBarbero = (barberoId) => {
    if (!barberoId) return '❌ (Eliminado)';
    const barbero = barberos.find(b => b.id === barberoId);
    return barbero ? barbero.nombre : '❌ Desconocido';
  };

  const getNombreServicio = (servicioId) => {
    if (!servicioId) return '❌ (Eliminado)';
    const servicio = servicios.find(s => s.id === servicioId);
    return servicio ? servicio.nombre : '❌ Desconocido';
  };

  const getNombreCliente = (clienteId) => {
    if (!clienteId) return 'Sin registrar';
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nombre : 'Desconocido';
  };

  return (
    <main className="ml-64 mt-16 p-8 bg-gradient-to-br from-white to-yellow-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">📅 Registrar Cita</h2>
          <p className="text-gray-500 mt-2">Registra las citas de tus clientes</p>
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
          {showForm ? '❌ Cancelar' : '➕ Registrar Cita'}
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
            {editingId ? '✏️ Editar Cita' : 'Nueva Cita'}
          </h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Cliente (Opcional)
              </label>
              <select
                name="cliente_id"
                value={formData.cliente_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
              >
                <option value="">Selecciona un cliente</option>
                {clientes.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Barbero (Opcional)
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Servicio (Opcional)
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Precio ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleInputChange}
                placeholder="Auto-se llena al seleccionar servicio"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notas
              </label>
              <input
                type="text"
                name="notas"
                value={formData.notas}
                onChange={handleInputChange}
                placeholder="Ej: Cliente nuevo, sensible al cuero cabelludo"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-gray-800 font-bold rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Guardando...' : editingId ? '✅ Actualizar Cita' : '✅ Registrar Cita'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-300 overflow-x-auto">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Últimas Citas ({citas.length})
        </h3>

        {loading && !showForm ? (
          <div className="text-center py-8 text-gray-500">⏳ Cargando...</div>
        ) : citas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            📭 No hay citas registradas
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-yellow-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Cliente</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Barbero</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Servicio</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Precio</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Notas</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((cita) => (
                <tr key={cita.id} className="border-b border-gray-200 hover:bg-yellow-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-800">{getNombreCliente(cita.cliente_id)}</td>
                  <td className="px-4 py-3 text-gray-600">{getNombreBarbero(cita.barbero_id)}</td>
                  <td className="px-4 py-3 text-gray-600">{getNombreServicio(cita.servicio_id)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-orange-600">${cita.precio.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{new Date(cita.fecha).toLocaleDateString('es-AR')} {new Date(cita.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{cita.notas || '-'}</td>
                  <td className="px-4 py-3 text-center space-x-2 flex justify-center">
                    <button
                      onClick={() => handleEditar(cita)}
                      disabled={loading}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded transition disabled:opacity-50"
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
        )}
      </div>
    </main>
  );
}