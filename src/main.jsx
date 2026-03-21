import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FieldMonitorConfig from './pages/FieldMonitorMockups';
import DistanceFirstConcept from './pages/DistanceFirstConcept';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DistanceFirstConcept />} />
        <Route path="/config" element={<FieldMonitorConfig />} />
        <Route path="/distance-first" element={<DistanceFirstConcept />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
