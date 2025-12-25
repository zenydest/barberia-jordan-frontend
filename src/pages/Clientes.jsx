import { useState, useEffect } from 'react'
import api from '../apis/api'

const Clientes = () => {
  const [clientes, setClientes] = useState([])
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    cargarClientes()
  }, [])

  const cargarClientes = async () => {
    try {
      const data = await api.getClientes()
      setClientes(data)
    } catch (err) {
      console.error('Error cargando clientes:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre) return
    
    try {
      await api.createCliente({ nombre, telefono, email })
      setNombre('')
      setTelefono('')
      setEmail('')
      cargarClientes()
    } catch (err) {
      console.error('Error creando cliente:', err)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar cliente?')) {
      try {
        await api.deleteCliente(id)
        cargarClientes()
      } catch (err) {
        console.error('Error eliminando cliente:', err)
      }
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">👥 Clientes</h1>
      
      <div className="card">
        <h2 className="card-title">Agregar Cliente</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="form-input"
            required
          />
          <input
            type="tel"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="form-input"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
          />
          <button type="submit" className="btn btn-primary">Agregar</button>
        </form>
      </div>

      <div className="card">
        <h2 className="card-title">Lista de Clientes</h2>
        {clientes.length === 0 ? (
          <p className="text-secondary">No hay clientes aún</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.nombre}</td>
                    <td>{cliente.telefono || '-'}</td>
                    <td>{cliente.email || '-'}</td>
                    <td>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDelete(cliente.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Clientes