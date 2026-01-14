import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

console.log('🔄 BARBEROS.JSX IMPORTADO');

export default function Barberos() {
  console.log('🏢 Barberos() EJECUTÁNDOSE');
  
  const { token, authLoading } = useAuth();
  console.log('📍 useAuth():', { token: token ? 'SÍ' : 'NO', authLoading });
  
  const [barberos, setBarberos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const cargarBarberos = async () => {
    try {
      console.log('🔄 Cargando barberos...');
      setLoading(true);
      setError('');
      
      const res = await axios.get('/api/barberos');
      console.log('✅ Barberos cargados:', res.data);
      setBarberos(res.data);
    } catch (err) {
      console.error('❌ Error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Error al cargar');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    console.log('⏱️ useEffect ejecutándose', { authLoading, token: token ? 'SÍ' : 'NO' });
    
    if (authLoading) {
      console.log('⏳ Esperando auth...');
      return;
    }
    
    if (!token) {
      console.log('❌ Sin token');
      return;
    }
    
    console.log('✅ Cargando barberos...');
    cargarBarberos();
  }, [authLoading, token]);
  
  return (
    <div style={{ padding: '20px' }}>
      <h2>💈 Barberos</h2>
      
      {process.env.NODE_ENV === 'development' && (
        <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px', borderRadius: '4px', fontSize: '12px' }}>
          <p>Auth Loading: {String(authLoading)}</p>
          <p>Token: {token ? 'SÍ' : 'NO'}</p>
          <p>Barberos: {barberos.length}</p>
          <p>Loading: {String(loading)}</p>
          <p>Error: {error || 'Ninguno'}</p>
        </div>
      )}
      
      {authLoading && <p>⏳ Autenticando...</p>}
      {error && <p style={{ color: 'red' }}>❌ {error}</p>}
      
      {!authLoading && (
        <>
          <h3>Barberos ({barberos.length})</h3>
          {loading ? (
            <p>Cargando...</p>
          ) : barberos.length === 0 ? (
            <p>No hay barberos</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #333' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Email</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Teléfono</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Comisión</th>
                </tr>
              </thead>
              <tbody>
                {barberos.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px' }}>{b.nombre}</td>
                    <td style={{ padding: '8px' }}>{b.email || '-'}</td>
                    <td style={{ padding: '8px' }}>{b.telefono || '-'}</td>
                    <td style={{ padding: '8px' }}>{b.comision}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}
