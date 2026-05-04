import { useState } from 'react';

const Contact = () => {
  const [focusedField, setFocusedField] = useState(null);

  const inputStyle = (fieldName) => ({
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderLeft: focusedField === fieldName 
      ? '4px solid #00d4ff' 
      : '4px solid rgba(255, 255, 255, 0.1)',
    color: 'white',
    transition: 'all 0.4s ease',
    padding: '16px 20px',
    fontSize: '0.95rem'
  });

  return (
    <section id="contacto" className="py-5" style={{ background: '#020617' }}>
      <div className="container py-5">
        <div className="row g-5 align-items-center">
          
          <div className="col-lg-5 text-center text-lg-start mb-4 mb-lg-0" data-aos="fade-right">
            <h6 className="text-info fw-bold tracking-widest mb-3" style={{ letterSpacing: '3px' }}>CONTACTO VIP</h6>
            <h2 className="display-4 fw-bold text-white mb-4">Hablemos de tu próximo <span className="text-info">gran proyecto.</span></h2>
            <p className="text-white-50 mb-4 mb-lg-5 px-3 px-lg-0">
              Nuestro equipo de expertos está listo para diseñar una solución a la medida de tu condominio.
            </p>
          </div>

          <div className="col-lg-7" data-aos="fade-left">
            <div className="p-4 p-sm-5 rounded-5 mx-3 mx-md-0" style={{
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
            }}>
              <form className="row g-4">
                <div className="col-md-6 text-start">
                  <label className="text-white-50 small fw-bold mb-2 text-uppercase">Nombre Completo</label>
                  <input 
                    type="text" 
                    className="form-control text-white shadow-none" 
                    placeholder="Ej. Juan Pérez"
                    style={inputStyle('nombre')}
                    onFocus={() => setFocusedField('nombre')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <div className="col-md-6 text-start">
                  <label className="text-white-50 small fw-bold mb-2 text-uppercase">Correo Corporativo</label>
                  <input 
                    type="email" 
                    className="form-control text-white shadow-none" 
                    placeholder="juan@empresa.com"
                    style={inputStyle('email')}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </div>
                <div className="col-12 text-start">
                  <label className="text-white-50 small fw-bold mb-2 text-uppercase">Mensaje</label>
                  <textarea 
                    className="form-control text-white shadow-none" 
                    rows="4" 
                    placeholder="Cuéntanos sobre tu condominio..."
                    style={inputStyle('mensaje')}
                    onFocus={() => setFocusedField('mensaje')}
                    onBlur={() => setFocusedField(null)}
                  ></textarea>
                </div>
                
                {/* BOTÓN SOFISTICADO ACTUALIZADO */}
                <div className="col-12 text-center text-sm-end mt-4">
                  <button type="submit" className="btn-elite-minimal border-0 shadow-none w-100 d-sm-inline-flex justify-content-center">
                    ENVIAR MENSAJE 
                    <i className="bi bi-send ms-2"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;