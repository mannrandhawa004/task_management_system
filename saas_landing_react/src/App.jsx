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

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".gsap-hero", {
        opacity: 0,
        y: 35,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out"
      });

      gsap.from(".gsap-hero-showcase", {
        opacity: 0,
        scale: 0.95,
        y: 40,
        duration: 1,
        delay: 0.45,
        ease: "power3.out"
      });
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
