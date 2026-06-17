import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Q1, Q2, Q3} from '../data/restaurante_q/questions';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";
import heic2any from "heic2any";

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
    "AuditV1": Q1, 
    "AuditV2": Q2, 
    "AuditV3": Q3, 
  };

  const questions = questionsMap[categoria]; // Fallback a V1

  const totalQuestions = questions.length;

  // Estado para almacenar los archivos indexados por el ID de la pregunta
  const [uploadedFiles, setUploadedFiles] = useState({});





  

  const handleFileChange = async (questionId, event) => {
  const filesSelected = Array.from(event.target.files);
  if (filesSelected.length === 0) return;

  const processedFiles = await Promise.all(
    filesSelected.map(async (file) => {
      // Verificamos si el archivo es HEIC por su tipo o extensión
      if (file.type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
        try {
          // Convertimos el HEIC a un Blob JPEG nativo
          const convertedBlob = await heic2any({
            blob: file,
            toType: "image/jpeg",
            quality: 0.7 // ¡De paso lo comprimimos un poco para que no pese tanto!
          });

          // Retornamos el nuevo archivo con formato e información corregida
          return new File(
            [Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob], 
            file.name.replace(/\.heic$/i, ".jpg"), 
            { type: "image/jpeg" }
          );
        } catch (error) {
          console.error("Error al convertir formato HEIC:", error);
          return file; // Si falla, devolvemos el original por seguridad
        }
      }
      return file; // Si ya es JPG/PNG, pasa directo sin tocarlo
    })
  );
  
    if (processedFiles.length > 0) {
      // setUploadedFiles(prevFiles => ({
      //   ...prevFiles,
      //   [questionId]: processedFiles // Guarda o actualiza los archivos para esta pregunta
      // }));
      setUploadedFiles((prevFiles) => {
        // Obtenemos los archivos que ya existían para esta pregunta (si no hay, empezamos con un array vacío)
        const existingFiles = prevFiles[questionId] || [];
        
        return {
          ...prevFiles,
          // Sumamos los archivos anteriores con los recién procesados
          [questionId]: [...existingFiles, ...processedFiles]
        };
      });
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

  // useEffect(() => {
  //     const fileData = Object.keys(uploadedFiles).map(id => ({
  //       "ID Pregunta": id,
  //       "Nombre del Archivo": uploadedFiles[id].name
  //     }));

  //     // Esto pintará una hermosa tabla en tu consola
  //     console.table(fileData);
  //   }, [uploadedFiles]);

  useEffect(() => {
  // Usamos flatMap para aplanar el resultado, ya que una pregunta puede tener varios archivos
  const fileData = Object.keys(uploadedFiles).flatMap(id => {
    const filesArray = uploadedFiles[id] || [];
        
        // Mapeamos cada archivo individual de esta pregunta
        return filesArray.map(file => ({
          "ID Pregunta": id,
          "Nombre del Archivo": file.name,
          "Tamaño (KB)": (file.size / 1024).toFixed(2), // ¡Bonus! Esto viene genial para auditar
          "Tipo": file.type
        }));
      });

      // Si hay archivos, los pintamos en la hermosa tabla de la consola
      if (fileData.length > 0) {
        console.table(fileData);
      }
    }, [uploadedFiles]);


  const { setGlobalFiles } = useAuditoria();

  const handleFinalizar = () => {
    // 1. Guardamos los archivos pesados en el contexto
    setGlobalFiles(uploadedFiles); 
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
      <div className="w-full max-w-md mt-0 mb-2">
        <span className="text-lg font-bold text-primary text-center mb-0">Pregunta {currentStep + 1} de {totalQuestions}</span>
        <div className="flex justify-between items-end text-center mb-0 px-2">
          <span className="text-xs font-bold text-primary">0%</span>
          <span className="text-xs font-bold text-primary">{Math.round(progressValue)}%</span>
        </div>
        <progress 
          className="progress progress-primary w-full h-3 shadow-sm" 
          value={progressValue} 
          max="100"
        ></progress>
      </div>

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
              <h2 className="card-title text-lg text-gray-800 leading-tight">
                {questions[currentStep].text}
              </h2>
              
              <div className="flex flex-col gap-3 mt-0">
                {questions[currentStep].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedOption(option)} 
                    className={`btn btn-lg text-center text-2xl font-medium  text-gray-800 normal-case ${
                      selectedOption === option ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    {/* <span className={`rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2 ${
                      selectedOption === option ? 'bg-primary-content text-primary' : 'bg-neutral text-neutral-content'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span> */}
                    {option}
                  </button>
                ))}

                <textarea 
                  className="textarea textarea-bordered w-full text-black" 
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
                <div className="flex flex-col gap-4 w-full">
  
                  {/* 1. DISPARADORES (Fijos 50/50 en horizontal, uno abajo del otro en móviles) */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    {/* Botón de Galería */}
                    <label className="file-input file-input-bordered flex-1 flex items-center cursor-pointer bg-base-100 text-base-content border-gray-300 hover:bg-base-200 justify-center py-3 px-4 rounded-lg transition-colors border">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        multiple
                        key={`gallery-${questions[currentStep].id}-${uploadedFiles[questions[currentStep].id]?.length || 0}`}
                        onChange={(e) => handleFileChange(questions[currentStep].id, e)}
                      />
                      <span className="font-medium flex items-center gap-2">
                        📂 Seleccionar de Galería
                      </span>
                    </label>

                    {/* Botón de Cámara */}
                    <label className="file-input file-input-bordered flex-1 flex items-center cursor-pointer bg-base-100 text-base-content border-gray-300 hover:bg-base-200 justify-center py-3 px-4 rounded-lg transition-colors border">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        capture="environment"
                        key={`camera-${questions[currentStep].id}-${uploadedFiles[questions[currentStep].id]?.length || 0}`}
                        onChange={(e) => handleFileChange(questions[currentStep].id, e)}
                      />
                      <span className="font-medium flex items-center gap-2">
                        📸 Tomar Foto
                      </span>
                    </label>
                  </div>

                  {/* 2. CONTENEDOR DE ESTADO VISUAL (Solo cambia abajo) */}
                  <div className="w-full mt-1">
                    {uploadedFiles[questions[currentStep].id]?.length > 0 ? (
                      <div className="alert alert-success bg-green-100 border-green-300 text-green-800 flex flex-col items-start gap-2 p-3 rounded-lg">
                        <div className="flex items-center gap-2 w-full justify-between">
                          <span className="font-semibold text-sm flex items-center gap-1.5">
                            ✓ Evidencias listas:
                          </span>
                          <span className="badge badge-success text-white font-bold">
                            {uploadedFiles[questions[currentStep].id].length} archivos
                          </span>
                        </div>
                        
                        {/* Pequeña lista de nombres para que el usuario sepa cuáles van */}
                        <div className="text-xs opacity-90 max-h-20 overflow-y-auto w-full border-t border-green-200 pt-1.5 mt-0.5">
                          {uploadedFiles[questions[currentStep].id].map((file, idx) => (
                            <div key={idx} className="truncate">
                              ✅ {file.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Estado vacío estandarizado */
                      <div className="border border-dashed border-gray-300 bg-gray-50 text-gray-400 text-center py-3 rounded-lg text-sm italic">
                        Ningún archivo o foto capturada para esta pregunta.
                      </div>
                    )}
                  </div>

                </div>

                </div>
                  <div className="card-actions justify-center mt-0">
                    <button
                      onClick={handleNextStep}
                      disabled={!selectedOption}
                      // Súper importante: se queda deshabilitado hasta que elijan una opción
                      className=" text-lg btn bg-blue-500 text-white mt-3 justify-center self-end px-8 hover:bg-white hover:text-blue-500 hover:border-blue-500"
                    >
                      Siguiente Pregunta
                    </button>
                </div>

              </div>

              {/* Botón para retroceder si no es la primera pregunta */}
              {currentStep > 0 && (
                <div className="card-actions justify-center mt-0">
                  <button 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="text-lg btn btn-ghost btn-sm text-base-content/50 hover:text-red-500"
                  >
                    Anterior
                  </button>
                </div>
              )}
            </div>

        <div className="card-actions justify-between mt-8">
      
          {currentStep === totalQuestions - 1 ? (
           <div className="flex w-full gap-2">
          <button 
            onClick={goTable}
            className="btn btn-success text-white flex-1"
          >
            Ver tabla
          </button>

          <button 
            onClick={goGraph}
            className="btn bg-orange-500 text-white flex-1"
          >
            Ver grafico
          </button>
        </div>

          ) : null}
        </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="py-6 text-base-content/30 text-xs">
        Auditoria SW v1.0 by <a href="https://github.com/Franciscode7/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">PacoDev</a>
      </footer>

   </div>
  );
}

export default Form;