import React, { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Barberos from './components/Barberos';
import Clientes from './components/Clientes';
import Servicios from './components/Servicios';
import Citas from './components/Citas';
import Reportes from './components/Reportes';



function AppContent() {
  const { isAuthenticated, user, authLoading } = useContext(AuthContext);
  const [currentPage, setCurrentPage] = React.useState('dashboard');


  // Mientras carga la sesión
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-300 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }


  // Si no está autenticado, muestra login
  if (!isAuthenticated) {
    return <Login />;
  }


  // Si está autenticado, muestra el dashboard
  return (
    <ProtectedRoute>
      <div className="flex">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} usuario={user} />
        
        <main className="flex-1">
          {currentPage === 'dashboard' && <Dashboard />}
          {currentPage === 'barberos' && user?.rol === 'admin' && <Barberos />}
          {currentPage === 'clientes' && <Clientes />}
          {currentPage === 'servicios' && user?.rol === 'admin' && <Servicios />}
          {currentPage === 'precios' && <Citas />}
          {currentPage === 'reportes' && <Reportes />}
        </main>
      </div>
    </ProtectedRoute>
  );
}



export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}