const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pt-5 pb-4" style={{ background: '#010409', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="container">
        <div className="row g-4">
          
          {/* COLUMNA 1: Identidad */}
          <div className="col-lg-4 col-md-6 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-3">
              <div className="bg-white text-dark rounded-circle d-flex align-items-center justify-content-center me-2" 
                   style={{ width: '35px', height: '35px', fontWeight: 'bold' }}>
                CH
              </div>
              <span className="fs-4 fw-bold text-white">Oasis</span>
            </div>
            <p className="text-white-50 pe-lg-5 px-3 px-md-0">
              Elevando el estándar de la gestión residencial a través de tecnología inteligente y diseño de vanguardia.
            </p>
            <div className="d-flex gap-3 mt-4 justify-content-center justify-content-md-start mb-4 mb-md-0">
              <a href="#" className="text-white-50 fs-5 transition-all hover-cyan"><i className="bi bi-linkedin"></i></a>
              <a href="#" className="text-white-50 fs-5 transition-all hover-cyan"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-white-50 fs-5 transition-all hover-cyan"><i className="bi bi-facebook"></i></a>
            </div>
          </div>

          {/* COLUMNA 2: Enlaces Rápidos */}
          <div className="col-lg-2 col-md-6 text-center text-md-start">
            <h6 className="text-white fw-bold mb-4">Navegación</h6>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="#" className="text-white-50 text-decoration-none hover-cyan">Inicio</a></li>
              <li className="mb-2"><a href="#servicios" className="text-white-50 text-decoration-none hover-cyan">Servicios</a></li>
              <li className="mb-2"><a href="#planes" className="text-white-50 text-decoration-none hover-cyan">Planes</a></li>
              <li className="mb-2"><a href="#contacto" className="text-white-50 text-decoration-none hover-cyan">Contacto</a></li>
            </ul>
          </div>

          {/* COLUMNA 3: Servicios */}
          <div className="col-lg-3 col-md-6 text-center text-md-start">
            <h6 className="text-white fw-bold mb-4">Soluciones</h6>
            <ul className="list-unstyled text-white-50">
              <li className="mb-2">Control de Accesos</li>
              <li className="mb-2">Gestión Financiera</li>
              <li className="mb-2">Reserva de Áreas</li>
              <li className="mb-2">Seguridad Inteligente</li>
            </ul>
          </div>

          {/* COLUMNA 4: Contacto Técnico */}
          <div className="col-lg-3 col-md-6 text-center text-md-start">
            <h6 className="text-white fw-bold mb-4">Soporte VIP</h6>
            <div className="text-white-50 d-flex flex-column align-items-center align-items-md-start">
              <p className="mb-2 d-flex align-items-center gap-2 justify-content-center justify-content-md-start">
                <i className="bi bi-envelope-at text-info"></i> help@oasis.com
              </p>
              <p className="mb-2 d-flex align-items-center gap-2 justify-content-center justify-content-md-start">
                <i className="bi bi-telephone text-info"></i> +51 999 888 777
              </p>
              <p className="d-flex align-items-center gap-2 justify-content-center justify-content-md-start">
                <i className="bi bi-geo-alt text-info"></i> Lima, Perú
              </p>
            </div>
          </div>

        </div>

        <hr className="my-5" style={{ borderColor: 'rgba(255,255,255,0.05)' }} />

        <div className="row align-items-center">
          <div className="col-md-6 text-center text-md-start">
            <small className="text-white-50">© {currentYear} Oasis. Todos los derechos reservados.</small>
          </div>
          <div className="col-md-6 text-center text-md-end mt-3 mt-md-0">
            <a href="#" className="text-white-50 text-decoration-none small mx-3 hover-cyan">Privacidad</a>
            <a href="#" className="text-white-50 text-decoration-none small hover-cyan">Términos</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;