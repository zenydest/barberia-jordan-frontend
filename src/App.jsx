import React, { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Barberos from './components/Barberos';
import Clientes from './components/Clientes';
import Servicios from './components/Servicios';
import Citas from './components/Citas';
import Reportes from './components/Reportes';

function AppContent() {
  const { isAutenticado, usuario } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  if (!isAutenticado) {
    return <Login />;
  }

  return (
    <div className="flex">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} usuario={usuario} />
      
      <main className="flex-1">
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'barberos' && usuario?.rol === 'admin' && <Barberos />}
        {currentPage === 'clientes' && <Clientes />}
        {currentPage === 'servicios' && usuario?.rol === 'admin' && <Servicios />}
        {currentPage === 'precios' && <Citas />}
        {currentPage === 'reportes' && <Reportes />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
