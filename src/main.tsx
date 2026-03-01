import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import DevApp from './DevApp';
import './App.css';

const isDevRoute = import.meta.env.DEV && window.location.pathname === '/dev';

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isDevRoute ? <DevApp /> : <App />}</StrictMode>,
);
