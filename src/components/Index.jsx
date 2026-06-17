import { useNavigate } from "react-router-dom";
import { Q1, Q2, Q3 } from "../data/restaurante_q/questions";
import { useState } from "react";
// import { questions as Q3 } from "../data/audit-v3/questions";
// import { questions as Q4 } from "../data/audit-v4/questions";

function Index() {
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState("");

const handleEmpezar = () => {
  if (categoria) {
    navigate(`formulario?categoria=${categoria}`);
  }
};

return (
  <div className="flex justify-center items-center min-h-[60vh] px-4">
    <div className="card w-full max-w-md bg-white shadow-xl border border-base-200">
      <div className="card-body gap-4">
        
        {/* Encabezado */}
        <div className="text-center">
          <h2 className="card-title text-2xl font-bold justify-center text-blue-500 gap-2">
            Auditoría
          </h2>
          <p className="text-sm text-base-content/70 mt-1">
            Selecciona una categoría para empezar.
          </p>
        </div>

        <hr className="border-base-300" />

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
              disabled={!categoria}
              className="btn btn-primary btn-block text-white disabled:bg-base-300"
            >
              🚀 Empezar Auditoría
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
);


}

export default Index;