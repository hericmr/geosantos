import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminFamousPlaces } from './components/admin/AdminFamousPlaces';
import Map from './components/Map'
import './App.css'
import { FamousPlacesWiki } from './components/ui/FamousPlacesWiki';
import { MobileDisplay } from './components/ui/MobileDisplay';
import { useMobileDetection } from './hooks/useMobileDetection';

function App() {
  const isMobile = useMobileDetection();
  const [showMobileDisplay, setShowMobileDisplay] = useState(false);

  // Se for mobile, mostra o componente MobileDisplay
  if (isMobile) {
    return (
      <BrowserRouter basename="/geosantos">
        <Routes>
          <Route path="/admin/famous-places" element={<AdminFamousPlaces />} />
          <Route path="/lugares-famosos" element={<FamousPlacesWiki />} />
          <Route path="/" element={
            <MobileDisplay 
              onClose={() => setShowMobileDisplay(false)}
            />
          } />
        </Routes>
      </BrowserRouter>
    );
  }

  // Se não for mobile, mostra a interface normal
  return (
    <BrowserRouter basename="/geosantos">
      <Routes>
        {/* Outras rotas do seu app */}
        {/* <Route path="/" element={<AppMain />} /> */}
        <Route path="/admin/famous-places" element={<AdminFamousPlaces />} />
        <Route path="/lugares-famosos" element={<FamousPlacesWiki />} />
        <Route path="/" element={
          <div style={{
            margin: 0,
            padding: 0,
            width: '100vw',
            height: '100vh',
            overflow: 'hidden'
          }}>
            <Map center={[-23.9618, -46.3322]} zoom={13} />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
