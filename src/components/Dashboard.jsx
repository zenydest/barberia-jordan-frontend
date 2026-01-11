import React, { useState, useEffect, useContext } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AuthContext } from '../context/AuthContext';

import API_URL from '../config.js';


export default function Dashboard() {
  const { axios } = useContext(AuthContext);
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [axios]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [citasRes, clientesRes, barberosRes, serviciosRes] = await Promise.all([
        axios.get(`${API_URL}/citas`),
        axios.get(`${API_URL}/clientes`),
        axios.get(`${API_URL}/barberos`),
        axios.get(`${API_URL}/servicios`)
      ]);
      
      setCitas(citasRes.data);
      setClientes(clientesRes.data);
      setBarberos(barberosRes.data);
      setServicios(serviciosRes.data);
      setError('');
    } catch (err) {
      setError('Error al cargar datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calcular comisiones
  const calcularComisiones = () => {
    let totalIngresos = 0;
    let totalComisionBarberos = 0;
    let totalComisionDueno = 0;

    citas.forEach(cita => {
      const barbero = barberos.find(b => b.id === cita.barbero_id);
      const comisionBarbero = barbero ? (cita.precio * barbero.comision) / 100 : 0;
      const comisionDueno = (cita.precio * 45) / 100;

      totalIngresos += cita.precio;
      totalComisionBarberos += comisionBarbero;
      totalComisionDueno += comisionDueno;
    });

    return {
      totalIngresos,
      totalComisionBarberos,
      totalComisionDueno,
      gananciaNetaDueno: totalIngresos - totalComisionBarberos - totalComisionDueno
    };
  };

  const comisiones = calcularComisiones();

  // Calcular estadísticas reales
  const stats = [
    { 
      label: 'Clientes Totales', 
      value: clientes.length.toString(), 
      change: '+0%', 
      color: 'bg-yellow-100', 
      textColor: 'text-yellow-600' 
    },
    { 
      label: 'Ingresos Totales', 
      value: `$${comisiones.totalIngresos.toFixed(2)}`, 
      change: '+0%', 
      color: 'bg-orange-100', 
      textColor: 'text-orange-600' 
    },
    { 
      label: 'Citas Registradas', 
      value: citas.length.toString(), 
      change: '+0%', 
      color: 'bg-red-100', 
      textColor: 'text-red-600' 
    },
    { 
      label: 'Barberos Activos', 
      value: barberos.length.toString(), 
      change: '100%', 
      color: 'bg-green-100', 
      textColor: 'text-green-600' 
    },
  ];

  // Ingresos mensuales reales
  const getRevenueData = () => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const ingresos = new Array(12).fill(0);
    
    citas.forEach(cita => {
      const fecha = new Date(cita.fecha);
      const mes = fecha.getMonth();
      ingresos[mes] += cita.precio;
    });

    return meses.map((name, idx) => ({
      name,
      ingresos: ingresos[idx]
    }));
  };

  // Servicios más solicitados
  const getServiciosData = () => {
    const serviciosCount = {};
    citas.forEach(cita => {
      serviciosCount[cita.servicio] = (serviciosCount[cita.servicio] || 0) + 1;
    });

    const colores = ['#FDB913', '#FF8C42', '#E63946', '#2D3436', '#1E90FF'];
    return Object.entries(serviciosCount)
      .map(([name, value], idx) => ({
        name,
        value,
        fill: colores[idx % colores.length]
      }));
  };

  // Citas por día de la semana
  const getCitasData = () => {
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab', 'Dom'];
    const conteo = new Array(7).fill(0);
    
    citas.forEach(cita => {
      const fecha = new Date(cita.fecha);
      const dia = fecha.getDay();
      conteo[dia === 0 ? 6 : dia - 1]++;
    });

    return dias.map((name, idx) => ({
      name,
      citas: conteo[idx]
    }));
  };

  const revenueData = getRevenueData();
  const serviciosData = getServiciosData();
  const citasData = getCitasData();

  if (loading) {
    return (
      <main className="ml-64 mt-16 p-8 bg-gradient-to-br from-white to-yellow-50 min-h-screen">
        <div className="text-center py-20 text-gray-500">⏳ Cargando datos...</div>
      </main>
    );
  }

  return (
    <main className="ml-64 mt-16 p-8 bg-gradient-to-br from-white to-yellow-50 min-h-screen">
      {/* Título */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 mt-2">Bienvenido al sistema de gestión de Barberia Jordan</p>
      </div>

      {/* Error si existe */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          ❌ {error}
        </div>
      )}

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md border-t-4 border-yellow-300 p-6 hover:shadow-lg transition-shadow">
            <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-2xl`}>
              {idx === 0 && '👥'}
              {idx === 1 && '💰'}
              {idx === 2 && '📅'}
              {idx === 3 && '💈'}
            </div>
            <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
              <span className={`text-xs font-semibold ${stat.textColor}`}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tarjetas de comisiones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Comisión Barberos */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md border-t-4 border-blue-500 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-medium text-sm">Comisión Barberos</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-2">${comisiones.totalComisionBarberos.toFixed(2)}</h3>
              <p className="text-blue-600 text-xs mt-2">💈 A pagar a barberos</p>
            </div>
            <div className="text-5xl">💵</div>
          </div>
        </div>

        {/* Comisión Dueño */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md border-t-4 border-green-500 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-medium text-sm">Comisión Dueño (45%)</p>
              <h3 className="text-3xl font-bold text-green-600 mt-2">${comisiones.totalComisionDueno.toFixed(2)}</h3>
              <p className="text-green-600 text-xs mt-2">👨‍💼 Para el negocio</p>
            </div>
            <div className="text-5xl">💎</div>
          </div>
        </div>

        {/* Ganancia Neta */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md border-t-4 border-purple-500 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-medium text-sm">Ganancia Neta Dueño</p>
              <h3 className="text-3xl font-bold text-purple-600 mt-2">${comisiones.gananciaNetaDueno.toFixed(2)}</h3>
              <p className="text-purple-600 text-xs mt-2">✅ Después de comisiones</p>
            </div>
            <div className="text-5xl">🎯</div>
          </div>
        </div>
      </div>

      {/* Tabla desglose de comisiones */}
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-yellow-300 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Desglose de Comisiones</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 border-b-2 border-yellow-300">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Concepto</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Monto</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700">Porcentaje</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200 hover:bg-yellow-50 transition">
                <td className="px-4 py-3 font-medium text-gray-800">Total de Ingresos</td>
                <td className="px-4 py-3 text-right font-bold text-orange-600">${comisiones.totalIngresos.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-bold text-gray-700">100%</td>
              </tr>
              <tr className="border-b border-gray-200 bg-blue-50 hover:bg-blue-100 transition">
                <td className="px-4 py-3 font-medium text-blue-700">💈 Comisión Barberos</td>
                <td className="px-4 py-3 text-right font-bold text-blue-600">${comisiones.totalComisionBarberos.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-bold text-blue-700">
                  {comisiones.totalIngresos > 0 ? ((comisiones.totalComisionBarberos / comisiones.totalIngresos) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="border-b border-gray-200 bg-green-50 hover:bg-green-100 transition">
                <td className="px-4 py-3 font-medium text-green-700">👨‍💼 Comisión Dueño (45%)</td>
                <td className="px-4 py-3 text-right font-bold text-green-600">${comisiones.totalComisionDueno.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-bold text-green-700">45%</td>
              </tr>
              <tr className="bg-purple-50 hover:bg-purple-100 transition">
                <td className="px-4 py-3 font-bold text-purple-700">✅ Ganancia Neta Dueño</td>
                <td className="px-4 py-3 text-right font-bold text-purple-600">${comisiones.gananciaNetaDueno.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-bold text-purple-700">
                  {comisiones.totalIngresos > 0 ? ((comisiones.gananciaNetaDueno / comisiones.totalIngresos) * 100).toFixed(1) : 0}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gráfico de Ingresos */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-300">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Ingresos Mensuales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FDB913" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FDB913" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #FDB913' }} />
              <Area 
                type="monotone" 
                dataKey="ingresos" 
                stroke="#FDB913" 
                fillOpacity={1} 
                fill="url(#colorIngresos)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Servicios */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-300">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Servicios Más Solicitados</h3>
          {serviciosData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviciosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviciosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} citas`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-20 text-gray-500">
              📭 Sin datos de servicios
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de Citas por día */}
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-yellow-300 mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Citas por Día de la Semana</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={citasData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" stroke="#999" />
            <YAxis stroke="#999" />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #FF8C42' }} />
            <Bar dataKey="citas" fill="#FF8C42" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla de registros recientes */}
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">Registros Recientes</h3>
          <a href="#citas" className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-gray-800 font-semibold rounded-lg transition">
            Ver Todos →
          </a>
        </div>

        {citas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-yellow-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Cliente</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Servicio</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Barbero</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Monto</th>
                </tr>
              </thead>
              <tbody>
                {citas.slice(0, 5).map((registro) => (
                  <tr key={registro.id} className="border-b border-gray-200 hover:bg-yellow-50 transition">
                    <td className="px-4 py-3 text-gray-800">{registro.cliente}</td>
                    <td className="px-4 py-3 text-gray-600">{registro.servicio}</td>
                    <td className="px-4 py-3 text-gray-600">{registro.barbero}</td>
                    <td className="px-4 py-3 text-gray-600">{registro.fecha.split(' ')[0]}</td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600">${registro.precio.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            📭 No hay citas registradas
          </div>
        )}
      </div>
    </main>
  );
}
