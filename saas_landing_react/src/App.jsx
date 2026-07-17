import { useEffect, useState } from 'react';
import PremiumLanding from './components/PremiumLanding';
import { LoginModal, CheckoutModal } from './components/Modals';

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState({ id: 2, name: 'Professional Suite' });

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldUseDark = savedTheme ? savedTheme === 'dark' : true;
    document.documentElement.classList.toggle('dark', shouldUseDark);
    document.body.classList.toggle('dark', shouldUseDark);
    setIsDark(shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    document.documentElement.classList.toggle('dark', nextTheme);
    document.body.classList.toggle('dark', nextTheme);
    localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
    setIsDark(nextTheme);
  };

  const openCheckout = (id = 2, name = 'Professional Suite') => {
    setCheckoutPlan({ id, name });
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <PremiumLanding
        isDark={isDark}
        toggleTheme={toggleTheme}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenCheckout={openCheckout}
      />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        initialPlan={checkoutPlan}
      />
    </>
  );
}
