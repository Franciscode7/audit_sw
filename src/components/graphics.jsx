import React from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { questions as q1 } from '../data/audit-v1/questions';// Datos de ejemplo para la auditoría
import { questions as q2 } from '../data/audit-v2/questions';// Datos de ejemplo para la auditoría
import { questions as q3 } from '../data/audit-v3/questions';// Datos de ejemplo para la auditoría

function Graphics() {
  const location = useLocation();
  const navigate = useNavigate();
  const auditData = location.state?.auditoria;

  const [searchParams] = useSearchParams();
  // .get() es un método estándar de la interfaz URLSearchParams
  const auditoria = searchParams.get("auditoria");

  const questionsMap = {
      "AuditV1": q1, // Aquí podrías importar otro set de preguntas para V2, V3, etc.
      "AuditV2": q2, // Reemplaza con el nuevo set de preguntas
      "AuditV3": q3, // Reemplaza con el nuevo set de preguntas
    };
  
  const questions = questionsMap[auditoria]; 


  if (!auditData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <button onClick={() => navigate('/')} className="btn btn-primary">Volver al Inicio</button>
      </div>
    );
  }

  // Procesar datos para las gráficas
  const respuestasArray = Object.values(auditData.respuestas);
  const counts = {
    Cumple: respuestasArray.filter(r => r === 'Sí' || r === 'Cumple').length,
    NoCumple: respuestasArray.filter(r => r === 'No' || r === 'No Cumple').length,
    NA: respuestasArray.filter(r => r === 'N/A').length
  };

  const data = [
    { name: 'Cumple', value: counts.Cumple, color: '#36D399' },
    { name: 'No Cumple', value: counts.NoCumple, color: '#F87272' },
    { name: 'N/A', value: counts.NA, color: '#FBBD23' }
  ].filter(d => d.value > 0);

  return (
    <div className="p-4 max-w-4xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Análisis Estadístico</h1>
        <button 
          onClick={() => navigate(`/reportes?auditoria=${encodeURIComponent(auditoria)}`, { state: { auditoria: auditData } })}
          className="btn btn-outline btn-sm"
        >
          Ver Tabla
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* GRÁFICA DE PASTEL (DISTRIBUCIÓN) */}
        <div className="card bg-base-100 shadow-xl p-6">
          <h2 className="card-title mb-4 text-center block">Distribución de Resultados</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GRÁFICA DE BARRAS (COMPARATIVA) */}
        <div className="card bg-base-100 shadow-xl p-6">
          <h2 className="card-title mb-4">Resumen en Barras</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* INDICADOR DE PORCENTAJE */}
        <div className="stats shadow bg-primary text-primary-content">
          <div className="stat">
            <div className="stat-title text-primary-content opacity-70">Efectividad Total</div>
            <div className="stat-value">
              {Math.round((counts.Cumple / (questions.length - counts.NA)) * 100)}%
            </div>
            <div className="stat-desc text-primary-content">Excluyendo N/A</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Graphics;