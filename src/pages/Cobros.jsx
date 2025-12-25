import { useState, useEffect } from 'react'
import api from '../apis/api'

const Cobros = () => {
  const [cobros, setCobros] = useState([])
  const [clientes, setClientes] = useState([])
  const [barberos, setBarberos] = useState([])
  const [servicios, setServicios] = useState([])
  
  const [clienteId, setClienteId] = useState('')
  const [barberoId, setBarberoId] = useState('')
  const [servicioId, setServicioId] = useState('')
  const [monto, setMonto] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [cobrosData, clientesData, barberosData, serviciosData] = await Promise.all([
        api.getCobros(),
        api.getClientes(),
        api.getBarberos(),
        api.getServicios()
      ])
      setCobros(cobrosData)
      setClientes(clientesData)
      setBarberos(barberosData)
      setServicios(serviciosData)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!clienteId || !barberoId || !servicioId || !monto) return
    try {
      await api.createCobro({
        cliente_id: parseInt(clienteId),
        barbero_id: parseInt(barberoId),
        servicio_id: parseInt(servicioId),
        monto: parseFloat(monto)
      })
      setClienteId('')
      setBarberoId('')
      setServicioId('')
      setMonto('')
      cargarDatos()
    } catch (err) {
      console.error('Error:', err)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">💰 Cobros</h1>
      
      <div className="card">
        <h2 className="card-title">Registrar Cobro</h2>
        <form onSubmit={handleSubmit} className="form">
          <select 
            value={clienteId} 
            onChange={(e) => setClienteId(e.target.value)} 
            className="form-input"
            required
          >
            <option value="">Seleccionar cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          
          <select 
            value={barberoId} 
            onChange={(e) => setBarberoId(e.target.value)} 
            className="form-input"
            required
          >
            <option value="">Seleccionar barbero</option>
            {barberos.map((b) => (
              <option key={b.id} value={b.id}>{b.nombre}</option>
            ))}
          </select>
          
          <select 
            value={servicioId} 
            onChange={(e) => setServicioId(e.target.value)} 
            className="form-input"
            required
          >
            <option value="">Seleccionar servicio</option>
            {servicios.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre} - \${s.precio.toFixed(2)}</option>
            ))}
          </select>
          
          <input
            type="number"
            placeholder="Monto"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className="form-input"
            required
          />
          
          <button type="submit" className="btn btn-primary">Registrar Cobro</button>
        </form>
      </div>

      <div className="card">
        <h2 className="card-title">Historial de Cobros</h2>
        {cobros.length === 0 ? (
          <p className="text-secondary">No hay cobros aún</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Barbero</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {cobros.map((cobro) => {
                  const cliente = clientes.find(c => c.id === cobro.cliente_id)
                  const barbero = barberos.find(b => b.id === cobro.barbero_id)
                  return (
                    <tr key={cobro.id}>
                      <td>{cliente?.nombre || 'Desconocido'}</td>
                      <td>{barbero?.nombre || 'Desconocido'}</td>
                      <td>\${cobro.monto.toFixed(2)}</td>
                      <td>{new Date(cobro.fecha).toLocaleDateString()}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cobros