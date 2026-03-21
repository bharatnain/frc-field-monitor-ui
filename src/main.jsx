import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Config from './pages/config';
import FieldMonitor from './pages/FieldMonitor';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FieldMonitor />} />
        <Route path="/config" element={<Config />} />
        <Route path="/distance-first" element={<FieldMonitor />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
