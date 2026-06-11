import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import WorkPage from './modules/WorkPage/WorkPage';

// Minimal pathname routing — only two pages exist, so a router dependency
// isn't earning its complexity. The Express catch-all (prod) and Vite's
// history fallback (dev) both serve index.html for /work already.
const isWorkPage = window.location.pathname.replace(/\/+$/, '') === '/work';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isWorkPage ? <WorkPage /> : <App />}
  </React.StrictMode>,
);
