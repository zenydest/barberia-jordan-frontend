import ThemeToggle from './ThemeToggle'
import '../styles/app.css'

const Navbar = ({ theme, toggleTheme, onNavigate }) => {
  const menuItems = [
    { id: 'cobros', label: '💰 Cobros' },
    { id: 'reportes', label: '📊 Reportes' },
    { id: 'clientes', label: '👥 Clientes' },
    { id: 'barberos', label: '✂️ Barberos' },
    { id: 'servicios', label: '🎯 Servicios' },
    { id: 'exportar', label: '📥 Exportar' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src="/logo-jordan.png" alt="Barbería Jordan" className="navbar-logo" />
        <span>Barbería Jordan</span>
      </div>
      <div className="navbar-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className="navbar-item"
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="navbar-actions">
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
    </nav>
  )
}

export default Navbar