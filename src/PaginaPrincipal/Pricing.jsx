import { useState } from 'react';

const Pricing = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const plans = [
    { 
      name: 'Básico', 
      price: '49', 
      features: ['Gestión de Accesos', 'Reportes Básicos', 'Soporte vía Email'], 
      popular: false 
    },
    { 
      name: 'Premium', 
      price: '99', 
      features: ['Todo lo Básico', 'App para Residentes', 'Pagos Online', 'Soporte 24/7'], 
      popular: true 
    },
    { 
      name: 'Enterprise', 
      price: '199', 
      features: ['Todo lo Premium', 'Seguridad Integrada', 'API Personalizada', 'Consultoría'], 
      popular: false 
    }
  ];

  return (
    <section id="planes" className="py-5 position-relative" style={{
      background: 'linear-gradient(180deg, #020617 0%, #0f172a 100%)',
      color: 'white',
      overflow: 'visible' // Importante para que la elevación de la tarjeta se vea
    }}>
      <div className="container py-5">
        <div className="text-center mb-5" data-aos="fade-up">
          <h2 className="display-4 fw-bold px-2">Nuestros Planes</h2>
          <p className="opacity-75 fs-5 text-info">Soluciones seguras y profesionales para tu comunidad</p>
        </div>

        <div className="row g-4 justify-content-center">
          {plans.map((plan, index) => (
            <div className="col-12 col-md-6 col-lg-4" key={index} data-aos="fade-up" data-aos-delay={index * 150}>
              <div 
                className="card h-100 border-0 p-4 shadow-lg"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  transform: hoveredCard === index ? 'translateY(-20px) scale(1.02)' : 'scale(1)',
                  backgroundColor: plan.popular ? '#ffffff' : 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(12px)',
                  border: plan.popular ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: plan.popular ? '#0f172a' : '#fff',
                  boxShadow: hoveredCard === index && plan.popular 
                    ? '0 25px 50px -12px rgba(0, 133, 255, 0.5)' 
                    : 'none',
                  zIndex: hoveredCard === index ? 10 : 1
                }}
              >
                {plan.popular && (
                  <div className="position-absolute top-0 start-50 translate-middle w-100 text-center">
                    <span className="badge rounded-pill bg-primary px-4 py-2 shadow-sm" style={{ backgroundColor: '#0056b3' }}>
                      MÁS POPULAR
                    </span>
                  </div>
                )}

                <div className="card-body text-center d-flex flex-column mt-3">
                  <h3 className="fw-bold mb-4">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="display-4 fw-bold">${plan.price}</span>
                    <span className={plan.popular ? 'text-muted' : 'text-white-50'}>/mes</span>
                  </div>

                  <ul className="list-unstyled mb-5 text-start flex-grow-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="mb-3 d-flex align-items-center">
                        <i className="bi bi-check-circle-fill me-3" style={{ color: plan.popular ? '#0056b3' : '#00d4ff' }}></i>
                        <span className="small">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* --- BOTÓN CON MOVIMIENTO FUERA DE LO COMÚN --- */}
                  <button 
                    className={`btn btn-lg rounded-pill fw-bold py-3 border-2 transition-all ${
                      plan.popular 
                        ? 'btn-premium-unique shadow-lg text-white' 
                        : 'btn-outline-light'
                    }`}
                    style={{
                      width: '100%',
                      zIndex: 1,
                      backgroundColor: plan.popular ? '#0056b3' : 'transparent',
                      borderColor: plan.popular ? 'transparent' : 'rgba(255,255,255,0.5)',
                    }}
                    onClick={() => window.location.href = '#contacto'}
                  >
                    Seleccionar Plan
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

export default Pricing;