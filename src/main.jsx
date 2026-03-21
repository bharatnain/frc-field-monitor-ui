import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FieldMonitorMockups from './pages/FieldMonitorMockups';
import DistanceFirstConcept from './pages/DistanceFirstConcept';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DistanceFirstConcept />} />
        <Route path="/concepts" element={<FieldMonitorMockups />} />
        <Route path="/distance-first" element={<DistanceFirstConcept />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
