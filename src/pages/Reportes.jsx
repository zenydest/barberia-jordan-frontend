import { useState, useEffect } from 'react'
import api from "../apis/api"
import styles from './Reportes.module.css'

const Reportes = () => {
  const [tipoReporte, setTipoReporte] = useState('hoy')
  const [reporte, setReporte] = useState(null)
  const [serviciosMasVendidos, setServiciosMasVendidos] = useState([])
  const [loading, setLoading] = useState(false)
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0])
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    cargarReportes()
  }, [tipoReporte])

  const cargarReportes = async () => {
    setLoading(true)
    try {
      let endpoint = ''
      switch (tipoReporte) {
        case 'hoy':
          endpoint = '/reportes/diario'  // ✅ SIN /api
          break
        case 'semana':
          endpoint = '/reportes/semanal'  // ✅ SIN /api
          break
        case 'mes':
          endpoint = '/reportes/mensual'  // ✅ SIN /api
          break
        case 'año':
          endpoint = '/reportes/anual'  // ✅ SIN /api
          break
        default:
          endpoint = '/reportes/diario'  // ✅ SIN /api
      }

      const [respReporte, respServicios] = await Promise.all([
        api.get(endpoint),
        api.get('/reportes/servicios-vendidos')  // ✅ SIN /api
      ])

      setReporte(respReporte.data)
      setServiciosMasVendidos(respServicios.data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRangoPersonalizado = async () => {
    setLoading(true)
    try {
      const resp = await api.get(`/reportes/rango?inicio=${fechaInicio}&fin=${fechaFin}`)  // ✅ SIN /api
      setReporte(resp.data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📊 Reportes y Estadísticas</h1>
      <p className={styles.subtitle}>Analiza los ingresos de tu barbería en tiempo real</p>

      {/* Filtros */}
      <div className={styles.filterSection}>
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.filterBtn} ${tipoReporte === 'hoy' ? styles.active : ''}`}
            onClick={() => setTipoReporte('hoy')}
          >
            📅 Hoy
          </button>
          <button
            className={`${styles.filterBtn} ${tipoReporte === 'semana' ? styles.active : ''}`}
            onClick={() => setTipoReporte('semana')}
          >
            📆 Esta Semana
          </button>
          <button
            className={`${styles.filterBtn} ${tipoReporte === 'mes' ? styles.active : ''}`}
            onClick={() => setTipoReporte('mes')}
          >
            📋 Este Mes
          </button>
          <button
            className={`${styles.filterBtn} ${tipoReporte === 'año' ? styles.active : ''}`}
            onClick={() => setTipoReporte('año')}
          >
            📊 Este Año
          </button>
        </div>

        <div className={styles.rangoPersonalizado}>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
          />
          <span>a</span>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
          />
          <button onClick={handleRangoPersonalizado} className={styles.btnRango}>
            🔍 Rango Personalizado
          </button>
        </div>
      </div>

      {/* Botón Recargar */}
      <button onClick={cargarReportes} className={styles.btnRecargar}>
        🔄 Recargar Reportes
      </button>

      {loading && <p className={styles.loading}>Cargando datos...</p>}

      {reporte && (
        <>
          {/* Estadísticas */}
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.green}`}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Total de Ingresos</p>
                <p className={styles.statValue}>${reporte.total?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.blue}`}>
              <div className={styles.statIcon}>📈</div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Cantidad de Cobros</p>
                <p className={styles.statValue}>{reporte.cantidad || 0}</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.orange}`}>
              <div className={styles.statIcon}>📊</div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Promedio por Cobro</p>
                <p className={styles.statValue}>${reporte.promedio?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>

          {/* Alerta si no hay datos */}
          {reporte.cantidad === 0 && (
            <div className={styles.alert}>
              ⚠️ No hay cobros registrados en este período. Asegúrate de registrar cobros en la sección Cobrar
            </div>
          )}

          {/* Servicios Más Vendidos */}
          <div className={styles.servicesSection}>
            <h2 className={styles.sectionTitle}>🔥 Servicios Más Vendidos</h2>
            {serviciosMasVendidos.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Servicio</th>
                    <th>Cantidad</th>
                    <th>Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {serviciosMasVendidos.map((servicio) => (
                    <tr key={servicio.servicio_id}>
                      <td>{servicio.servicio_nombre}</td>
                      <td className={styles.cantidad}>{servicio.cantidad}</td>
                      <td className={styles.ingresos}>${servicio.ingresos?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className={styles.noData}>No hay datos disponibles</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Reportes
