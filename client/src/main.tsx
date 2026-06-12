import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// /work used to be a dedicated page; it's now the #hire section on the main
// page. Redirect so shared links (sitemap, LinkedIn, etc.) keep working.
const path = window.location.pathname.replace(/\/+$/, '');
if (path === '/work' || path === '/hire') {
  window.location.replace('/#hire');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
