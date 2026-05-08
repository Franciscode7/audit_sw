import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { questions as q1 } from '../data/audit-v1/questions';// Datos de ejemplo para la auditoría
import { questions as q2 } from '../data/audit-v2/questions';// Datos de ejemplo para la auditoría
import { questions as q3 } from '../data/audit-v3/questions';// Datos de ejemplo para la auditoría
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

function Reports() {
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef();

  const downloadPDF = () => {
    const element = reportRef.current;

    // 1. Clonamos el elemento para no afectar la vista del usuario
    const clonedElement = element.cloneNode(true);
    
    // 2. Quitamos todas las clases de DaisyUI que causan conflicto (opcional pero seguro)
    // O mejor, forzamos que todos los colores sean RGB/HEX en el clon
    clonedElement.style.color = 'black';
    clonedElement.style.backgroundColor = 'white';
    
    // Buscamos todos los elementos dentro del clon y forzamos el color
    const allElements = clonedElement.querySelectorAll('*');
    allElements.forEach(el => {
      // Si el elemento tiene clases de DaisyUI, forzamos colores seguros
      if (el.classList.contains('badge') || el.classList.contains('btn')) {
        el.style.backgroundColor = '#eeeeee'; // Gris claro estándar
        el.style.color = '#000000';
        el.style.borderColor = '#cccccc';
      }
    });

    const opt = {
      margin: 10,
      filename: `Auditoria de ${auditData.auditor}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        // Importante: No dejar que oklch se cuele
        onclone: (document) => {
          // Aquí podrías manipular el DOM clonado antes de la captura
        }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Ejecutar la conversión
    html2pdf().set(opt).from(clonedElement).save();
  };

  // const downloadPDF = () => {
  //   window.print();
  // };

  const [searchParams] = useSearchParams();
  // .get() es un método estándar de la interfaz URLSearchParams
  const auditoria = searchParams.get("auditoria");

  const questionsMap = {
    "AuditV1": q1, // Aquí podrías importar otro set de preguntas para V2, V3, etc.
    "AuditV2": q2, // Reemplaza con el nuevo set de preguntas
    "AuditV3": q3, // Reemplaza con el nuevo set de preguntas
  };

  const questions = questionsMap[auditoria]; 
  
  // Extraemos el JSON del estado de la navegación
  const auditData = location.state?.auditoria;



   if (!auditData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <button onClick={() => navigate('/')} className="btn btn-primary">Volver al Inicio</button>
      </div>
    );
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Análisis Estadístico</h1>
            <button 
            onClick={() => navigate(`/graficos?auditoria=${encodeURIComponent(auditoria)}`, { state: { auditoria: auditData } })}
            className="btn btn-outline btn-sm"
            >
            Ver Grafica
            </button>
            <button onClick={downloadPDF} className="btn btn-primary shadow-lg">
            Descargar PDF
          </button>
        </div>


      {/* <div ref={reportRef} className="light" className="bg-white p-8 text-black" style={{ colorScheme: 'light' }}>
        <h1 className="text-xl text-gray-800 font-bold mb-4">Reporte de {auditData.auditor}</h1>
        <table className="table w-full bg-white shadow">
          <thead>
            <tr>
              <th>ID</th>
              <th>Pregunta</th>
              <th>Respuesta</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id}>
                <td>{q.id}</td>
                <td>{q.text}</td>
                <td className="font-bold text-primary">
                  {auditData.respuestas[q.id] || "N/R"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}

      <div ref={reportRef} className="bg-white p-10 text-black border border-gray-200">
      {/* Encabezado */}
      <h1 className="text-2xl text-gray-900 font-extrabold mb-6 pb-2 border-b-2 border-gray-800">
        Reporte de Auditoría: {auditData.auditor}
      </h1>

      {/* Tabla construida con Tailwind puro */}
      <div className="w-full overflow-hidden rounded-lg border border-gray-300">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300">
              <th className="px-4 py-3 text-sm font-bold text-gray-700 w-16">ID</th>
              <th className="px-4 py-3 text-sm font-bold text-gray-700">Pregunta</th>
              <th className="px-4 py-3 text-sm font-bold text-gray-700 w-32 text-center">Respuesta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {questions.map((q) => (
              <tr key={q.id}>
                <td className="px-4 py-3 text-sm text-gray-600">{q.id}</td>
                <td className="px-4 py-3 text-sm text-gray-800 font-medium">{q.text}</td>
                <td className="px-4 py-3 text-sm text-center">
                  <span className={`font-bold px-2 py-1 rounded ${
                    auditData.respuestas[q.id] === 'Sí' 
                    ? 'text-green-700' 
                    : 'text-red-700'
                  }`}>
                    {auditData.respuestas[q.id] || "N/R"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pie de página del PDF */}
      <div className="mt-8 pt-4 border-t border-gray-100 text-[10px] text-gray-400 flex justify-between">
        <p>Fecha de generación: {new Date(auditData.fecha).toLocaleString()}</p>
        <p>Firma: ___________________________</p>
      </div>
          </div>

    </div>
    );
  }

export default Reports;