import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuditoriaProvider } from './components/context'; // Asegúrate de que la ruta sea correcta

// Importa tus componentes (asegúrate de que las rutas sean correctas)
import Form from './components/form';
import Reports from './components/reports';
import Graphics from './components/graphics'; // Importa el nuevo componente
import Index from './components/Index';
import Test from './components/test';

function App() {
  return (
    <AuditoriaProvider>
      <Router>
        <div className="min-h-screen bg-base-200">
          <Routes>

            {/* 2. Ruta del Formulario (Auditoría) */}
            <Route path="/" element={<Index />} />

            {/* 2. Ruta del Formulario (Auditoría) */}
            <Route path="/formulario" element={<Form />} />

            {/* 2. Ruta del Formulario (Auditoría) */}
            <Route path="/reportes" element={<Reports />} />

            {/* 3. Ruta de Gráficos */}
            <Route path="/graficos" element={<Graphics />} />

            {/* 3. Ruta de Gráficos */}
            <Route path="/test" element={<Test />} />
          </Routes>
        </div>
      </Router>
    </AuditoriaProvider>
  );
}

export default App;