import { useState } from 'react'

const Exportar = () => {
  const [exportType, setExportType] = useState('pdf')
  const [reportType, setReportType] = useState('diario')
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0])
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

const handleExport = async (e) => {
  e.preventDefault()
  setIsLoading(true)
  setSuccessMsg('')
  
  try {
    // Construir la URL con parámetros GET
    const params = new URLSearchParams({
      type: exportType,
      reportType: reportType,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin
    })
    
    const url = 'http://localhost:5000/api/exportar/generar?' + params.toString()
    console.log('Descargando desde:', url)
    
   const response = await fetch(
    `${API_URL}/exportar/generar?type=${exportType}&reportType=${reportType}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
    )
    const blob = await response.blob()
    
    // Crear descarga con extensión correcta
    const urlBlob = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = urlBlob
    
    // Extensión correcta
    const extension = exportType === 'excel' ? 'xlsx' : 'pdf'
    link.download = `reporte_barberia_${fechaInicio}.${extension}`
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(urlBlob)
    
    setSuccessMsg('✅ Reporte exportado exitosamente')
    setTimeout(() => setSuccessMsg(''), 3000)
  } catch (err) {
    console.error('Error:', err)
    setSuccessMsg('❌ Error al exportar: ' + err.message)
  } finally {
    setIsLoading(false)
  }
}

  const today = new Date().toISOString().split('T')[0]
  const maxDate = today

  return (
    <div className="page">
      <h1 className="page-title">📥 Exportar Reportes</h1>

      <div className="export-container">
        <div className="export-info">
          <div className="info-card">
            <h3>📊 Formato</h3>
            <p>Elige entre PDF para visualizar o Excel para análisis avanzado</p>
          </div>
          <div className="info-card">
            <h3>📅 Fechas</h3>
            <p>Selecciona el rango de fechas personalizado para tu reporte</p>
          </div>
          <div className="info-card">
            <h3>🎯 Tipos</h3>
            <p>Genera reportes diarios, mensuales o por barbero</p>
          </div>
        </div>

        <div className="card export-form-card">
          <h2 className="card-title">Generar Reporte</h2>
          <form onSubmit={handleExport} className="form export-form">
            
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">📄 Formato de Exportación</label>
                <select 
                  value={exportType} 
                  onChange={(e) => setExportType(e.target.value)} 
                  className="form-input"
                >
                  <option value="pdf">📕 PDF (Visualización)</option>
                  <option value="excel">📗 Excel (Análisis)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">📊 Tipo de Reporte</label>
                <select 
                  value={reportType} 
                  onChange={(e) => setReportType(e.target.value)} 
                  className="form-input"
                >
                  <option value="diario">📅 Reporte Diario</option>
                  <option value="mensual">📆 Reporte Mensual</option>
                  <option value="por-barbero">👔 Por Barbero</option>
                </select>
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label">📍 Fecha Inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  max={maxDate}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">📍 Fecha Fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  max={maxDate}
                  min={fechaInicio}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-preview">
              <div className="preview-item">
                <span>Formato:</span>
                <strong>{exportType.toUpperCase()}</strong>
              </div>
              <div className="preview-item">
                <span>Tipo:</span>
                <strong>{reportType}</strong>
              </div>
              <div className="preview-item">
                <span>Período:</span>
                <strong>{fechaInicio} → {fechaFin}</strong>
              </div>
            </div>

            {successMsg && (
              <div className={'alert ' + (successMsg.includes('❌') ? 'alert-error' : 'alert-success')}>
                {successMsg}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-export"
              disabled={isLoading}
            >
              {isLoading ? '⏳ Generando...' : '📥 Descargar Reporte'}
            </button>
          </form>
        </div>

        <div className="export-tips">
          <h3>💡 Consejos</h3>
          <ul>
            <li>📕 <strong>PDF:</strong> Ideal para compartir reportes por correo</li>
            <li>📗 <strong>Excel:</strong> Perfecta para gráficos y análisis de datos</li>
            <li>📅 <strong>Diario:</strong> Resumen de ganancias del día específico</li>
            <li>📆 <strong>Mensual:</strong> Análisis completo del mes seleccionado</li>
            <li>👔 <strong>Por Barbero:</strong> Productividad individual de cada barbero</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Exportar