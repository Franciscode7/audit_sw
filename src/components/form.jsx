import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { questions as q1 } from '../data/audit-v1/questions';// Datos de ejemplo para la auditoría
import { questions as q2 } from '../data/audit-v2/questions';// Datos de ejemplo para la auditoría
import { questions as q3 } from '../data/audit-v3/questions';// Datos de ejemplo para la auditoría
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";

import { useAuditoria } from './context';

function Form() {

  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [commentText, setCommentText] = useState('');


  const navigate = useNavigate();
 // Importante: usamos [] para desestructurar el array
  const [searchParams] = useSearchParams();
  // .get() es un método estándar de la interfaz URLSearchParams
  const categoria = searchParams.get("categoria");

  if (!categoria) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <button onClick={() => navigate('/')} className="btn btn-primary">Volver al Index</button>
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

  // Estado para almacenar los archivos indexados por el ID de la pregunta
  const [uploadedFiles, setUploadedFiles] = useState({});

  const handleFileChange = (questionId, event) => {
  const file = event.target.files[0]; // Captura el primer archivo seleccionado
  
    if (file) {
      setUploadedFiles(prevFiles => ({
        ...prevFiles,
        [questionId]: file // Guarda o actualiza el archivo para esta pregunta
      }));
    }
  };



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

  useEffect(() => {
    setSelectedOption(null);
    setCommentText('');
  }, [currentStep]);

  const handleNextStep = () => {
    const questionId = questions[currentStep].id;

    // Guardamos el paquete completo en el JSON de respuestas globales
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        respuesta: selectedOption,
        comentario: commentText.trim() // Si está vacío, guarda ""
      }
    }));

    // Avanzamos de pregunta de forma segura
    if (currentStep < totalQuestions - 1) {
      setCurrentStep(currentStep + 1);
    }

    console.log("Respuestas actuales:", {
      ...answers,
      [questionId]: {
        respuesta: selectedOption,
        comentario: commentText.trim()
      }
    });
  };

  useEffect(() => {
      const fileData = Object.keys(uploadedFiles).map(id => ({
        "ID Pregunta": id,
        "Nombre del Archivo": uploadedFiles[id].name
      }));

      // Esto pintará una hermosa tabla en tu consola
      console.table(fileData);
    }, [uploadedFiles]);


  const { setGlobalFiles } = useAuditoria();

  const handleFinalizar = () => {
    // 1. Guardamos los archivos pesados en el contexto
    setGlobalFiles(uploadedFiles); 
    
    // 2. Navegamos pasando solo los textos en el JSON
    // navigate(`/graficos?auditoria=${encodeURIComponent(categoria)}`, { 
    //   state: { auditoria: finalJSON } 
    // });
  };


  const goTable = () => {
    // Aquí generamos el JSON final

    setGlobalFiles(uploadedFiles);
    const finalJSON = {
      fecha: new Date().toISOString(),
      auditor: "PacoDev", // Podrías dinamizar esto luego
      respuestas: answers,
      completado: Object.keys(answers).length === totalQuestions
    };

    navigate(`/reportes?auditoria=${encodeURIComponent(categoria)}`, { state: { auditoria: finalJSON } });
    console.log("Navegando a tabla con datos:", finalJSON);
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

   const goTest = () => {
    setGlobalFiles(uploadedFiles);

    // Aquí generamos el JSON final
    const finalJSON = {
      fecha: new Date().toISOString(),
      auditor: "PacoDev", // Podrías dinamizar esto luego
      respuestas: answers,
      completado: Object.keys(answers).length === totalQuestions
    };

    navigate(`/test?auditoria=${encodeURIComponent(categoria)}`, { state: { auditoria: finalJSON } });
  };

  // useEffect(() => {
  //   console.log("📂 Estado actual de archivos por pregunta:", uploadedFiles["name"]);
  // }, [uploadedFiles]);

  // useEffect(() => {
  //   // Extraemos solo los nombres de los archivos guardados
  //   const fileNames = Object.keys(uploadedFiles).map(id => ({
  //     preguntaId: id,
  //     nombreArchivo: uploadedFiles[id].name
  //   }));

  //   console.log("📂 Lista de archivos guardados:", fileNames.map(f => f.nombreArchivo, f => f.preguntaId));
  // }, [uploadedFiles]);

    

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

      {/* 1. OPCIONES DE BOTONES (REQUERIDO) */}
      
       

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
                    onClick={() => setSelectedOption(option)} 
                    className={`btn btn-lg justify-start font-medium normal-case ${
                      selectedOption === option ? 'btn-success' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2 ${
                      selectedOption === option ? 'bg-primary-content text-primary' : 'bg-neutral text-neutral-content'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                ))}

                <textarea 
                  className="textarea textarea-bordered w-full" 
                  id="feedback" 
                  name="feedback" 
                  rows="3" 
                  placeholder="Escribe aquí tus comentarios si lo deseas..."
                  value={commentText} 
                  onChange={(e) => setCommentText(e.target.value)} 
                />

                {/* 3. Input File dinámico por ID de pregunta */}
                <div className="form-control w-full mt-4">
                  <label className="label">
                    <span className="label-text">Adjuntar imagen para esta pregunta:</span>
                  </label>
                  <input 
                    type="file" 
                    // Forzamos el renderizado del input al cambiar de pregunta o archivo para refrescar la interfaz visual
                    key={`${questions[currentStep].id}-${uploadedFiles[questions[currentStep].id]?.name || 'empty'}`}
                    className="file-input file-input-bordered w-full" 
                    accept="image/*" // Opcional: para limitar solo a imágenes
                    onChange={(e) => handleFileChange(questions[currentStep].id, e)}
                  />
                  
                  {/* Opcional: Mostrar feedback visual si ya hay un archivo cargado */}
                  {uploadedFiles[questions[currentStep].id] && (
                    <p className="text-sm text-success mt-1">
                      Archivo cargado: <strong>{uploadedFiles[questions[currentStep].id].name}</strong>
                    </p>
                  )}
                </div>

                 <button
                  onClick={handleNextStep}
                  // Súper importante: se queda deshabilitado hasta que elijan una opción
                  className="btn btn-primary mt-3 self-end px-8"
                >
                  Siguiente Pregunta
                </button>

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

          {currentStep === totalQuestions - 1 ? (
            <button 
              onClick={goTest}
              className="btn bg-orange-500 text-white grow"
            >
              Ver test
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