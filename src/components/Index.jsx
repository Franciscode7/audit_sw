import { useNavigate } from "react-router-dom";
import { Q1, Q2, Q3 } from "../data/restaurante_q/questions";
import { useState, useEffect } from "react";
import {DeleteDraft, GoForm} from "../utils/functions";


// Función para obtener todas las auditorías guardadas en el navegador
const getSavedAudits = () => {
  const savedAuditsList = [];
  
  // Recorremos todo el localStorage buscando las llaves que empiezan con nuestro prefijo de borrador
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const rawData = localStorage.getItem(key);
    const parsedData = JSON.parse(rawData);
    console.log("id Borrador encontrado:", key);
    if (key) {
      console.log("Auditoría guardada encontrada:", key);
      const auditId = key.replace("audit_answers_", "");
      const InterncategoriaDraft = parsedData.categoriaDraft || "general"; // Fallback por si acaso
      const fecha = parsedData.updatedAt ? new Date(parsedData.updatedAt).toLocaleString() : "";

      // Extraemos la información o el nombre base del ID
      savedAuditsList.push({
        id: auditId,
        label: `${auditId}, ${fecha}`,
        categoria: InterncategoriaDraft, // Aquí puedes extraer la categoría si la guardaste en el borrador
      });

    }else {
      console.log("No es una auditoría guardada:", key);
    }
  }
  return savedAuditsList;
};

const DataDraft = getSavedAudits();
const CategoriaDraft = "";

function Index() {
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState("");
  const [auditName, setAuditName] = useState('');
  const [selectedAuditId, setSelectedAuditId] = useState("");
  const [savedAudits, setSavedAudits] = useState([]);

  useEffect(() => {
    setSavedAudits(getSavedAudits());
  }, []);


const handleEmpezar = () => {
  if (categoria && auditName.trim()) {
    // Mandamos tanto la categoría como el nombre por parámetros en la URL
    navigate(`formulario?categoria=${encodeURIComponent(categoria)}&nombre=${encodeURIComponent(auditName.trim())}`);
  }
  else {
    alert("Por favor, ingresa un nombre y/o un tipo de auditoría antes de continuar.");
  }
};


return (
  <div className="flex justify-center items-center min-h-[60vh] px-4">
    <div className="card w-full max-w-md bg-white shadow-xl border border-base-200">
      <div className="card-body gap-4">
        
        {/* Encabezado */}
        <div className="text-center">
          <h2 className="card-title text-2xl font-bold justify-center text-blue-500 gap-2">
            Comenzar Auditoría
          </h2>
         
        </div>

        {/* Input para pedir el nombre de la auditoría */}
        <input 
          type="text" 
          placeholder="Escribe el nombre de la auditoría..." 
          value={auditName}
          onChange={(e) => setAuditName(e.target.value)}
          className="input input-bordered w-full text-sm my-0"
          required
        />

        <hr className="border-base-300" />

        <p className="text-sm text-base-content/70 mt-1">
          Selecciona un tipo de auditoría para empezar.
        </p>
        {/* Contenedor del Selector (Campos sueltos, sin <form>) */}
        <div className="space-y-6">
          <div className="form-control w-full">
            <label className="label font-medium text-sm">
              <span className="label-text text-black/80">Tipo de auditoria</span>
            </label>
            
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={`select select-bordered select-primary text-sm w-full text-center ${
                categoria === "" ? "text-gray-500 italic text-sm" : "text-blue-500 text-lg"
              }`}
            >
              <option value="" disabled>
                -- Selecciona una categoría --
              </option>
              <option value="AuditV1">Auditoría V1</option>
              <option value="AuditV2">Auditoría V2</option>
              <option value="AuditV3">Auditoría V3</option>
            </select>
          </div>

          {/* Botón de acción por Click */}
          <div className="card-actions justify-end mt-2">
            <button
              type="button"
              onClick={handleEmpezar}
              disabled={!categoria || !auditName.trim()}
              className="btn btn-primary btn-block text-white disabled:bg-base-300"
            >
              🚀 Empezar Auditoría
            </button>
          </div>
        </div>

      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">O retomar una auditoría guardada:</label>
        <select 
          value={selectedAuditId} 
          onChange={(e) => setSelectedAuditId(e.target.value)} 
          className="select select-bordered w-full"   
        >
          {console.log("Auditorías guardadas:", savedAudits)}
          <option value="">-- Selecciona una auditoría existente --</option>
          {savedAudits.map((audit) => (
            <option key={audit.id} value={audit.id} className="py-2 text-center text-gray-800 font-bold bg-white hover:bg-blue-50">
              {audit.label}
            </option>
          ))}
        </select>
      </div>

      {/* Los botones aparecen solo si hay una auditoría seleccionada */}
  {selectedAuditId && (
    <div className="flex gap-3 animate-fade-in">
      {/* Botón de Continuar (Pendiente de definir su acción final) */}
      <button 
      type="button"
      onClick={() => {
        // 1. Buscamos el objeto completo del borrador dentro de tu arreglo cargado
        const borradorSeleccionado = savedAudits.find(audit => audit.id === selectedAuditId);
        
        // 2. Extraemos su categoría guardada (asegúrate de que getSavedAudits guarde 'categoria' o 'categoriaDraft')
        const categoriaActual = borradorSeleccionado ? borradorSeleccionado.categoria : "";

        // 3. Mostramos los datos en consola
        GoForm(navigate, categoriaActual, selectedAuditId);
      }}
      className="btn btn-primary flex-1"
    >
        Continuar
      </button>

      {/* Botón de Borrar */}
     <button 
        type="button"
        onClick={() => DeleteDraft(selectedAuditId, setSavedAudits, setSelectedAuditId)}
        className="btn btn-error btn-outline flex-1"
      >
        Borrar borrador
      </button>
    </div>
  )}

    </div>
  </div>
);


}

export default Index;