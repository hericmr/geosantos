import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Map from './components/Map'
import './App.css'
import { ErrorBoundary } from './components/ErrorBoundary';

const AdminFamousPlaces = lazy(() =>
  import('./components/admin/AdminFamousPlaces').then(m => ({ default: m.AdminFamousPlaces }))
);
const FamousPlacesWiki = lazy(() =>
  import('./components/ui/FamousPlacesWiki').then(m => ({ default: m.FamousPlacesWiki }))
);

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter basename="/geosantos">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/admin/famous-places" element={<AdminFamousPlaces />} />
            <Route path="/lugares-famosos" element={<FamousPlacesWiki />} />
            <Route path="/" element={
              <div style={{
                margin: 0,
                padding: 0,
                width: '100vw',
                height: '100dvh',
                overflow: 'hidden'
              }}>
                <Map center={[-23.9618, -46.3322]} zoom={13} />
              </div>
            } />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
