import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Q1, Q2, Q3} from '../data/restaurante_q/questions';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { downloadPDF } from '../utils/functions';

import { useAuditoria } from './context';

function Reports() {
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef();

  const { globalFiles } = useAuditoria();
  console.log("🔍 Contenido inicial de globalFiles en Test.jsx:", globalFiles);
  const fileIds = Object.keys(globalFiles);

  // const downloadPDF = () => {
  //   const element = reportRef.current;

  //   // 1. Clonamos el elemento para no afectar la vista del usuario
  //   const clonedElement = element.cloneNode(true);
    
  //   // 2. Quitamos todas las clases de DaisyUI que causan conflicto (opcional pero seguro)
  //   // O mejor, forzamos que todos los colores sean RGB/HEX en el clon
  //   clonedElement.style.color = 'black';
  //   clonedElement.style.backgroundColor = 'white';
    
  //   // Buscamos todos los elementos dentro del clon y forzamos el color
  //   const allElements = clonedElement.querySelectorAll('*');
  //   allElements.forEach(el => {
  //     // Si el elemento tiene clases de DaisyUI, forzamos colores seguros
  //     if (el.classList.contains('badge') || el.classList.contains('btn')) {
  //       el.style.backgroundColor = '#eeeeee'; // Gris claro estándar
  //       el.style.color = '#000000';
  //       el.style.borderColor = '#cccccc';
  //     }
  //   });

  //   const opt = {
  //     margin: 10,
  //     filename: `Auditoria de ${auditData.auditor}.pdf`,
  //     image: { type: 'jpeg', quality: 1 },
  //     html2canvas: { 
  //       scale: 4, 
  //       useCORS: true,
  //       logging: false,
  //       imageTimeout: 0,
  //       state: 'ready',
  //       // Importante: No dejar que oklch se cuele
  //       onclone: (document) => {
  //         // Aquí podrías manipular el DOM clonado antes de la captura
  //       }
  //     },
  //     jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  //   };

  //   // Ejecutar la conversión
  //   html2pdf().set(opt).from(clonedElement).save();
  // };

  const handleDownload = () => {
    const auditorName = prompt("Por favor, ingresa el nombre del auditor para el reporte:");

    // 2. Si el usuario le dio a "Cancelar" o dejó el campo completamente vacío, frenamos la descarga
    if (auditorName=== null || auditorName.trim() === "") {
      // Opcional: puedes mandar un alert normal avisando que se canceló
      alert("Descarga cancelada: El nombre del auditor es obligatorio.");
      return; 
    }

    downloadPDF(reportRef.current, auditData, 'respuestas', auditorName);
  };
  
  const [searchParams] = useSearchParams();
  // .get() es un método estándar de la interfaz URLSearchParams
  const auditoria = searchParams.get("auditoria");

  const questionsMap = {
    "AuditV1": Q1, // Aquí podrías importar otro set de preguntas para V2, V3, etc.
    "AuditV2": Q2, // Reemplaza con el nuevo set de preguntas
    "AuditV3": Q3, // Reemplaza con el nuevo set de preguntas
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
    <div className='mx-6'>

      <div className="fixed inset-0 bg-[#111111] text-[#ffffff] z-[9999] flex flex-col items-center justify-center p-6 text-center landscape:hidden">
      <div className="animate-bounce text-4xl mb-4">🔄</div>
      <h2 className="text-xl font-bold mb-2">Por favor, gira tu dispositivo</h2>
      <p className="text-sm opacity-80 text-gray-300">
        Este reporte contiene gráficas detalladas y requiere una vista horizontal para visualizarse de forma óptima.
      </p>
    </div> 

      <div className="flex flex-col gap-4 mb-0 w-full">
        {/* FILA SUPERIOR: Título y Botones de Navegación */}
        <div className="flex flex-col md:flex-row md:justify-between mt-4 mx-2 md:items-center gap-4">

          {/* Contenedor para Home y Ver Gráfica (repartidos al 50% cada uno) */}
          <div className="flex flex-1 w-full md:max-w-md gap-2">
            <button 
              onClick={() => navigate(`/`)}
              className="btn btn-outline btn-md flex-1"
            >
              Home
            </button>
            
            <button 
              onClick={() => navigate(`/graficos?auditoria=${encodeURIComponent(auditoria)}`, { state: { auditoria: auditData } })}
              className="btn btn-outline btn-md flex-1"
            >
              Ver Grafica
      </button>
    </div>
      </div>

      {/* FILA INFERIOR: Botón de Descarga Centrado */}
      <div className="flex justify-center mx-2 mb-4 w-full">
        <button 
          onClick={handleDownload} 
          className="btn btn-primary shadow-lg btn-md w-40 sm:w-auto sm:px-12"
        >
          Descargar PDF
        </button>
      </div>
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
              <th className="px-4 py-3 text-sm font-bold text-gray-700 w-32 text-center">Pregunta</th>
              <th className="px-4 py-3 text-sm font-bold text-gray-700 w-8 text-center">Respuesta</th>
              <th className="px-4 py-3 text-sm font-bold text-gray-700 w-32 text-center">Comentario</th>
              <th className="px-4 py-3 text-sm font-bold text-gray-700 w-32 text-center">Foto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {questions.map((q) => (
              
              <tr key={q.id}>
                <td className="px-4 py-3 text-sm text-gray-600">{q.id}</td>
                <td className="px-4 py-3 text-sm text-gray-800 text-center font-medium">{q.text}</td>

                <td className="px-4 py-3 text-sm text-center">
                    {/* <span className="text">{auditData.respuestas[q.id]?.respuesta}</span> */}
                  <span 
                  className={`font-bold px-2 py-1 rounded ${
                    auditData.respuestas[q.id]?.respuesta === 'Sí'
                    ? 'text-green-700' 
                    : auditData.respuestas[q.id]?.respuesta === 'Parcialmente'
                    ? 'text-yellow-500' 
                    : 'text-red-700'
                  }`}>
                    {auditData.respuestas[q.id]?.respuesta}
                  </span>
                </td>

                <td className="px-8 py-6 text-sm text-center">
                  {/* Entramos a .comentario para pintar el texto del textarea */}
                  <span className="font-bold px-2 py-1 rounded">{auditData.respuestas[q.id]?.comentario || "Sin comentario"}</span>
                </td>

                {/* <td className="px-4 py-3 text-sm text-center">
                  
                  {fileIds.map((id) => {
                    const file = globalFiles[id];
                    // Creamos la URL temporal para la etiqueta <img>

                    const imagenUrl = URL.createObjectURL(file);

                    return (
                      <img 
                        src={imagenUrl} 
                        alt={`Evidencia ${id}`} 
                        // Revocamos la URL de memoria cuando la imagen se desmonte para evitar fugas de memoria
                        // onLoad={() => URL.revokeObjectURL(imagenUrl)}
                      />
                    );
                  })}
                 
                </td> */}

                <td className="px-4 py-3 text-sm text-center">
                  {/* {globalFiles[q.id] ? (
                    <div className="flex justify-center">
                      <img 
                        src={URL.createObjectURL(globalFiles[q.id])} 
                        alt={`Evidencia ${q.id}`} 
                        className="w-30 h-30 object-cover rounded shadow-sm border-gray-200"
                      />
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-xs">Sin imagen</span>
                  )} */}
                  {globalFiles[q.id] && globalFiles[q.id].length > 0 ? (
  /* Contenedor tipo grid o flex para alinear múltiples imágenes */
                    <div className="flex flex-wrap justify-center gap-2">
                      {globalFiles[q.id].map((file, index) => (
                        <img 
                          key={`${q.id}-img-${index}`}
                          src={URL.createObjectURL(file)} 
                          alt={`Evidencia ${q.id} - Imagen ${index + 1}`} 
                          className="w-30 h-30 object-cover rounded shadow-sm border border-gray-200" 
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-xs">Sin imagen</span>
                  )}
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