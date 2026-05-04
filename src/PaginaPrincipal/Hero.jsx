import Slider from "react-slick";
import FeatureCard from './FeatureCard';

const SlickSlider = Slider.default ? Slider.default : Slider;

const Hero = () => {
  const cards = [
    { icon: 'bi-clock-history', title: 'Control de Accesos:', text: 'Gestione ingresos y salidas con un registro detallado de visitantes y residentes.' },
    { icon: 'bi-tools', title: 'Gestión de Áreas:', text: 'Reserve áreas comunes y espacios de estacionamiento de forma digital y segura.' },
    { icon: 'bi-cash-coin', title: 'Pagos Transparentes:', text: 'Gestión de cuotas claras con estados financieros accesibles para todos.' },
    { icon: 'bi-phone', title: 'App para Residentes:', text: 'Proporcione a los residentes una app intuitiva para reportar incidencias.' },
    { icon: 'bi-shield-check', title: 'Seguridad Integrada:', text: 'Sistemas de monitoreo y control de rondas en tiempo real.' },
    { icon: 'bi-people', title: 'Comunicación:', text: 'Mensajería masiva y notificaciones push para toda la comunidad.' }
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    centerMode: true,
    centerPadding: '0px',
    arrows: true,
    responsive: [
      { 
        breakpoint: 1200, 
        settings: { 
          slidesToShow: 2,
          centerMode: true,
          centerPadding: '50px' 
        } 
      },
      { 
        breakpoint: 992, 
        settings: { 
          slidesToShow: 1,
          centerMode: true,
          centerPadding: '100px' 
        } 
      },
      { 
        breakpoint: 768, 
        settings: { 
          slidesToShow: 1,
          centerMode: true,
          centerPadding: '30px' 
        } 
      }
    ]
  };

  return (
    <div className="hero-container position-relative overflow-hidden" style={{
      background: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.85)), url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2000')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      paddingTop: '80px'
    }}>
      <div className="container text-center text-white">
        {/* Título Principal */}
        <h1 className="display-2 fw-bold mb-3 px-2" data-aos="fade-down">
          Eleva el diseño y control <br/> de tu condominio.
        </h1>
        
        {/* Subtítulo */}
        <p className="lead fs-5 fs-md-4 mb-5 opacity-75 mx-auto px-3" style={{ maxWidth: '800px' }} data-aos="fade-up" data-aos-delay="200">
          Un sistema de gestión moderno y eficiente para administradores y residentes.
        </p>

        {/* Carrusel de Tarjetas (Ahora más cerca del texto al no haber botones) */}
        <div className="carousel-wrapper mx-auto" style={{ maxWidth: '1100px' }} data-aos="fade-up" data-aos-delay="400">
          <SlickSlider {...settings}>
            {cards.map((card, index) => (
              <div key={index} className="px-3 pb-5 h-100"> 
                <FeatureCard {...card} />
              </div>
            ))}
          </SlickSlider>
        </div>

        {/* Footer del Hero */}
        <div className="mt-4 pb-4 opacity-50" data-aos="fade-up">
            <h3 className="fw-light fs-5">¿Por qué Oasis?</h3>
            <div className="d-flex justify-content-center gap-3 gap-md-4 mt-3 flex-wrap small px-2">
              <span>• Monitoreo real</span>
              <span>• Acceso Seguro</span>
              <span>• Reportes Inteligentes</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;