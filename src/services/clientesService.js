import * as apiMethods from '../apis/api'

export const getClientes = () => apiMethods.getClientes()
export const getCliente = (id) => apiMethods.getCliente(id)
export const createCliente = (data) => apiMethods.createCliente(data)
export const updateCliente = (id, data) => apiMethods.updateCliente(id, data)
export const deleteCliente = (id) => apiMethods.deleteCliente(id)
