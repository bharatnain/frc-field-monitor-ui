import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Config from './pages/config';
import Diagnostics from './pages/Diagnostics';
import FieldMonitor from './pages/FieldMonitor';
import LandingPage from './pages/LandingPage';
import TeamCardShowcase from './pages/TeamCardShowcase';
import './index.css';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FieldMonitor />} />
        <Route path="/welcome" element={<LandingPage />} />
        <Route path="/config" element={<Config />} />
        <Route path="/diagnostics" element={<Diagnostics />} />
        <Route path="/distance-first" element={<FieldMonitor />} />
        <Route path="/showcase" element={<TeamCardShowcase />} />
      </Routes>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
