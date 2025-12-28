import { useState, useEffect } from 'react'
import { getBarberos, createBarbero, deleteBarbero } from '../apis/api'

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
      const res = await getBarberos()
      setBarberos(res.data)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre) return
    try {
      await createBarbero({ nombre, email, telefono })
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
        await deleteBarbero(id)
        cargarBarberos()
      } catch (err) {
        console.error('Error:', err)
      }
    }
  }

  return (
    <>
      {/* deja aquí tu JSX original de Barberos (formulario + lista/tabla)
          usando barberos, handleSubmit, handleDelete, nombre, email, telefono */}
    </>
  )
}

export default Barberos
