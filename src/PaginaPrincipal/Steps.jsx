const Steps = () => {
  const steps = [
    {
      step: '01',
      title: 'Crea tu cuenta',
      desc: 'Regístrate en minutos y obtén acceso inmediato a tu panel de administrador.',
    },
    {
      step: '02',
      title: 'Configura tu espacio',
      desc: 'Añade tus propiedades, áreas comunes y define las reglas de tu condominio.',
    },
    {
      step: '03',
      title: 'Invita a la comunidad',
      desc: 'Envía un enlace a los residentes para que descarguen la App y empiecen a interactuar.',
    }
  ];

  return (
    <section id="como-funciona" className="py-5" style={{ backgroundColor: 'var(--dark-navy)' }}>
      <div className="container py-5">
        <div className="text-center mb-5" data-aos="fade-up">
          <h6 className="text-info fw-bold text-uppercase mb-3" style={{ letterSpacing: '4px' }}>Proceso Simple</h6>
          <h2 className="display-4 fw-bold text-white mb-4 px-2">Moderniza tu gestión en <span className="text-info">3 pasos</span></h2>
        </div>

        <div className="row g-4 justify-content-center">
          {steps.map((s, i) => (
            <div className="col-12 col-md-6 col-lg-4 text-center" key={i} data-aos="fade-up" data-aos-delay={i * 150}>
              <div className="step-card p-4 p-lg-5 h-100">
                <div className="step-number-wrapper mx-auto mb-4 d-flex align-items-center justify-content-center">
                  <span className="fs-3 fw-bold text-white">{s.step}</span>
                </div>
                <h4 className="text-white fw-bold mb-3">{s.title}</h4>
                <p className="text-white-50 mb-0">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Steps;