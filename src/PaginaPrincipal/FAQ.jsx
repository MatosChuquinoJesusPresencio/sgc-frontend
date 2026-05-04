import { Accordion } from "react-bootstrap";

const FAQ = () => {
  const faqs = [
    {
      question: "¿Cómo puedo acceder a la plataforma?",
      answer: "Puedes acceder a la plataforma a través de cualquier navegador web en tu computadora o dispositivo móvil. Los administradores proporcionarán los datos de acceso iniciales para cada residente."
    },
    {
      question: "¿Es seguro el manejo de los datos financieros?",
      answer: "Sí, nuestra plataforma utiliza encriptación de extremo a extremo. Además, trabajamos con pasarelas de pago certificadas para garantizar que todas las transacciones sean 100% seguras."
    },
    {
      question: "¿Qué pasa si tengo problemas para usar el sistema?",
      answer: "Contamos con un equipo de soporte técnico disponible 24/7. Además, dentro de la plataforma encontrarás tutoriales y guías paso a paso para todas las funciones."
    },
    {
      question: "¿Se pueden personalizar las reglas del condominio en la app?",
      answer: "Absolutamente. Los administradores pueden configurar horarios de áreas comunes, montos de cuotas, normas de convivencia y mucho más, adaptándose a las necesidades de cada comunidad."
    }
  ];

  return (
    <section id="faq" className="py-5" style={{ backgroundColor: "var(--dark-navy)" }}>
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5" data-aos="fade-up">
              <h2 className="display-5 fw-bold text-white mb-3">Preguntas Frecuentes</h2>
              <p className="lead text-white-50">Resolvemos tus dudas más comunes</p>
            </div>

            <Accordion data-aos="fade-up" data-aos-delay="200" className="faq-accordion">
              {faqs.map((faq, index) => (
                <Accordion.Item eventKey={index.toString()} key={index} className="bg-transparent border-0 mb-3">
                  <Accordion.Header className="faq-header">
                    <strong className="text-white">{faq.question}</strong>
                  </Accordion.Header>
                  <Accordion.Body className="text-white-50 service-card-elite mt-2">
                    {faq.answer}
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;