// Ubicación: src/pages/PaginaPrincipal/LandingPage.jsx
import { useEffect } from 'react';
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

const LandingPage = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

  return (
    <div className="app-wrapper bg-dark overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Pricing />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      
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