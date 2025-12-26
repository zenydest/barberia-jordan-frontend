// frontend/src/apis/api.js

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://barberia-jordan-api.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

// Métodos para Cobros
export const getCobros = () => api.get('/cobros')
export const getCobro = (id) => api.get(`/cobros/${id}`)
export const createCobro = (data) => api.post('/cobros', data)
export const updateCobro = (id, data) => api.put(`/cobros/${id}`, data)
export const deleteCobro = (id) => api.delete(`/cobros/${id}`)

// Métodos para Clientes
export const getClientes = () => api.get('/clientes')
export const getCliente = (id) => api.get(`/clientes/${id}`)
export const createCliente = (data) => api.post('/clientes', data)
export const updateCliente = (id, data) => api.put(`/clientes/${id}`, data)
export const deleteCliente = (id) => api.delete(`/clientes/${id}`)

// Métodos para Barberos
export const getBarberos = () => api.get('/barberos')
export const getBarbero = (id) => api.get(`/barberos/${id}`)
export const createBarbero = (data) => api.post('/barberos', data)
export const updateBarbero = (id, data) => api.put(`/barberos/${id}`, data)
export const deleteBarbero = (id) => api.delete(`/barberos/${id}`)

// Métodos para Servicios
export const getServicios = () => api.get('/servicios')
export const getServicio = (id) => api.get(`/servicios/${id}`)
export const createServicio = (data) => api.post('/servicios', data)
export const updateServicio = (id, data) => api.put(`/servicios/${id}`, data)
export const deleteServicio = (id) => api.delete(`/servicios/${id}`)

// Métodos para Reportes
export const getReporteDiario = () => api.get('/reportes/diario')
export const getReporteMensual = () => api.get('/reportes/mensual')
export const getReporteSemanal = () => api.get('/reportes/semanal')
export const getReportePorBarbero = () => api.get('/reportes/por-barbero')

// Exportar
export const exportarReporte = (params) => {
  const queryString = new URLSearchParams(params).toString()
  return api.get(`/exportar/generar?${queryString}`, { responseType: 'blob' })
}

export default api
