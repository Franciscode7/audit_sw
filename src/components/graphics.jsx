import React, { useState, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Q1, Q2, Q3} from '../data/restaurante_q/questions';
import { downloadPDF } from '../utils/functions';

function Graphics() {
  const location = useLocation();
  const navigate = useNavigate();
  const auditData = location.state?.auditoria;
  const reportRef = useRef();

  const [searchParams] = useSearchParams();
  // .get() es un método estándar de la interfaz URLSearchParams
  const auditoria = searchParams.get("auditoria");

  const questionsMap = {
      "AuditV1": Q1, // Aquí podrías importar otro set de preguntas para V2, V3, etc.
      "AuditV2": Q2, // Reemplaza con el nuevo set de preguntas
      "AuditV3": Q3, // Reemplaza con el nuevo set de preguntas
    };
  
  const questions = questionsMap[auditoria]; 


  if (!auditData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <button onClick={() => navigate('/')} className="btn btn-primary">Volver al Inicio</button>
      </div>
    );
  }

  const handleDownload = () => {
    const auditorName = prompt("Por favor, ingresa el nombre del auditor para el reporte:");

    // 2. Si el usuario le dio a "Cancelar" o dejó el campo completamente vacío, frenamos la descarga
    if (auditorName=== null || auditorName.trim() === "") {
      // Opcional: puedes mandar un alert normal avisando que se canceló
      alert("Descarga cancelada: El nombre del auditor es obligatorio.");
      return; 
    }

    downloadPDF(reportRef.current, auditData, 'gráficos', auditorName);
  };
  
  
  const aprobatoria = 80;
  const respuestas7 = Object.values(auditData.respuestas);

  // Extrae y aplana todos los arreglos 'respuesta' en uno solo
  const todasLasRespuestas = respuestas7.flatMap(item => item.respuesta);

  // Procesar datos para las gráficas
  const todaslasRespuestas = Object.values(auditData.respuestas);
  const counts = {
    Cumple: todasLasRespuestas.filter(r => r === 'Sí' || r === 'Cumple').length,
    NoCumple: todasLasRespuestas.filter(r => r === 'No' || r === 'No Cumple').length,
    Parcialmente: todasLasRespuestas.filter(r => r === 'Parcialmente').length
  };

  const data = [
    { name: 'Cumple', value: counts.Cumple, color: '#36D399' },
    { name: 'Parcialmente', value: counts.Parcialmente, color: '#FBBD23' },
    { name: 'No Cumple', value: counts.NoCumple, color: '#F87272' }
  ].filter(d => d.value > 0);

  const resultado = Math.round((counts.Cumple + (counts.Parcialmente / 2)) / (questions.length) * 100);

  return (
      

    <div className="p-4 max-w-4xl mx-auto pb-10">

      <div className="flex flex-col gap-4 mb-0 w-full">
        {/* FILA SUPERIOR: Título y Botones de Navegación */}
        <div className="flex flex-col md:flex-row md:justify-between mt-0 mx-2 md:items-center gap-4">

          {/* Contenedor para Home y Ver Gráfica (repartidos al 50% cada uno) */}
          <div className="flex flex-1 w-full md:max-w-md gap-2">
            <button 
              onClick={() => navigate(`/`)}
              className="btn btn-outline btn-md flex-1"
            >
              Home
            </button>
            
            <button 
               onClick={() => navigate(`/reportes?auditoria=${encodeURIComponent(auditoria)}`, { state: { auditoria: auditData } })}
              className="btn btn-outline btn-md flex-1"
            >
              Ver resumen
      </button>
    </div>
      </div>

      {/* FILA INFERIOR: Botón de Descarga Centrado */}
      <div className="flex justify-center mx-2 mb-4 w-full">
        <button 
          onClick={handleDownload} 
          className="btn btn-primary shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] btn-md w-40 sm:w-auto sm:px-12"
        >
          Descargar PDF
        </button>
      </div>
      </div>

    <div className="fixed inset-0 bg-[#111111] text-[#ffffff] z-[9999] flex flex-col items-center justify-center p-6 text-center landscape:hidden">
      <div className="animate-bounce text-4xl mb-4">🔄</div>
      <h2 className="text-xl font-bold mb-2">Por favor, gira tu dispositivo</h2>
      <p className="text-sm opacity-80 text-gray-300">
        Este reporte contiene gráficas detalladas y requiere una vista horizontal para visualizarse de forma óptima.
      </p>
    </div> 


    <div ref={reportRef} className="bg-[#ffffff] w-[700px] mx-auto hidden landscape:block py-4">

      {/* CONTENEDOR DE ESTADÍSTICAS (Sustituye a 'stats') */}
      <div className="w-[95%] mx-auto shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] mb-6 text-[#000000] rounded-lg">
        {/* BLOQUE DE ESTADÍSTICA (Sustituye a 'stat') */}
        <div className={`p-6 rounded-lg flex flex-col gap-1 transition-colors duration-300 ${
          resultado >= aprobatoria 
            ? 'bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]' 
            : 'bg-[#fee2e2] text-[#991b1b] border border-[#fca5a5]'
        }`}>
          {/* Título */}
          <div className={`text-3xl font-semibold tracking-wide opacity-80 w-full text-center ${
            resultado >= aprobatoria ? 'text-[#065f46]' : 'text-[#991b1b]'
          }`}>
            Puntaje Final
          </div>

          {/* Valor grande */}
          <div className={`text-4xl font-extrabold w-full text-center mt-[4px] ${
            resultado >= aprobatoria ? 'text-[#10b981]' : 'text-[#ef4444]'
          }`}>
            {resultado}%
          </div>

          {/* Descripción inferior */}
          <div className={`text-4xl font-medium opacity-75 w-full text-center ${
            resultado >= aprobatoria ? 'text-[#047857]' : 'text-[#b91c1c]'
          }`}>
            {resultado >= aprobatoria ? "✓ Auditoría Aprobada" : "⚠ Auditoría Reprobada"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 w-[95%] mx-auto">
        {/* GRÁFICA DE PASTEL (DISTRIBUCIÓN) - (Sustituye a 'card') */}
        <div className="bg-[#ffffff] border border-[#e5e7eb] rounded-lg shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] p-6">
          {/* Título de Tarjeta (Sustituye a 'card-title') */}
          <h2 className="text-xl font-bold mb-4 text-[#000000] block w-full text-center">Distribución de Resultados</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {/* <Legend wrapperStyle={{ color: '#000000' }} /> */}
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 mt-0 w-full">
            {(() => {
              // Calculamos el total sumando los valores que sobrevivieron al filtro
              const total = data.reduce((sum, item) => sum + item.value, 0);

              return data.map((entry, index) => {
                // Sacamos el porcentaje entero (ej: 50%)
                const porcentaje = total > 0 ? Math.round((entry.value / total) * 100) : 0;

                return (
                  <div key={index} className="flex items-center justify-center gap-2 shrink-0">
                    <span 
                      className="w-5 h-5 rounded-sm block shrink-0 border-[1.5px] border-[#000000]" 
                      style={{ backgroundColor: entry.color }}
                    />
                    {/* Imprime: Cumple (50%) */}
                    <span className="text-sm font-medium text-[#000000] whitespace-nowrap">
                      {entry.name} <span className="font-bold opacity-75">({porcentaje}%)</span>
                    </span>
                  </div>
                );
              });
            })()}
          </div>
          
        </div>

        {/* GRÁFICA DE BARRAS (COMPARATIVA) - (Sustituye a 'card') */}
        <div className="bg-[#ffffff] border border-[#e5e7eb] rounded-lg shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] p-6">
          {/* Título de Tarjeta (Sustituye a 'card-title') */}
          <h2 className="text-xl font-bold text-[#000000] mb-4 w-full text-center">Resumen en Barras</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#000000" strokeWidth={0.5} />
                <YAxis stroke="#000000" strokeWidth={0.5} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>

  </div>  
  );
}

export default Graphics;