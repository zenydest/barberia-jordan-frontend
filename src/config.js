const API_URL = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5000/api'
  : 'https://web-production-ae8e1.up.railway.app/api';

export default API_URL;

