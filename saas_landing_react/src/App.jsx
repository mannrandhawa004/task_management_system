import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeatureShowcase from './components/FeatureShowcase';
import Features from './components/Features';
import Solutions from './components/Solutions';
import PartnersSecurity from './components/PartnersSecurity';
import Pricing from './components/Pricing';
import Faq from './components/Faq';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import { LoginModal, CheckoutModal } from './components/Modals';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState({ id: 2, name: 'Professional Suite' });

  // Boot theme sync
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const html = document.documentElement;
    const body = document.body;
    
    if (saved === 'light') {
      html.classList.remove('dark');
      body.classList.remove('dark');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      body.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const body = document.body;
    
    if (isDark) {
      html.classList.remove('dark');
      body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleOpenCheckout = (id, name) => {
    setCheckoutPlan({ id, name });
    setIsCheckoutOpen(true);
  };

  // GSAP Entrance & ScrollTrigger Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero Entrance
      gsap.fromTo(".gsap-hero", 
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out" }
      );

      gsap.fromTo(".gsap-hero-showcase", 
        { opacity: 0, scale: 0.95, y: 40 },
        { opacity: 1, scale: 1, y: 0, duration: 1, delay: 0.45, ease: "power3.out" }
      );

      // 2. ScrollTrigger for all Section Headers
      gsap.utils.toArray(".gsap-scroll-header").forEach((header) => {
        gsap.fromTo(header, 
          { opacity: 0, y: 35 },
          {
            scrollTrigger: {
              trigger: header,
              start: "top 90%",
              toggleActions: "play none none none"
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            immediateRender: false
          }
        );
      });

      // 3. ScrollTrigger for Grids & Cards (Staggered Reveal that never hides images)
      gsap.utils.toArray(".gsap-scroll-grid").forEach((grid) => {
        const cards = grid.querySelectorAll(".gsap-scroll-card");
        if (cards.length > 0) {
          gsap.fromTo(cards,
            { opacity: 0, y: 40, scale: 0.97 },
            {
              scrollTrigger: {
                trigger: grid,
                start: "top 90%",
                toggleActions: "play none none none"
              },
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.75,
              stagger: 0.12,
              ease: "power3.out",
              immediateRender: false
            }
          );
        }
      });

      // Refresh ScrollTrigger after all DOM images have finished loading heights
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 500);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Navbar 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenCheckout={handleOpenCheckout}
      />

      <main className="flex-1 overflow-hidden">
        <Hero onOpenCheckout={handleOpenCheckout} />
        <FeatureShowcase />
        <Features />
        <Solutions />
        <PartnersSecurity />
        <Pricing onOpenCheckout={handleOpenCheckout} />
        <Faq />
        <Reviews />
      </main>

      <Footer onOpenCheckout={handleOpenCheckout} />

      {/* State-driven Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
        initialPlan={checkoutPlan}
      />
    </div>
  );
}
