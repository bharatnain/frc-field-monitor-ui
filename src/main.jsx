import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FirstFieldMonitorRowMockup from '../first_field_monitor_row_mockup(1).tsx';
import DistanceFirstConcept from './pages/DistanceFirstConcept';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FirstFieldMonitorRowMockup />} />
        <Route path="/distance-first" element={<DistanceFirstConcept />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
