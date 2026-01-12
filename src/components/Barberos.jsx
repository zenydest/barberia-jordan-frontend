import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';


export default function Barberos() {
  const { axios, token } = useContext(AuthContext);
  console.log('axios en Barberos:', axios);
  const [barberos, setBarberos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingBarbero, setEditingBarbero] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    comision: 20.0
  });

  useEffect(() => {
    if (!token) return;
    cargarBarberos();
  }, [token]);

  const cargarBarberos = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/barberos');  // ✅ CORRECTO
      setBarberos(res.data);
      setError('');
    } catch (err) {
      setError('Error al cargar barberos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'comision' ? parseFloat(value) || 0 : value
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingBarbero(prev => ({
      ...prev,
      [name]: name === 'comision' ? parseFloat(value) || 0 : value
    }));
  };

  // Crear barbero
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/barberos', formData);
      
      setSuccess('¡Barbero registrado exitosamente!');
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        comision: 20.0
      });
      setShowForm(false);
      setError('');
      await cargarBarberos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar barbero');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Editar barbero
  const handleEdit = (barbero) => {
    setEditingBarbero({
      id: barbero.id,
      nombre: barbero.nombre,
      email: barbero.email || '',
      telefono: barbero.telefono || '',
      comision: barbero.comision
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    if (!editingBarbero.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      setLoading(true);
      await axios.put(`/barberos/${editingBarbero.id}`, {
        nombre: editingBarbero.nombre,
        email: editingBarbero.email,
        telefono: editingBarbero.telefono,
        comision: editingBarbero.comision
      });
      
      setSuccess('¡Barbero actualizado exitosamente!');
      setShowEditModal(false);
      setEditingBarbero(null);
      setError('');
      await cargarBarberos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar barbero');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este barbero?')) {
      try {
        setLoading(true);
        await axios.delete(`/barberos/${id}`);
        setSuccess('Barbero eliminado correctamente');
        setError('');
        await cargarBarberos();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Error al eliminar barbero');
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
          <h2 className="text-3xl font-bold text-gray-800">💈 Barberos</h2>
          <p className="text-gray-500 mt-2">Gestiona los barberos de tu negocio</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-gray-800 font-bold rounded-lg shadow-md transition"
        >
          {showForm ? '❌ Cancelar' : '➕ Nuevo Barbero'}
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
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Nuevo Barbero</h3>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Carlos García"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email (opcional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="carlos@example.com"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="+54 9 11 2345-6789"
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
              />
            </div>

            {/* Comisión */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Comisión (%) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="comision"
                  value={formData.comision}
                  onChange={handleInputChange}
                  placeholder="20"
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
                />
                <span className="absolute right-4 top-3 text-gray-600 font-semibold">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Ej: 20% de cada cita</p>
            </div>

            {/* Botón */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-yellow-300 hover:bg-yellow-400 text-gray-800 font-bold rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Guardando...' : '✅ Registrar Barbero'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Editar */}
      {showEditModal && editingBarbero && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-8 border-t-4 border-blue-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">✏️ Editar Barbero</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingBarbero(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={editingBarbero.nombre}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-300 transition"
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
                  value={editingBarbero.email}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-300 transition"
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
                  value={editingBarbero.telefono}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-300 transition"
                />
              </div>

              {/* Comisión */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comisión (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="comision"
                    value={editingBarbero.comision}
                    onChange={handleEditChange}
                    step="0.1"
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-300 transition"
                  />
                  <span className="absolute right-4 top-3 text-gray-600 font-semibold">%</span>
                </div>
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
                    setEditingBarbero(null);
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

      {/* Tabla de barberos */}
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-yellow-300">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Barberos ({barberos.length})
        </h3>

        {loading && !showForm ? (
          <div className="text-center py-8 text-gray-500">⏳ Cargando...</div>
        ) : barberos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            📭 No hay barberos registrados. ¡Crea uno nuevo!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-yellow-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Teléfono</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Comisión</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {barberos.map((barbero) => (
                  <tr key={barbero.id} className="border-b border-gray-200 hover:bg-yellow-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{barbero.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{barbero.email || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{barbero.telefono || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-orange-600">{barbero.comision}%</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        barbero.estado === 'activo' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {barbero.estado === 'activo' ? '✅ Activo' : '❌ Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-2 flex justify-center">
                      <button
                        onClick={() => handleEdit(barbero)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded transition"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(barbero.id)}
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
