import { useState, useEffect } from 'react'
import * as clientesService from '../services/clientesService'

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
      const response = await clientesService.getClientes()
      setClientes(response.data)  // ⚠️ IMPORTANTE: axios devuelve data en response.data
    } catch (err) {
      console.error('Error cargando clientes:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre) return
    try {
      await clientesService.createCliente({ nombre, telefono, email })
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
        await clientesService.deleteCliente(id)
        cargarClientes()
      } catch (err) {
        console.error('Error eliminando cliente:', err)
      }
    }
  }

  // ... resto del JSX
}

export default Clientes
