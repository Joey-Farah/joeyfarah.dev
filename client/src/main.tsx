import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// /hire and /build used to be dedicated pages; it's now the #build section on
// the main page. Redirect so shared links keep working. (/work is no longer
// redirected: it's the standalone client page at client/public/work/.)
const path = window.location.pathname.replace(/\/+$/, '');
if (path === '/hire' || path === '/build') {
  window.location.replace('/#build');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
