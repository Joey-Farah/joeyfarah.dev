import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// /work and /hire used to be dedicated pages; it's now the #build section on
// the main page. Redirect so shared links (sitemap, LinkedIn, etc.) keep working.
const path = window.location.pathname.replace(/\/+$/, '');
if (path === '/work' || path === '/hire' || path === '/build') {
  window.location.replace('/#build');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
