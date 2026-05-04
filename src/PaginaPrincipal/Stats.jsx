const Stats = () => {
  const stats = [
    { id: 1, number: '500+', label: 'Condominios Activos', icon: 'bi-building' },
    { id: 2, number: '15k+', label: 'Residentes Felices', icon: 'bi-people' },
    { id: 3, number: '100%', label: 'Transparencia', icon: 'bi-shield-check' },
    { id: 4, number: '24/7', label: 'Soporte Técnico', icon: 'bi-headset' },
  ];

  return (
    <section className="py-4 position-relative" style={{ 
      backgroundColor: 'var(--deep-slate)', 
      borderTop: '1px solid rgba(255,255,255,0.05)', 
      borderBottom: '1px solid rgba(255,255,255,0.05)' 
    }}>
      <div className="container">
        <div className="row g-4 justify-content-center text-center">
          {stats.map((stat, i) => (
            <div key={stat.id} className="col-6 col-md-3" data-aos="fade-up" data-aos-delay={i * 100}>
              <div className="p-3">
                <i className={`bi ${stat.icon} fs-2 mb-2 d-block text-info opacity-75`}></i>
                <h2 className="display-5 fw-bold text-white mb-1 stat-glow">{stat.number}</h2>
                <p className="text-white-50 text-uppercase small tracking-widest mb-0">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;