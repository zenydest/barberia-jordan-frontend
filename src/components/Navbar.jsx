import React from 'react';
import logo from '../assets/logo-jordan.png';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 border-b-4 border-yellow-300 shadow-2xl fixed w-full top-0 z-50">
      <div className="flex items-center justify-between px-6 py-3 max-w-7xl mx-auto">
        {/* Logo y nombre */}
        <div className="flex items-center gap-4">
          <img 
            src={logo} 
            alt="Barberia Jordan" 
            className="h-12 w-12 object-contain"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">Barberia Jordan</h1>
            <p className="text-xs text-yellow-300 font-medium">Sistema de Gestión Digital</p>
          </div>
        </div>

        {/* Botones derecha */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full bg-yellow-300 hover:bg-yellow-400 transition shadow-md hover:shadow-lg text-gray-800 font-bold">
            🔔
          </button>
          <button className="p-2 rounded-full bg-yellow-300 hover:bg-yellow-400 transition shadow-md hover:shadow-lg text-gray-800 font-bold">
            👤
          </button>
        </div>
      </div>
    </nav>
  );
}
