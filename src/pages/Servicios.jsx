import { useState, useEffect } from 'react'
import api from '../apis/api'

const Servicios = () => {
  const [servicios, setServicios] = useState([])
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [duracion, setDuracion] = useState('')

  useEffect(() => {
    cargarServicios()
  }, [])

  const cargarServicios = async () => {
    try {
      const data = await api.getServicios()
      setServicios(data)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre || !precio) return
    try {
      await api.createServicio({ 
        nombre, 
        precio: parseFloat(precio),
        duracion_minutos: duracion ? parseInt(duracion) : null
      })
      setNombre('')
      setPrecio('')
      setDuracion('')
      cargarServicios()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar servicio?')) {
      try {
        await api.deleteServicio(id)
        cargarServicios()
      } catch (err) {
        console.error('Error:', err)
      }
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">🎯 Servicios</h1>
      
      <div className="card">
        <h2 className="card-title">Agregar Servicio</h2>
        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            placeholder="Nombre del servicio"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="form-input"
            required
          />
          <input
            type="number"
            placeholder="Precio"
            step="0.01"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            className="form-input"
            required
          />
          <input
            type="number"
            placeholder="Duración (minutos)"
            value={duracion}
            onChange={(e) => setDuracion(e.target.value)}
            className="form-input"
          />
          <button type="submit" className="btn btn-primary">Agregar</button>
        </form>
      </div>

      <div className="card">
        <h2 className="card-title">Lista de Servicios</h2>
        {servicios.length === 0 ? (
          <p className="text-secondary">No hay servicios aún</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Precio</th>
                  <th>Duración</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {servicios.map((servicio) => (
                  <tr key={servicio.id}>
                    <td>{servicio.nombre}</td>
                    <td>\${servicio.precio.toFixed(2)}</td>
                    <td>{servicio.duracion_minutos ? servicio.duracion_minutos + ' min' : '-'}</td>
                    <td>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDelete(servicio.id)}
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

export default Servicios