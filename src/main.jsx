import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Route the two live Wix embeds to their own lazy-loaded chunks *before* the
// full dashboard (App.jsx) is ever imported. A visitor loading
// /embed/ev-population or /embed/brand-rankings-full downloads only that
// page's own code (plus React/Recharts, shared once) — not the whole
// dashboard bundle with every other tab's logic and data.
// Every other path (the dashboard itself, and any other /embed/* variant)
// still goes through App.jsx exactly as before.
const path = typeof window !== 'undefined' ? window.location.pathname : '';

const LAZY_EMBEDS = {
  '/embed/ev-population': () => import('./embeds/EvPopulation.jsx'),
  '/embed/fleet-breakdown': () => import('./embeds/EvPopulation.jsx'),
  '/embed/brand-rankings-full': () => import('./embeds/BrandRankingsFull.jsx'),
};

const RootComponent = LAZY_EMBEDS[path]
  ? lazy(LAZY_EMBEDS[path])
  : lazy(() => import('./App.jsx'));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={null}>
      <RootComponent />
    </Suspense>
  </React.StrictMode>
);
