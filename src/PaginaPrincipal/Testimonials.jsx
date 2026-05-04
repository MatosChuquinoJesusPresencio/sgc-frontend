import Slider from "react-slick";
import { FaQuoteLeft, FaStar } from "react-icons/fa";

const SlickSlider = Slider.default ? Slider.default : Slider;

const Testimonials = () => {
  const testimonials = [
    {
      name: "Carlos Mendoza",
      role: "Administrador de Condominio",
      text: "Desde que implementamos esta plataforma, la gestión de pagos y la comunicación con los residentes ha mejorado un 100%. Totalmente recomendada.",
      rating: 5,
    },
    {
      name: "Ana Lucía Silva",
      role: "Residente",
      text: "La aplicación móvil es súper intuitiva. Ahora puedo reservar las áreas comunes como la piscina o la parrilla en segundos sin tener que buscar al administrador.",
      rating: 5,
    },
    {
      name: "Roberto Gómez",
      role: "Comité de Vigilancia",
      text: "El control de accesos y el registro de vehículos nos ha dado una tranquilidad enorme. La seguridad en el condominio es mucho mejor ahora.",
      rating: 4,
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    responsive: [
      {
        breakpoint: 992,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  return (
    <section id="testimonios" className="py-5" style={{ backgroundColor: "var(--deep-slate)" }}>
      <div className="container py-5">
        <div className="text-center mb-5" data-aos="fade-up">
          <h2 className="display-5 fw-bold text-white mb-3">Lo que dicen nuestros usuarios</h2>
          <p className="lead text-white-50">Descubre por qué cientos de condominios confían en nosotros</p>
        </div>

        <div className="carousel-wrapper" data-aos="fade-up" data-aos-delay="200">
          <SlickSlider {...settings}>
            {testimonials.map((test, index) => (
              <div key={index} className="px-3">
                <div className="service-card-elite h-100 p-4 d-flex flex-column">
                  <FaQuoteLeft className="fs-1 mb-3" style={{ color: "var(--accent-cyan)", opacity: 0.5 }} />
                  <p className="fs-5 text-white-50 flex-grow-1">"{test.text}"</p>
                  <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="text-white mb-1">{test.name}</h5>
                      <span className="text-white-50 small">{test.role}</span>
                    </div>
                    <div className="text-warning">
                      {[...Array(test.rating)].map((_, i) => (
                        <FaStar key={i} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </SlickSlider>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;