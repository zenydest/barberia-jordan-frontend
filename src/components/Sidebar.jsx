import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import logo from '../assets/logo-jordan.png';

export default function Sidebar({ currentPage, setCurrentPage, usuario }) {
  const { logout } = useContext(AuthContext);

  const menuItems = [
    { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
    ...(usuario?.rol === 'administrador' ? [
      { id: 'barberos', label: '💈 Barberos', icon: '💈' },
      { id: 'servicios', label: '✂️ Servicios', icon: '✂️' }
    ] : []),
    { id: 'clientes', label: '👥 Clientes', icon: '👥' },
    { id: 'precios', label: '📅 Citas', icon: '📅' },
    { id: 'reportes', label: '📈 Reportes', icon: '📈' }
  ];

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-xl z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-12 h-12 rounded-full" />
          <div>
            <h1 className="font-bold text-lg">Barberia Jordan</h1>
            <p className="text-xs text-gray-400">v1.0</p>
          </div>
        </div>
      </div>

      {/* Usuario Info */}
      <div className="px-4 py-4 bg-gray-800 border-b border-gray-700">
        <p className="text-xs text-gray-400">Conectado como:</p>
        <p className="font-semibold text-sm">{usuario?.nombre}</p>
        <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-bold ${
          usuario?.rol === 'administrador' 
            ? 'bg-red-500 text-white' 
            : 'bg-blue-500 text-white'
        }`}>
          {usuario?.rol === 'administrador' ? '👑 Admin' : '💼 Barbero'}
        </span>
      </div>

      {/* Menu */}
      <nav className="mt-4 space-y-2 px-3">
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              currentPage === item.id
                ? 'bg-yellow-400 text-gray-900 font-bold'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-6 left-3 right-3">
        <button
          onClick={logout}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
        >
          🚪 Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
