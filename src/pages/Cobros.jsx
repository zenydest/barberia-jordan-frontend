import { useState, useEffect } from 'react'
import {
  getCobros,
  createCobro,
  getClientes,
  getBarberos,
  getServicios,
} from '../apis/api'

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
      const [cobrosRes, clientesRes, barberosRes, serviciosRes] =
        await Promise.all([
          getCobros(),
          getClientes(),
          getBarberos(),
          getServicios(),
        ])

      setCobros(cobrosRes.data)
      setClientes(clientesRes.data)
      setBarberos(barberosRes.data)
      setServicios(serviciosRes.data)
    } catch (err) {
      console.error('Error al cargar datos:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!clienteId || !barberoId || !servicioId || !monto) return
    try {
      await createCobro({
        cliente_id: parseInt(clienteId),
        barbero_id: parseInt(barberoId),
        servicio_id: parseInt(servicioId),
        monto: parseFloat(monto),
      })
      setClienteId('')
      setBarberoId('')
      setServicioId('')
      setMonto('')
      cargarDatos()
    } catch (err) {
      console.error('Error al crear cobro:', err)
    }
  }

  return (
    <>
      {/* aquí mantienes tu JSX original de Cobros (form + tabla),
          usando cobros, clientes, barberos, servicios, etc. */}
    </>
  )
}

export default Cobros
