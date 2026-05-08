import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importa tus componentes (asegúrate de que las rutas sean correctas)
import Form from './components/form';
import Reports from './components/reports';
import Graphics from './components/graphics'; // Importa el nuevo componente
import Index from './components/Index';

function App() {
  return (
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;