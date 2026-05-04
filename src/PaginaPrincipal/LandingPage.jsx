// Ubicación: src/pages/PaginaPrincipal/LandingPage.jsx
import { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Corregimos la ruta para llegar a src/App.css
import "../PaginaPrincipal/Styles/Diseño.css";// Importaciones de tus componentes locales
import Navbar from './Navbar';
import Hero from './Hero';
import Services from './Services';
import Pricing from './Pricing';
import Contact from './Contact';
import Footer from './Footer';
import Testimonials from './Testimonials';
import FAQ from './FAQ';
import Stats from './Stats';
import Steps from './Steps';

const LandingPage = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });

    // Lógica para mostrar/ocultar botón de volver arriba
    const checkScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-wrapper bg-dark overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Services />
        <Steps />
        <Pricing />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />

      {/* Botón Scroll to Top */}
      <div 
        className="position-fixed d-none d-md-block" 
        style={{ 
          bottom: '100px', 
          right: '30px', 
          zIndex: 1999,
          opacity: showScrollTop ? 1 : 0,
          pointerEvents: showScrollTop ? 'auto' : 'none',
          transition: 'all 0.4s ease'
        }}
      >
        <button onClick={scrollToTop} className="btn-scroll-top shadow-lg" aria-label="Volver arriba">
          <i className="bi bi-chevron-up fs-4"></i>
        </button>
      </div>
      
      {/* Botón WhatsApp */}
      <div className="position-fixed bottom-0 end-0 p-3 p-md-4" style={{ zIndex: 2000 }}>
        <a 
          href="https://wa.me/tu-numero" 
          target="_blank" 
          rel="noreferrer" 
          className="btn btn-success rounded-circle d-flex align-items-center justify-content-center shadow-lg border-2 border-white btn-whatsapp-custom" 
        >
          <i className="bi bi-whatsapp fs-2"></i>
        </a>
      </div>
    </div>
  );
};

export default LandingPage;