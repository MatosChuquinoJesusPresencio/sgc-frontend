import { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Services = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

  const services = [
    { 
      title: "Seguridad Biométrica", 
      desc: "Control de identidad por IA para máxima seguridad en los accesos.", 
      icon: "bi-shield-lock" 
    },
    { 
      title: "Finanzas en Cloud", 
      desc: "Auditorías en tiempo real con transparencia total para administradores.", 
      icon: "bi-graph-up-arrow" 
    },
    { 
      title: "Gestión de Amenidades", 
      desc: "Reserva de espacios comunes con un solo toque desde la App.", 
      icon: "bi-calendar-check" 
    }
  ];

  return (
    <section id="servicios" className="py-5" style={{ background: '#020617' }}>
      <div className="container py-5">
        
        {/* Cabecera de Sección Sofisticada */}
        <div className="text-center mb-5" data-aos="fade-down">
          <h6 className="text-info fw-bold text-uppercase mb-3" style={{ letterSpacing: '4px' }}>Soluciones de Vanguardia</h6>
          <h2 className="display-4 fw-bold text-white mb-4 px-2">Servicios que transforman <span className="text-info">la vida en comunidad</span></h2>
          <p className="text-white-50 lead mx-auto px-3" style={{ maxWidth: '700px' }}>
            Nuestra plataforma integra tecnología avanzada para simplificar la administración y elevar la seguridad.
          </p>
        </div>

        {/* Bento Grid de Tarjetas de Cristal */}
        <div className="row g-4 justify-content-center">
          {services.map((s, i) => (
            <div className="col-12 col-md-6 col-lg-4" key={i} data-aos="fade-up" data-aos-delay={i * 150}>
              <div className="service-card-elite h-100 d-flex flex-column text-start">
                
                <div className="icon-box-elite">
                  <i className={`bi ${s.icon}`}></i>
                </div>
                
                <h4 className="text-white fw-bold mb-3 h5 text-uppercase" style={{ letterSpacing: '1px' }}>{s.title}</h4>
                <p className="text-white-50 mb-4 flex-grow-1 fs-6">{s.desc}</p>
                
                <div className="mt-auto">
                  <button className="btn-know-more">
                    Saber más <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Services;