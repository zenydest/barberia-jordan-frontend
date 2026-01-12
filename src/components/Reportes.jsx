import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import logo from '../assets/logo-jordan.png';


export default function Reportes() {
  const { axios, token } = useContext(AuthContext);
  const [citas, setCitas] = useState([]);
  const [barberos, setBarberos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [filtros, setFiltros] = useState({
    barbero_id: '',
    cliente_id: '',
    fecha_inicio: '',
    fecha_fin: ''
  });

  useEffect(() => {
    if (!token) return;
    cargarDatos();
  }, [token]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [citasRes, barberosRes, clientesRes] = await Promise.all([
        axios.get(`/citas`),
        axios.get(`/barberos`),
        axios.get(`/clientes`)
      ]);
      
      setCitas(citasRes.data);
      setBarberos(barberosRes.data);
      setClientes(clientesRes.data);
      setError('');
    } catch (err) {
      setError('Error al cargar datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calcular comisiones para una cita
  const calcularComisiones = (cita) => {
    const barbero = barberos.find(b => b.id === cita.barbero_id);
    const comisionBarbero = barbero ? (cita.precio * barbero.comision) / 100 : 0;
    const comisionDueno = (cita.precio * 45) / 100;
    const gananciaNeta = cita.precio - comisionBarbero - comisionDueno;

    return {
      comisionBarbero,
      comisionDueno,
      gananciaNeta
    };
  };

  // Filtrar citas según los filtros
  const citasFiltradas = citas.filter(cita => {
    let cumple = true;

    if (filtros.barbero_id && cita.barbero_id !== parseInt(filtros.barbero_id)) {
      cumple = false;
    }

    if (filtros.cliente_id && cita.cliente_id !== parseInt(filtros.cliente_id)) {
      cumple = false;
    }

    if (filtros.fecha_inicio) {
      const fechaCita = new Date(cita.fecha);
      const fechaInicio = new Date(filtros.fecha_inicio);
      if (fechaCita < fechaInicio) {
        cumple = false;
      }
    }

    if (filtros.fecha_fin) {
      const fechaCita = new Date(cita.fecha);
      const fechaFin = new Date(filtros.fecha_fin);
      if (fechaCita > fechaFin) {
        cumple = false;
      }
    }

    return cumple;
  });

  // Calcular estadísticas
  const estadisticas = {
    totalCitas: citasFiltradas.length,
    totalIngresos: citasFiltradas.reduce((sum, cita) => sum + cita.precio, 0),
    totalComisionBarberos: citasFiltradas.reduce((sum, cita) => sum + calcularComisiones(cita).comisionBarbero, 0),
    totalComisionDueno: citasFiltradas.reduce((sum, cita) => sum + calcularComisiones(cita).comisionDueno, 0),
    gananciaNetaDueno: citasFiltradas.reduce((sum, cita) => sum + calcularComisiones(cita).gananciaNeta, 0),
    promedioPorCita: citasFiltradas.length > 0 
      ? (citasFiltradas.reduce((sum, cita) => sum + cita.precio, 0) / citasFiltradas.length).toFixed(2)
      : 0
  };

  // Estadísticas por barbero
  const estadisticasPorBarbero = {};
  citasFiltradas.forEach(cita => {
    if (!estadisticasPorBarbero[cita.barbero]) {
      estadisticasPorBarbero[cita.barbero] = { 
        citas: 0, 
        ingresos: 0,
        comisionBarbero: 0,
        comisionDueno: 0,
        gananciaNeta: 0,
        barbero_id: cita.barbero_id
      };
    }
    const comisiones = calcularComisiones(cita);
    estadisticasPorBarbero[cita.barbero].citas++;
    estadisticasPorBarbero[cita.barbero].ingresos += cita.precio;
    estadisticasPorBarbero[cita.barbero].comisionBarbero += comisiones.comisionBarbero;
    estadisticasPorBarbero[cita.barbero].comisionDueno += comisiones.comisionDueno;
    estadisticasPorBarbero[cita.barbero].gananciaNeta += comisiones.gananciaNeta;
  });

  // Exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    
    const colorAmarillo = [253, 185, 19];
    const colorGris = [45, 52, 54];
    
    try {
      doc.addImage(logo, 'JPEG', 14, 10, 30, 20);
    } catch (e) {
      console.log('Logo no encontrado');
    }
    
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colorGris);
    doc.text('BARBERIA JORDAN', 50, 20);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Sistema de Gestión Digital', 50, 28);
    
    doc.setDrawColor(...colorAmarillo);
    doc.setLineWidth(0.5);
    doc.line(14, 35, 196, 35);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colorGris);
    doc.text('REPORTE DE CITAS Y COMISIONES', 14, 45);
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-AR')}`, 14, 52);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colorGris);
    doc.text('RESUMEN GENERAL', 14, 65);
    
    const cajaY = 72;
    const cajaAltura = 16;
    const cajaAncho = 40;
    
    // Caja 1
    doc.setFillColor(253, 185, 19);
    doc.rect(14, cajaY, cajaAncho, cajaAltura, 'F');
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colorGris);
    doc.text('Total Citas', 16, cajaY + 4);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text(estadisticas.totalCitas.toString(), 16, cajaY + 12);
    
    // Caja 2
    doc.setFillColor(255, 200, 100);
    doc.rect(14 + cajaAncho + 3, cajaY, cajaAncho, cajaAltura, 'F');
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colorGris);
    doc.text('Total Ingresos', 18 + cajaAncho, cajaY + 4);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text(`$${estadisticas.totalIngresos.toFixed(2)}`, 18 + cajaAncho, cajaY + 12);
    
    // Caja 3
    doc.setFillColor(100, 150, 255);
    doc.rect(14 + (cajaAncho + 3) * 2, cajaY, cajaAncho, cajaAltura, 'F');
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Com. Barberos', 18 + (cajaAncho + 3) * 2, cajaY + 4);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text(`$${estadisticas.totalComisionBarberos.toFixed(2)}`, 18 + (cajaAncho + 3) * 2, cajaY + 12);
    
    // Caja 4
    doc.setFillColor(100, 200, 100);
    doc.rect(14 + (cajaAncho + 3) * 3, cajaY, cajaAncho, cajaAltura, 'F');
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Com. Dueño (45%)', 18 + (cajaAncho + 3) * 3, cajaY + 4);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text(`$${estadisticas.totalComisionDueno.toFixed(2)}`, 18 + (cajaAncho + 3) * 3, cajaY + 12);
    
    // Caja 5 - Ganancia Neta
    doc.setFillColor(200, 100, 255);
    doc.rect(14, cajaY + cajaAltura + 2, 180, cajaAltura, 'F');
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('GANANCIA NETA DUEÑO', 16, cajaY + cajaAltura + 5);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(13);
    doc.text(`$${estadisticas.gananciaNetaDueno.toFixed(2)}`, 16, cajaY + cajaAltura + 14);
    
    // Tabla
    const tableData = citasFiltradas.map(cita => {
      const comisiones = calcularComisiones(cita);
      return [
        cita.cliente,
        cita.barbero,
        cita.servicio,
        `$${cita.precio.toFixed(2)}`,
        `$${comisiones.comisionBarbero.toFixed(2)}`,
        `$${comisiones.comisionDueno.toFixed(2)}`,
        `$${comisiones.gananciaNeta.toFixed(2)}`,
        new Date(cita.fecha).toLocaleDateString('es-AR')
      ];
    });

    autoTable(doc, {
      head: [['Cliente', 'Barbero', 'Servicio', 'Precio', 'Com. Barbero', 'Com. Dueño', 'Ganancia Neta', 'Fecha']],
      body: tableData,
      startY: 110,
      headStyles: {
        fillColor: colorAmarillo,
        textColor: colorGris,
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: {
        textColor: colorGris,
        fontSize: 8
      },
      alternateRowStyles: {
        fillColor: [255, 248, 235]
      },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { halign: 'left', cellWidth: 18 },
        1: { halign: 'left', cellWidth: 16 },
        2: { halign: 'left', cellWidth: 16 },
        3: { halign: 'right', cellWidth: 14 },
        4: { halign: 'right', cellWidth: 16 },
        5: { halign: 'right', cellWidth: 16 },
        6: { halign: 'right', cellWidth: 16 },
        7: { halign: 'center', cellWidth: 14 }
      }
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${pageCount}`, 190, 285, { align: 'right' });
      doc.text('Barberia Jordan © 2026', 14, 285);
    }

    doc.save(`Reporte_Comisiones_${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}.pdf`);
  };

  // Exportar a Excel
  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();
    
    // HOJA 1: RESUMEN
    const resumenData = [
      ['BARBERIA JORDAN'],
      ['RESUMEN DE REPORTE'],
      ['Fecha', new Date().toLocaleDateString('es-AR')],
      [''],
      ['ESTADÍSTICAS PRINCIPALES', 'Valor'],
      ['Total de Citas', estadisticas.totalCitas],
      ['Total de Ingresos', `$${estadisticas.totalIngresos.toFixed(2)}`],
      ['Comisión Barberos', `$${estadisticas.totalComisionBarberos.toFixed(2)}`],
      ['Comisión Dueño (45%)', `$${estadisticas.totalComisionDueno.toFixed(2)}`],
      ['Ganancia Neta Dueño', `$${estadisticas.gananciaNetaDueno.toFixed(2)}`],
      [''],
      ['ESTADÍSTICAS POR BARBERO', '', '', '', '', ''],
      ['Barbero', 'Citas', 'Ingresos', 'Com. Barbero', 'Com. Dueño', 'Ganancia Neta']
    ];
    
    Object.entries(estadisticasPorBarbero).forEach(([barbero, datos]) => {
      resumenData.push([
        barbero, 
        datos.citas, 
        `$${datos.ingresos.toFixed(2)}`,
        `$${datos.comisionBarbero.toFixed(2)}`,
        `$${datos.comisionDueno.toFixed(2)}`,
        `$${datos.gananciaNeta.toFixed(2)}`
      ]);
    });
    
    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    wsResumen['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
    
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');
    
    // HOJA 2: DETALLE DE CITAS
    const datosExcel = citasFiltradas.map(cita => {
      const comisiones = calcularComisiones(cita);
      return {
        'Cliente': cita.cliente,
        'Barbero': cita.barbero,
        'Servicio': cita.servicio,
        'Precio': cita.precio,
        'Com. Barbero': comisiones.comisionBarbero.toFixed(2),
        'Com. Dueño (45%)': comisiones.comisionDueno.toFixed(2),
        'Ganancia Neta': comisiones.gananciaNeta.toFixed(2),
        'Fecha': new Date(cita.fecha).toLocaleDateString('es-AR'),
        'Notas': cita.notas || '-'
      };
    });

    const wsDetalle = XLSX.utils.json_to_sheet(datosExcel);
    wsDetalle['!cols'] = [
      { wch: 20 },
      { wch: 16 },
      { wch: 16 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 20 }
    ];
    
    XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle');
    
    // HOJA 3: ESTADÍSTICAS
    const statsData = [
      ['ESTADÍSTICAS POR BARBERO'],
      ['Barbero', 'Citas', 'Ingresos', 'Com. Barbero', 'Com. Dueño', 'Ganancia Neta', 'Promedio'],
      ...Object.entries(estadisticasPorBarbero).map(([barbero, datos]) => [
        barbero,
        datos.citas,
        datos.ingresos.toFixed(2),
        datos.comisionBarbero.toFixed(2),
        datos.comisionDueno.toFixed(2),
        datos.gananciaNeta.toFixed(2),
        (datos.ingresos / datos.citas).toFixed(2)
      ])
    ];
    
    const wsStats = XLSX.utils.aoa_to_sheet(statsData);
    wsStats['!cols'] = [{ wch: 22 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];
    
    XLSX.utils.book_append_sheet(wb, wsStats, 'Estadísticas');

    XLSX.writeFile(wb, `Reporte_Comisiones_${new Date().toLocaleDateString('es-AR').replace(/\//g, '-')}.xlsx`);
  };

  const limpiarFiltros = () => {
    setFiltros({
      barbero_id: '',
      cliente_id: '',
      fecha_inicio: '',
      fecha_fin: ''
    });
  };

  return (
    <main className="ml-64 mt-16 p-8 bg-gradient-to-br from-white to-yellow-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">📈 Reportes de Comisiones</h2>
        <p className="text-gray-500 mt-2">Analiza las citas, comisiones y ganancias de tu barberia</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          ❌ {error}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-t-4 border-yellow-300">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🔍 Filtros</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Barbero</label>
            <select
              name="barbero_id"
              value={filtros.barbero_id}
              onChange={handleFiltroChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
            >
              <option value="">Todos los barberos</option>
              {barberos.map(barbero => (
                <option key={barbero.id} value={barbero.id}>
                  {barbero.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Cliente</label>
            <select
              name="cliente_id"
              value={filtros.cliente_id}
              onChange={handleFiltroChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
            >
              <option value="">Todos los clientes</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Inicio</label>
            <input
              type="date"
              name="fecha_inicio"
              value={filtros.fecha_inicio}
              onChange={handleFiltroChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha Fin</label>
            <input
              type="date"
              name="fecha_fin"
              value={filtros.fecha_fin}
              onChange={handleFiltroChange}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-300 transition"
            />
          </div>
        </div>

        <button
          onClick={limpiarFiltros}
          className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-lg transition"
        >
          🔄 Limpiar Filtros
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md border-t-4 border-yellow-300 p-6">
          <p className="text-gray-600 text-sm font-medium">Total de Citas</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-2">{estadisticas.totalCitas}</h3>
        </div>

        <div className="bg-white rounded-lg shadow-md border-t-4 border-orange-300 p-6">
          <p className="text-gray-600 text-sm font-medium">Total de Ingresos</p>
          <h3 className="text-3xl font-bold text-orange-600 mt-2">${estadisticas.totalIngresos.toFixed(2)}</h3>
        </div>

        <div className="bg-white rounded-lg shadow-md border-t-4 border-blue-300 p-6">
          <p className="text-gray-600 text-sm font-medium">Comisión Barberos</p>
          <h3 className="text-3xl font-bold text-blue-600 mt-2">${estadisticas.totalComisionBarberos.toFixed(2)}</h3>
        </div>

        <div className="bg-white rounded-lg shadow-md border-t-4 border-green-300 p-6">
          <p className="text-gray-600 text-sm font-medium">Comisión Dueño (45%)</p>
          <h3 className="text-3xl font-bold text-green-600 mt-2">${estadisticas.totalComisionDueno.toFixed(2)}</h3>
        </div>
      </div>

      {/* Ganancia Neta */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg shadow-md border-t-4 border-purple-500 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-700 font-semibold">GANANCIA NETA DEL DUEÑO</p>
            <h3 className="text-4xl font-bold text-purple-600 mt-2">${estadisticas.gananciaNetaDueno.toFixed(2)}</h3>
            <p className="text-purple-600 text-sm mt-2">Después de pagar comisiones</p>
          </div>
          <div className="text-6xl">💰</div>
        </div>
      </div>

      {/* Botones de Exportación */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-t-4 border-orange-300">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📥 Exportar Reporte</h3>
        
        <div className="flex gap-4">
          <button
            onClick={exportarPDF}
            disabled={loading || citasFiltradas.length === 0}
            className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📄 Descargar PDF
          </button>

          <button
            onClick={exportarExcel}
            disabled={loading || citasFiltradas.length === 0}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📊 Descargar Excel
          </button>
        </div>

        {citasFiltradas.length === 0 && (
          <p className="text-gray-500 mt-4">No hay citas para exportar con los filtros seleccionados</p>
        )}
      </div>

      {/* Tabla de citas */}
      <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-300">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Citas Filtradas ({citasFiltradas.length})
        </h3>

        {loading ? (
          <div className="text-center py-8 text-gray-500">⏳ Cargando...</div>
        ) : citasFiltradas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            📭 No hay citas con los filtros seleccionados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b-2 border-yellow-300">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Cliente</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Barbero</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Servicio</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Precio</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Com. Barbero</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Com. Dueño (45%)</th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700">Ganancia Neta</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {citasFiltradas.map((cita) => {
                  const comisiones = calcularComisiones(cita);
                  return (
                    <tr key={cita.id} className="border-b border-gray-200 hover:bg-yellow-50 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">{cita.cliente}</td>
                      <td className="px-4 py-3 text-gray-600">{cita.barbero}</td>
                      <td className="px-4 py-3 text-gray-600">{cita.servicio}</td>
                      <td className="px-4 py-3 text-right font-semibold text-orange-600">${cita.precio.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-600">${comisiones.comisionBarbero.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">${comisiones.comisionDueno.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-purple-600">${comisiones.gananciaNeta.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(cita.fecha).toLocaleDateString('es-AR')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
