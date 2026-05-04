const TrustedBy = () => {
  const companies = [
    { name: "Inmobiliaria Horizonte", icon: "bi-building" },
    { name: "Seguridad Global SA", icon: "bi-shield-check" },
    { name: "Condominios Elite", icon: "bi-houses" },
    { name: "Gestión Residencial", icon: "bi-briefcase" },
    { name: "Torres del Sur", icon: "bi-buildings" },
    { name: "Grupo Constructor", icon: "bi-cone-striped" },
  ];

  return (
    <section className="py-4" style={{ backgroundColor: 'var(--dark-navy)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="container overflow-hidden">
        <p className="text-center text-white-50 small text-uppercase tracking-widest mb-4">Empresas que confían en nosotros</p>

        <div className="marquee-wrapper">
          <div className="marquee-content d-flex align-items-center">
            {/* Renderizamos la lista dos veces para el loop infinito */}
            {[...companies, ...companies].map((company, index) => (
              <div key={index} className="mx-5 d-flex align-items-center opacity-50 hover-opacity-100 transition-all" style={{ cursor: 'default', minWidth: 'max-content' }}>
                <i className={`bi ${company.icon} fs-3 me-2 text-white`}></i>
                <span className="text-white fw-semibold fs-5">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;