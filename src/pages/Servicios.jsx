import { useState, useEffect } from 'react'
import { getServicios, createServicio, deleteServicio } from '../apis/api'

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
      const res = await getServicios()
      setServicios(res.data)
    } catch (err) {
      console.error('Error:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nombre || !precio) return
    try {
      await createServicio({
        nombre,
        precio: parseFloat(precio),
        duracion_minutos: duracion ? parseInt(duracion) : null,
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
        await deleteServicio(id)
        cargarServicios()
      } catch (err) {
        console.error('Error:', err)
      }
    }
  }

  return (
    <>
      {/* aquí pegas el JSX original de Servicios (formulario + tabla),
          usando servicios, handleSubmit, handleDelete, nombre, precio, duracion */}
    </>
  )
}

export default Servicios
