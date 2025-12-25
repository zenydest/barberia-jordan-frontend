import { useState, useEffect } from 'react'
import api from '../apis/api'

const Barberos = () => {
  const [barberos, setBarberos] = useState([])
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')

  useEffect(() => {
    cargarBarberos()
  }, [])

  const cargarBarberos = async () => {
    try {
      const data = await api.getBarberos()
      setBarberos(data)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre) return
    try {
      await api.createBarbero({ nombre, email, telefono })
      setNombre('')
      setEmail('')
      setTelefono('')
      cargarBarberos()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar barbero?')) {
      try {
        await api.deleteBarbero(id)
        cargarBarberos()
      } catch (err) {
        console.error('Error:', err)
      }
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">✂️ Barberos</h1>
      
      <div className="card">
        <h2 className="card-title">Agregar Barbero</h2>
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
        <h2 className="card-title">Lista de Barberos</h2>
        {barberos.length === 0 ? (
          <p className="text-secondary">No hay barberos aún</p>
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
                {barberos.map((barbero) => (
                  <tr key={barbero.id}>
                    <td>{barbero.nombre}</td>
                    <td>{barbero.telefono || '-'}</td>
                    <td>{barbero.email || '-'}</td>
                    <td>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDelete(barbero.id)}
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

export default Barberos