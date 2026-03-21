import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Config from './pages/config';
import FieldMonitor from './pages/FieldMonitor';
import './index.css';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FieldMonitor />} />
        <Route path="/config" element={<Config />} />
        <Route path="/distance-first" element={<FieldMonitor />} />
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
