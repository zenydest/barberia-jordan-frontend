import { useState } from 'react'
import { useTheme } from './hooks/useTheme'
import Navbar from './components/Navbar'
import Clientes from './pages/Clientes'
import Barberos from './pages/Barberos'
import Servicios from './pages/Servicios'
import Cobros from './pages/Cobros'
import Reportes from './pages/Reportes'
import Exportar from './pages/Exportar'
import './styles/theme.css'
import './styles/App.css'

function App() {
  const { theme, toggleTheme } = useTheme()
  const [currentPage, setCurrentPage] = useState('cobros')

  const renderPage = () => {
    switch(currentPage) {
      case 'clientes': return <Clientes />
      case 'barberos': return <Barberos />
      case 'servicios': return <Servicios />
      case 'cobros': return <Cobros />
      case 'reportes': return <Reportes />
      case 'exportar': return <Exportar />
      default: return <Cobros />
    }
  }

  return (
    <div className="app">
      <Navbar theme={theme} toggleTheme={toggleTheme} onNavigate={setCurrentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  )
}

export default App