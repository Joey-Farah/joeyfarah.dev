import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// /work used to be a dedicated page; it's now the #work section on the main
// page. Redirect so shared links (sitemap, LinkedIn, etc.) keep working.
if (window.location.pathname.replace(/\/+$/, '') === '/work') {
  window.location.replace('/#work');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
