import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Usuarios.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://barberia-jordan-backend.railway.app';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'barbero',
    estado: 'activo'
  });

  const token = localStorage.getItem('token');

  // ==================== CARGAR USUARIOS ====================
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/usuarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(response.data);
    } catch (err) {
      setError('Error al cargar usuarios: ' + (err.response?.data?.error || err.message));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ==================== LIMPIAR FORMULARIO ====================
  const limpiarFormulario = () => {
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'barbero',
      estado: 'activo'
    });
    setEditingId(null);
  };

  // ==================== ABRIR MODAL PARA CREAR ====================
  const abrirModalCrear = () => {
    limpiarFormulario();
    setShowModal(true);
  };

  // ==================== EDITAR USUARIO ====================
  const editarUsuario = (usuario) => {
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      estado: usuario.estado
    });
    setEditingId(usuario.id);
    setShowModal(true);
  };

  // ==================== GUARDAR USUARIO ====================
  const guardarUsuario = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validaciones
    if (!formData.nombre.trim() || !formData.email.trim()) {
      setError('El nombre y email son requeridos');
      return;
    }

    if (!editingId && !formData.password.trim()) {
      setError('La contraseña es requerida para nuevos usuarios');
      return;
    }

    setLoading(true);

    try {
      const dataToSend = { ...formData };
      
      // Si no hay contraseña en edición, no enviarla
      if (editingId && !formData.password) {
        delete dataToSend.password;
      }

      let response;
      if (editingId) {
        // Actualizar usuario
        response = await axios.put(
          `${API_BASE_URL}/api/usuarios/${editingId}`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Usuario actualizado correctamente');
      } else {
        // Crear usuario
        response = await axios.post(
          `${API_BASE_URL}/api/usuarios`,
          dataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccess('Usuario creado correctamente');
      }

      setShowModal(false);
      limpiarFormulario();
      cargarUsuarios();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError('Error: ' + errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ==================== ELIMINAR USUARIO ====================
  const eliminarUsuario = async (id, email) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar a ${email}?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.delete(
        `${API_BASE_URL}/api/usuarios/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Usuario eliminado correctamente');
      cargarUsuarios();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError('Error al eliminar: ' + errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ==================== CAMBIAR CAMPO ====================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h2>Gestión de Usuarios</h2>
        <button 
          className="btn btn-primary"
          onClick={abrirModalCrear}
          disabled={loading}
        >
          ➕ Crear Usuario
        </button>
      </div>

      {/* MENSAJES DE ERROR Y ÉXITO */}
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* TABLA DE USUARIOS */}
      {loading && !showModal ? (
        <div className="loading">Cargando usuarios...</div>
      ) : usuarios.length === 0 ? (
        <div className="no-data">No hay usuarios registrados</div>
      ) : (
        <div className="table-responsive">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(usuario => (
                <tr key={usuario.id} className={usuario.estado === 'inactivo' ? 'inactive' : ''}>
                  <td>{usuario.email}</td>
                  <td>{usuario.nombre}</td>
                  <td>
                    <span className={`badge badge-${usuario.rol}`}>
                      {usuario.rol}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${usuario.estado === 'activo' ? 'success' : 'error'}`}>
                      {usuario.estado}
                    </span>
                  </td>
                  <td>{usuario.fecha_registro}</td>
                  <td className="actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => editarUsuario(usuario)}
                      disabled={loading}
                      title="Editar usuario"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => eliminarUsuario(usuario.id, usuario.email)}
                      disabled={loading || usuario.email === 'Rodritapia92@gmail.com'}
                      title={usuario.email === 'Rodritapia92@gmail.com' ? 'No puedes eliminar el admin principal' : 'Eliminar usuario'}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL PARA CREAR/EDITAR USUARIO */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={guardarUsuario} className="modal-form">
              {/* NOMBRE */}
              <div className="form-group">
                <label htmlFor="nombre">Nombre Completo *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Juan Pérez"
                  disabled={loading}
                  required
                />
              </div>

              {/* EMAIL */}
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="juan@example.com"
                  disabled={loading}
                  required
                />
              </div>

              {/* CONTRASEÑA */}
              <div className="form-group">
                <label htmlFor="password">
                  Contraseña {editingId ? '(dejar vacío para no cambiar)' : '*'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={loading}
                  required={!editingId}
                />
              </div>

              {/* ROL */}
              <div className="form-group">
                <label htmlFor="rol">Rol *</label>
                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                >
                  <option value="barbero">Barbero</option>
                  <option value="admin">Administrador</option>
                  <option value="recepcion">Recepción</option>
                </select>
              </div>

              {/* ESTADO */}
              <div className="form-group">
                <label htmlFor="estado">Estado *</label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  disabled={loading}
                  required
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              {/* BOTONES */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}