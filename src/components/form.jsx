import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Q1, Q2, Q3} from '../data/restaurante_q/questions';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from "react-router-dom";
import heic2any from "heic2any";
import { get, set } from 'idb-keyval';
import { saveImagesToDB, db } from '../db/db';

import { useAuditoria } from './context';

function Form() {

  // const [currentStep, setCurrentStep] = useState(0);

  const [selectedOption, setSelectedOption] = useState(null);
  const [commentText, setCommentText] = useState('');

  // Al inicio de tu componente, junto a tus otros estados:
  const [showResumeBanner, setShowResumeBanner] = useState(false);

  
  const navigate = useNavigate();
 // Importante: usamos [] para desestructurar el array
  const [searchParams] = useSearchParams();
  // .get() es un método estándar de la interfaz URLSearchParams
  const categoria = searchParams.get("categoria");
  const auditoriaNombre = searchParams.get("nombre");
  const paramDraftId = searchParams.get("draftId");

  console.log("categoria");
  console.log(categoria);
  console.log("nombre");
  console.log(auditoriaNombre);
  console.log("id del borrador");
  console.log(paramDraftId);


  if (!categoria && !searchParams.get("nombre")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <button onClick={() => navigate('/')} className="btn btn-primary">Volver al Index</button>
      </div>
    );
  }

  let cleanName = "";

  if (auditoriaNombre) {
    cleanName = auditoriaNombre
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '');
  }

  const shortId = Math.random().toString(36).substring(2, 7);

// 3. Tu STORAGE_KEY final y profesional queda indestructible:

// El ID se calcula una sola vez de forma estricta:
  const auditId = useMemo(() => {
    // 1. Si viene por URL (porque el usuario le dio a "Continuar"), respetamos ese ID exacto
    if (paramDraftId) return paramDraftId;

    // 2. Si es una auditoría totalmente nueva, generamos el ID único solo en este instante
    const shortId = Math.random().toString(36).substring(2, 7);
    const baseName = cleanName;
    return `${cleanName}-${shortId}`;
  }, [paramDraftId]);
    
  let UniqId = "";

  if (paramDraftId) {
    console.log("id de draf");
    UniqId = paramDraftId;
    console.log(UniqId);
  }else{
    console.log("nombre nuevo")
    UniqId = `Borrador_${auditId}`;
    console.log(UniqId);
  }

  const STORAGE_KEY = UniqId;
  
  console.log("Clave de almacenamiento local para esta auditoría:", STORAGE_KEY);

  const questionsMap = {
    "AuditV1": Q1, 
    "AuditV2": Q2, 
    "AuditV3": Q3, 
  };

  const questions = questionsMap[categoria]; // Fallback a V1

  const totalQuestions = questions.length;

  const [currentStep, setCurrentStep] = useState(() => {
  const savedAnswers = localStorage.getItem(STORAGE_KEY);
  console.log("Verificando borrador local al iniciar el componente:", savedAnswers);
  
  if (!savedAnswers) {
    console.log("No hay borrador local para cargar.");
    return 0;
  }

  console.log("Cargando borrador local:", savedAnswers);
  const parsedAnswers = JSON.parse(savedAnswers);
  
  // Extraemos únicamente el subobjeto 'answers' (o usamos 'parsed' directo si es formato antiguo)
  const answersObj = parsedAnswers.answers;

  console.log("indice preguntas");
  console.log(answersObj);

  const answeredIds = Object.keys(answersObj);
  console.log("Preguntas respondidas previamente:", answeredIds);

  if (answeredIds.length === 0) return 0;

  // Buscamos el índice de la última pregunta que tenga una respuesta registrada
  // Asumiendo que 'questions' es tu array con todas las preguntas
  const lastAnsweredId = answeredIds[answeredIds.length - 1];
  console.log("Última pregunta respondida ID:", lastAnsweredId);

  const lastIndex = lastAnsweredId;
  console.log("Última pregunta respondida encontrada en índice:", lastIndex);

  let lastIndexNumber = parseInt(lastIndex, 10);
  console.log(typeof lastIndexNumber, "Tipo de lastIndex:", lastIndexNumber);

  const lastIndexNum = lastIndexNumber - 1;
  console.log(typeof lastIndexNum, "Tipo de lastIndex:", lastIndexNum);

  // Si encuentra la pregunta, avanzamos al paso siguiente (+1) para que continúe donde se quedó,
  // o si prefieres justo en la última respondida, déjalo en 'lastIndex'.
  // Por lo general, lo ideal es ir a la siguiente pregunta sin responder:
  if (lastIndex !== -1 && lastIndex < questions.length - 1) {
    lastIndexNum = lastIndexNum - 1;
    console.log("Ultimo ID:", lastIndex, ", Última pregunta respondidaaa:", questions[lastIndex]);7
    return lastIndexNum;
  }

  console.log("No se encontró");
  
  return lastIndexNum !== -1 ? lastIndexNum : 0;
});



