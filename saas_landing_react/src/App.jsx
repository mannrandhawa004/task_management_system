import { useEffect, useState } from 'react';
import PremiumLanding from './components/PremiumLanding';
import { LoginPage, SignupPage } from './components/AuthPages';

const getRoute = () => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return ['/login', '/signup'].includes(path) ? path : '/';
};

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const shouldUseDark = savedTheme ? savedTheme === 'dark' : true;
    document.documentElement.classList.toggle('dark', shouldUseDark);
    document.body.classList.toggle('dark', shouldUseDark);
    setIsDark(shouldUseDark);
  }, []);

  useEffect(() => {
    const handleRouteChange = () => setRoute(getRoute());
    window.addEventListener('popstate', handleRouteChange);
    document.body.classList.toggle('auth-page-open', route !== '/');
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      document.body.classList.remove('auth-page-open');
    };
  }, [route]);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    document.documentElement.classList.toggle('dark', nextTheme);
    document.body.classList.toggle('dark', nextTheme);
    localStorage.setItem('theme', nextTheme ? 'dark' : 'light');
    setIsDark(nextTheme);
  };

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setRoute(getRoute());
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const openSignup = (id = 2, name = 'Professional Suite') => {
    navigate(`/signup?plan=${id}&name=${encodeURIComponent(name)}`);
  };

  if (route === '/login') return <LoginPage isDark={isDark} onToggleTheme={toggleTheme} onNavigate={navigate} />;
  if (route === '/signup') return <SignupPage isDark={isDark} onToggleTheme={toggleTheme} onNavigate={navigate} />;

  return (
    <PremiumLanding
      isDark={isDark}
      toggleTheme={toggleTheme}
      onOpenLogin={() => navigate('/login')}
      onOpenCheckout={openSignup}
    />
  );
}
