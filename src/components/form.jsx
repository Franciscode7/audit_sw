import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { questions as q1 } from '../data/audit-v1/questions';// Datos de ejemplo para la auditoría
import { questions as q2 } from '../data/audit-v2/questions';// Datos de ejemplo para la auditoría
import { questions as q3 } from '../data/audit-v3/questions';// Datos de ejemplo para la auditoría
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";

function Form() {

  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
 // Importante: usamos [] para desestructurar el array
  const [searchParams] = useSearchParams();
  // .get() es un método estándar de la interfaz URLSearchParams
  const categoria = searchParams.get("categoria");

  if (!categoria) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <button onClick={() => navigate('/')} className="btn btn-primary">Volver al Inicio</button>
      </div>
    );
  }

  const questionsMap = {
    "AuditV1": q1, // Aquí podrías importar otro set de preguntas para V2, V3, etc.
    "AuditV2": q2, // Reemplaza con el nuevo set de preguntas
    "AuditV3": q3, // Reemplaza con el nuevo set de preguntas
  };

  const questions = questionsMap[categoria]; // Fallback a V1

  const totalQuestions = questions.length;

  const [answers, setAnswers] = useState({}); // <--- ESTA ES LA QUE TE FALTA
  // Cálculo de progreso para DaisyUI (valor de 0 a 100)
  const progressValue = ((currentStep + 1) / totalQuestions) * 100;

  const handleAnswer = (option) => {
    // Actualizamos el JSON de respuestas. 
    // Usamos el ID como llave para que nunca haya repetidos.
    setAnswers(prev => ({
      ...prev,
      [questions[currentStep].id]: option
    }));

    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goTable = () => {
    // Aquí generamos el JSON final
    const finalJSON = {
      fecha: new Date().toISOString(),
      auditor: "PacoDev", // Podrías dinamizar esto luego
      respuestas: answers,
      completado: Object.keys(answers).length === totalQuestions
    };

    navigate(`/reportes?auditoria=${encodeURIComponent(categoria)}`, { state: { auditoria: finalJSON } });
  };

    const goGraph = () => {
    // Aquí generamos el JSON final
    const finalJSON = {
      fecha: new Date().toISOString(),
      auditor: "PacoDev", // Podrías dinamizar esto luego
      respuestas: answers,
      completado: Object.keys(answers).length === totalQuestions
    };

    navigate(`/graficos?auditoria=${encodeURIComponent(categoria)}`, { state: { auditoria: finalJSON } });
  };

  return (
    <div className="min-h-screen bg-base-200 flex flex-col items-center p-4">
      
      {/* HEADER CON PROGRESO */}
      <header className="w-full max-w-md mt-8 mb-12">
        <div className="flex justify-between items-end mb-2 px-2">
          <span className="text-xs font-bold text-primary">PASO {currentStep + 1} DE {totalQuestions}</span>
          <span className="text-xs font-bold text-primary">{Math.round(progressValue)}%</span>
        </div>
        <progress 
          className="progress progress-primary w-full h-3 shadow-sm" 
          value={progressValue} 
          max="100"
        ></progress>
      </header>

      {/* CONTENEDOR PRINCIPAL (MOBILE FIRST) */}
      <main className="w-full max-w-md flex-grow flex items-start">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="card w-full bg-base-100 shadow-xl border border-base-300"
          >
            <div className="card-body gap-6">
              <h2 className="card-title text-xl text-gray-800 leading-tight">
                {questions[currentStep].text}
              </h2>
              
              <div className="flex flex-col gap-3 mt-4">
                {questions[currentStep].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className="btn btn-outline btn-primary btn-lg justify-start font-medium normal-case"
                  >
                    <span className="bg-primary text-primary-content rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>

              {/* Botón para retroceder si no es la primera pregunta */}
              {currentStep > 0 && (
                <div className="card-actions justify-center mt-6">
                  <button 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="btn btn-ghost btn-sm text-base-content/50"
                  >
                    Anterior
                  </button>
                </div>
              )}
            </div>

            {/* Dentro del main, después del bloque de opciones */}
        <div className="card-actions justify-between mt-8">
          {currentStep > 0 && (
            <button 
              onClick={() => setCurrentStep(currentStep - 1)}
              className="btn btn-ghost"
            >
              Anterior
            </button>
          )}

          {currentStep === totalQuestions - 1 ? (
            <button 
              onClick={goTable}
              className="btn btn-success text-white grow"
            >
              Ver tabla
            </button>
          ) : null}

          {currentStep === totalQuestions - 1 ? (
            <button 
              onClick={goGraph}
              className="btn bg-orange-500 text-white grow"
            >
              Ver grafico
            </button>
          ) : null}
        </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="py-6 text-base-content/30 text-xs">
        Auditoria SW v1.0
      </footer>
    </div>
  );
}

export default Form;