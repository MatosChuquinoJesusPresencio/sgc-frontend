import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importamos el hook para navegación

const Navbar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate(); // Inicializamos la función navigate

  // Detectar el scroll para cambiar el estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkStyle = {
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const navItems = [
    { name: 'Inicio', link: '#' },
    { name: 'Servicios', link: '#servicios' },
    { name: 'Cómo Funciona', link: '#como-funciona' },
    { name: 'Planes', link: '#planes' },
    { name: 'Contacto', link: '#contacto' }
  ];

  // Función reutilizable para ir al login
  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark position-fixed w-100 ${isScrolled ? 'scrolled-nav' : 'bg-transparent mt-3'}`} 
         style={{ zIndex: 1000, transition: 'all 0.4s ease' }}>
      <div className="container">
        
        {/* Logo animado */}
        <a className="navbar-brand d-flex align-items-center fw-bold fs-4" href="#" style={navLinkStyle} 
           onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
           onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          <div className="bg-white text-dark rounded-circle d-flex align-items-center justify-content-center me-2 shadow-sm" 
               style={{ width: '40px', height: '40px' }}>
            <span style={{ fontSize: '0.8rem' }}>/</span>
          </div>
          OASIS
        </a>

        {/* BOTÓN HAMBURGUESA (Móvil) */}
        <button 
          className="navbar-toggler border-0 shadow-none" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenido Colapsable */}
        <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
          <ul className="navbar-nav gap-lg-3 text-center my-3 my-lg-0">
            {navItems.map((item) => (
              <li className="nav-item" key={item.name}>
                <a 
                  className="nav-link text-white opacity-75 fw-medium custom-nav-link" 
                  href={item.link} 
                  style={navLinkStyle}
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>

          {/* Botones dentro del colapso para móvil */}
          <div className="d-lg-none d-flex flex-column align-items-center gap-3 pb-3">
             <a href="#" className="text-white text-decoration-none small fw-semibold">Empezar</a>
             <button 
                className="btn btn-light rounded-pill px-4 fw-bold w-75"
                onClick={handleLoginRedirect} // Corregido para móviles
             >
                Iniciar Sesión
             </button>
          </div>
        </div>

        {/* Botones de Acción (Escritorio) */}
        <div className="d-none d-lg-flex align-items-center gap-4">
          <a href="#" className="text-white text-decoration-none small fw-semibold opacity-75" 
             style={navLinkStyle}
             onMouseOver={(e) => {
               e.target.style.opacity = '1'; 
               e.target.style.transform = 'translateY(-2px)';
             }}
             onMouseOut={(e) => {
               e.target.style.opacity = '0.75'; 
               e.target.style.transform = 'translateY(0)';
             }}>
            Empezar
          </a>
          
          <button 
            className="btn rounded-pill px-4 py-2 fw-bold"
            style={{
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              backgroundColor: isHovered ? '#0056b3' : '#f8f9fa',
              color: isHovered ? '#fff' : '#0056b3',
              border: isHovered ? '2px solid #0056b3' : '2px solid transparent',
              transform: isHovered ? 'scale(1.1) translateY(-3px)' : 'scale(1)',
              boxShadow: isHovered ? '0 10px 20px rgba(0, 86, 179, 0.3)' : '0 4px 6px rgba(0,0,0,0.1)',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleLoginRedirect} // Corregido para escritorio
          >
            Iniciar Sesión
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;