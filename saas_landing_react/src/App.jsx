import { useEffect, useState } from 'react';
import PremiumLanding from './components/PremiumLanding';
import { SignupPage } from './components/AuthPages';

const APP_URL = (import.meta.env.VITE_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

const getRoute = () => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return ['/login', '/signup'].includes(path) ? path : '/';
};

function LoginRedirect() {
  useEffect(() => {
    window.location.replace(APP_URL);
  }, []);

  return (
    <main className="auth-page auth-login-redirect" aria-live="polite">
      <img src="/assets/taskflow-logo-modern.png" alt="TaskFlow" />
      <span className="auth-spinner" aria-hidden="true" />
      <p>Opening secure workspace sign in...</p>
    </main>
  );
}

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

  const openSignup = (id = 2, name = 'Professional Suite', billing = 'yearly') => {
    navigate(`/signup?plan=${id}&name=${encodeURIComponent(name)}&billing=${billing}`);
  };

  if (route === '/login') return <LoginRedirect />;
  if (route === '/signup') return <SignupPage isDark={isDark} onToggleTheme={toggleTheme} onNavigate={navigate} />;

  return (
    <PremiumLanding
      isDark={isDark}
      toggleTheme={toggleTheme}
      onOpenLogin={() => window.location.assign(APP_URL)}
      onOpenCheckout={openSignup}
    />
  );
}
