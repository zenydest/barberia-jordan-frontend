import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';


const Barberos = () => {
  const { user, authLoading, token } = useContext(AuthContext);
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    comision: 20.0,
  });


  const API_URL = import.meta.env.VITE_API_URL || 'https://web-production-ae8e1.up.railway.app';


  // Crear headers con token
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });


  // Cargar barberos
  const fetchBarberos = async () => {
    if (!token) {
      console.log('⚠️ No hay token, esperando...');
      return;
    }


    try {
      setLoading(true);
      setError('');
      console.log('📡 Fetching barberos con token:', token.substring(0, 20) + '...');
      
      const response = await axios.get(`${API_URL}/api/barberos`, {
        headers: getHeaders()
      });


      console.log('✅ Respuesta de barberos:', response.data);
      
      // Validar que sea un array
      if (Array.isArray(response.data)) {
        setBarberos(response.data);
      } else {
        console.error('❌ La respuesta no es un array:', response.data);
        setError('Error: respuesta inválida del servidor');
        setBarberos([]);
      }
    } catch (err) {
      console.error('❌ Error fetching barberos:', err);
      if (err.response?.status === 401) {
        setError('Sesión expirada. Por favor inicia sesión nuevamente.');
      } else {
        setError(err.response?.data?.error || err.message);
      }
      setBarberos([]);
    } finally {
      setLoading(false);
    }
  };


  // Cargar barberos cuando el token esté disponible
  useEffect(() => {
    if (!authLoading && token) {
      fetchBarberos();
    }
  }, [token, authLoading]);


  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'comision' ? parseFloat(value) : value
    }));
  };


  // Crear nuevo barbero
  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }


    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/api/barberos`, formData, {
        headers: getHeaders()
      });


      console.log('✅ Barbero creado:', response.data);
      setBarberos([...barberos, response.data]);
      setFormData({ nombre: '', email: '', telefono: '', comision: 20.0 });
      setShowForm(false);
      setError('');
    } catch (err) {
      console.error('❌ Error creating barbero:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };


  // Actualizar barbero
  const handleUpdate = async (e) => {
    e.preventDefault();


    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }


    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/api/barberos/${editingId}`, formData, {
        headers: getHeaders()
      });


      console.log('✅ Barbero actualizado:', response.data);
      setBarberos(barberos.map(b => b.id === editingId ? response.data : b));
      setFormData({ nombre: '', email: '', telefono: '', comision: 20.0 });
      setEditingId(null);
      setError('');
    } catch (err) {
      console.error('❌ Error updating barbero:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };


  // Eliminar barbero
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este barbero?')) return;


    try {
      setLoading(true);
      await axios.delete(`${API_URL}/api/barberos/${id}`, {
        headers: getHeaders()
      });


      console.log('✅ Barbero eliminado');
      setBarberos(barberos.filter(b => b.id !== id));
      setError('');
    } catch (err) {
      console.error('❌ Error deleting barbero:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };


  // Editar barbero
  const handleEdit = (barbero) => {
    setEditingId(barbero.id);
    setFormData({
      nombre: barbero.nombre,
      email: barbero.email || '',
      telefono: barbero.telefono || '',
      comision: barbero.comision
    });
    setShowForm(true);
  };


  if (authLoading) {
    return <div className="barberos-container">⏳ Cargando autenticación...</div>;
  }


  if (!user) {
    return <div className="barberos-container">🔒 Debes estar autenticado para ver este contenido</div>;
  }


  if (user.rol !== 'admin') {
    return <div className="barberos-container">🚫 Solo los administradores pueden gestionar barberos</div>;
  }


  return (
    <div className="barberos-container">
      <h1>💈 Barberos</h1>
      <p>Gestiona los barberos de tu negocio</p>


      {error && <div className="error-message">⚠️ {error}</div>}


      {/* Formulario */}
      {showForm && (
        <div className="form-section">
          <h2>{editingId ? '✏️ Editar Barbero' : '➕ Nuevo Barbero'}</h2>
          <form onSubmit={editingId ? handleUpdate : handleCreate}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Juan Carlos"
                required
              />
            </div>


            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Ej: juan@example.com"
              />
            </div>


            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="Ej: 1234567890"
              />
            </div>


            <div className="form-group">
              <label htmlFor="comision">Comisión (%)</label>
              <input
                type="number"
                id="comision"
                name="comision"
                value={formData.comision}
                onChange={handleInputChange}
                min="0"
                max="100"
                step="0.1"
              />
            </div>


            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? '⏳ Guardando...' : editingId ? '💾 Actualizar' : '➕ Crear'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ nombre: '', email: '', telefono: '', comision: 20.0 });
                }}
              >
                ❌ Cancelar
              </button>
            </div>
          </form>
        </div>
      )}


      {/* Botón para mostrar formulario */}
      {!showForm && (
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          ➕ Nuevo Barbero
        </button>
      )}


      {/* Lista de barberos */}
      <div className="barberos-list">
        <h2>💇 Barberos ({barberos.length})</h2>


        {loading && !showForm && <p>⏳ Cargando...</p>}


        {!loading && barberos.length === 0 && (
          <p>📭 No hay barberos registrados aún.</p>
        )}


        {barberos.length > 0 && (
          <table className="barberos-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Comisión</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {barberos.map(barbero => (
                <tr key={barbero.id}>
                  <td>{barbero.nombre}</td>
                  <td>{barbero.email || '-'}</td>
                  <td>{barbero.telefono || '-'}</td>
                  <td>{barbero.comision}%</td>
                  <td>
                    {barbero.estado === 'activo' ? '✅ Activo' : '❌ Inactivo'}
                  </td>
                  <td className="actions">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(barbero)}
                      disabled={loading}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(barbero.id)}
                      disabled={loading}
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
    </div>
  );
};


export default Barberos;