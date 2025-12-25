const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://barberia-jordan-api.onrender.com/api';

const api = {
  // Generic methods
  get: async (endpoint) => {
    const response = await fetch(API_BASE_URL + endpoint);
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return { data: await response.json() };
  },
  post: async (endpoint, data) => {
    const response = await fetch(API_BASE_URL + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return { data: await response.json() };
  },
  put: async (endpoint, data) => {
    const response = await fetch(API_BASE_URL + endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return { data: await response.json() };
  },
  delete: async (endpoint) => {
    const response = await fetch(API_BASE_URL + endpoint, { method: 'DELETE' });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return { data: await response.json() };
  },

  // Clientes
  getClientes: async () => {
    const response = await fetch(API_BASE_URL + '/clientes');
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  },
  createCliente: async (data) => {
    const response = await fetch(API_BASE_URL + '/clientes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  updateCliente: async (id, data) => {
    const response = await fetch(API_BASE_URL + '/clientes/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  deleteCliente: async (id) => {
    const response = await fetch(API_BASE_URL + '/clientes/' + id, { method: 'DELETE' });
    return await response.json();
  },

  // Barberos
  getBarberos: async () => {
    const response = await fetch(API_BASE_URL + '/barberos');
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  },
  createBarbero: async (data) => {
    const response = await fetch(API_BASE_URL + '/barberos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  deleteBarbero: async (id) => {
    const response = await fetch(API_BASE_URL + '/barberos/' + id, { method: 'DELETE' });
    return await response.json();
  },

  // Servicios
  getServicios: async () => {
    const response = await fetch(API_BASE_URL + '/servicios');
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  },
  createServicio: async (data) => {
    const response = await fetch(API_BASE_URL + '/servicios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  },
  deleteServicio: async (id) => {
    const response = await fetch(API_BASE_URL + '/servicios/' + id, { method: 'DELETE' });
    return await response.json();
  },

  // Cobros
  getCobros: async () => {
    const response = await fetch(API_BASE_URL + '/cobros');
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  },
  createCobro: async (data) => {
    const response = await fetch(API_BASE_URL + '/cobros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
};

export default api;
