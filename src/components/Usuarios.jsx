import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './Usuarios.css';

export default function Usuarios() {
  const { apiUrl, token } = useContext(AuthContext);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'barbero',
    estado: 'activo'
  });

  // Cargar usuarios
  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/usuarios`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setUsuarios(data);
      setError(null);
    } catch (err) {
      setError(`Error al cargar usuarios: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear
  const abrirCrear = () => {
    setEditingId(null);
    setFormData({
      nombre: '',
      email: '',
      password: '',
      rol: 'barbero',
      estado: 'activo'
    });
    setShowModal(true);
  };

  // Abrir modal para editar
  const abrirEditar = (usuario) => {
    setEditingId(usuario.id);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      rol: usuario.rol,
      estado: usuario.estado
    });
    setShowModal(true);
  };

  // Guardar usuario
  const guardarUsuario = async (e) => {
    e.preventDefault();

    try {
      const url = editingId
        ? `${apiUrl}/api/usuarios/${editingId}`
        : `${apiUrl}/api/usuarios`;

      const method = editingId ? 'PUT' : 'POST';

      const payload = { ...formData };
      if (!editingId || !payload.password) {
        delete payload.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Error: ${response.status}`);
      }

      await cargarUsuarios();
      setShowModal(false);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Error: ${response.status}`);
      }

      await cargarUsuarios();
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="usuarios-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h1>Gestión de Usuarios</h1>
        <button className="btn-crear-usuario" onClick={abrirCrear}>
          ➕ Crear Usuario
        </button>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {usuarios.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <p>No hay usuarios registrados</p>
          <p style={{ fontSize: '14px' }}>Haz clic en "Crear Usuario" para comenzar</p>
        </div>
      ) : (
        <div className="usuarios-grid">
          {usuarios.map(usuario => (
            <div key={usuario.id} className="usuario-card">
              <div className="usuario-card-header">
                <div className="usuario-nombre">{usuario.nombre}</div>
                <span className={`usuario-rol ${usuario.rol}`}>
                  {usuario.rol}
                </span>
              </div>

              <div className="usuario-info">
                <span>📧 {usuario.email}</span>
              </div>

              <div>
                <span className={`usuario-estado ${usuario.estado}`}>
                  {usuario.estado.toUpperCase()}
                </span>
              </div>

              <div className="usuario-info" style={{ marginTop: '10px', fontSize: '12px' }}>
                <span>📅 Registrado: {usuario.fecha_registro}</span>
              </div>

              <div className="usuario-actions">
                <button
                  className="usuario-actions button btn-editar"
                  onClick={() => abrirEditar(usuario)}
                >
                  ✏️ Editar
                </button>
                <button
                  className="usuario-actions button btn-eliminar"
                  onClick={() => eliminarUsuario(usuario.id)}
                  disabled={usuario.email === 'Rodritapia92@gmail.com'}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? '✏️ Editar Usuario' : '➕ Crear Usuario'}</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={guardarUsuario}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: Juan Pérez"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej: juan@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Contraseña {editingId ? '(dejar vacío para no cambiar)' : '*'}
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingId}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="form-group">
                <label htmlFor="rol">Rol *</label>
                <select
                  id="rol"
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  required
                >
                  <option value="barbero">Barbero</option>
                  <option value="admin">Administrador</option>
                  <option value="cliente">Cliente</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="estado">Estado *</label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-guardar">
                  💾 {editingId ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}