useEffect(() => {
  const savedAnswers = localStorage.getItem(STORAGE_KEY);
  console.log("Verificando borrador local al cargar la app:", savedAnswers);
  
  if (savedAnswers) {
    try {
      const parsed = JSON.parse(savedAnswers);
      
      // Verificamos si existe 'answers' y si tiene contenido real dentro
      const answersData = parsed.answers ? parsed.answers : parsed;
      
      if (answersData && Object.keys(answersData).length > 0) {
        setShowResumeBanner(true);
        
        const timer = setTimeout(() => {
          setShowResumeBanner(false);
        }, 4000);
        
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.error("Error al parsear el borrador:", e);
    }
  }
  }, []);


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
      
      let updatedFilesForQuestion = [];

      setUploadedFiles((prevFiles) => {
        // Obtenemos los archivos que ya existían para esta pregunta (si no hay, empezamos con un array vacío)
        const existingFiles = prevFiles[questionId] || [];
        updatedFilesForQuestion = [...existingFiles, ...processedFiles];
        
        return {
          ...prevFiles,
          // Sumamos los archivos anteriores con los recién procesados
          [questionId]: [...existingFiles, ...processedFiles]
        };
      });

      // 3. ¡Nuevo! Guardamos de forma persistente en IndexedDB para que sobreviva al cierre de la PWA o app
      try {
        // Nota: Asegúrate de tener 'auditId' disponible en este scope (el ID que definimos antes)
        console.log(`Guardando archivos en Dexie para auditoría ${STORAGE_KEY}, pregunta ${questionId}:`, updatedFilesForQuestion);
        await saveImagesToDB(STORAGE_KEY, questionId, processedFiles);
        
        console.log(`Archivos guardados en Dexie para auditoría ${STORAGE_KEY}, pregunta ${questionId}`);
      } catch (error) {
        console.error("Error al guardar archivos en Dexie:", error);
      }
    }
  };


  useEffect(() => {
  const loadStoredFiles = async () => {
    try {
      console.log("Buscando imágenes en IndexedDB para el STORAGE_KEY:", STORAGE_KEY);

      // Consultamos directamente en tu tabla de Dexie filtrando por el auditId que equivale a tu STORAGE_KEY
      const storedImages = await db.images
        .where('auditId')
        .equals(STORAGE_KEY)
        .toArray();

      console.log("Imágenes encontradas en IndexedDB:", storedImages);

      if (storedImages && storedImages.length > 0) {
        const restoredFiles = {};

        // Agrupamos las imágenes por su questionId para reconstruir tu objeto 'uploadedFiles'
        storedImages.forEach((imgRecord) => {
          // Ajusta 'questionId' y 'fileData' según los nombres de las propiedades en tu base de datos
          const { questionId, file } = imgRecord; 
          
          if (!restoredFiles[questionId]) {
            restoredFiles[questionId] = [];
          }
          
          restoredFiles[questionId].push(file);
        });

        // Actualizamos el estado con las fotos agrupadas por pregunta
        setUploadedFiles(restoredFiles);
        console.log("Archivos restaurados con éxito:", restoredFiles);
      }
    } catch (error) {
      console.error("Error al cargar las imágenes desde IndexedDB:", error);
    }
  };

  if (STORAGE_KEY) {
    loadStoredFiles();
  }
}, [questions]);

  // const [answers, setAnswers] = useState({}); // <--- ESTA ES LA QUE TE FALTA

  const [answers, setAnswers] = useState(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    console.log("=== DEBUG LOCALSTORAGE ===");
    console.log("Raw string guardado:", saved);
    
    if (!saved) return {};

    const parsed = JSON.parse(saved);
    console.log("Objeto parseado completo:", parsed);
    
    // Extraemos estrictamente solo las respuestas para depurar
    const respuestasGuardadas = parsed.answers ? parsed.answers : parsed;
    console.log("Respuestas extraídas para el estado:", respuestasGuardadas);
    
    return respuestasGuardadas;
  } catch (error) {
    console.error("Error al cargar el borrador local:", error);
    return {};
  }
});

  // 2. Sincronizamos automáticamente cada cambio de 'answers' con localStorage
  useEffect(() => {
    const draftData = {
      updatedAt: new Date().toISOString(),
      categoriaDraft: categoria,
      answers: answers, 
      toti: "ia"
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
    } catch (error) {
      console.error("Error al guardar el borrador local:", error);
    }
  }, [answers]);


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
        console.log("Tipo de fileData:", typeof fileData);
        console.table(fileData);
      }
    }, [uploadedFiles]);


  // 2. EFECTO CLAVE: Cada vez que cambie 'currentStep', buscamos si ya había una respuesta guardada
  useEffect(() => {
    const currentQuestionId = questions[currentStep]?.id;
    const existingAnswer = answers[currentQuestionId];

    if (existingAnswer) {
      // Si ya habías respondido esta pregunta, la cargamos en la vista
      // (Soportando tanto si guardas solo la opción como si guardas un objeto con respuesta/comentario)
      setSelectedOption(typeof existingAnswer === 'object' ? existingAnswer.respuesta : existingAnswer);
      setCommentText(typeof existingAnswer === 'object' ? existingAnswer.comentario || '' : '');
    } else {
      // Si es una pregunta nueva que no se ha respondido, limpiamos la vista
      setSelectedOption(null);
      setCommentText('');
    }
  }, [currentStep, answers]); // Se ejecuta si cambias de paso o si se actualizan las respuestas

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

      {showResumeBanner && (
  <div className="max-w-md alert alert-info shadow-lg mb-4 flex justify-between items-center animate-fade-in">
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current flex-shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span>¡Hola! Hemos recuperado tu progreso anterior. Continuamos donde te quedaste.</span>
    </div>
    <button 
      onClick={() => setShowResumeBanner(false)} 
      className="btn btn-sm btn-ghost"
    >
      ✕
    </button>
  </div>
)}
      
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