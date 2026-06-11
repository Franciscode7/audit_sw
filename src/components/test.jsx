import React, { useEffect } from 'react';
import { useAuditoria } from './context'; // Asegúrate de que la ruta sea correcta

const test = () => {
  // 1. Extraemos los archivos del contexto global
  const { globalFiles } = useAuditoria();
  console.log("🔍 Contenido inicial de globalFiles en Test.jsx:", globalFiles);
  const fileIds = Object.keys(globalFiles);

  // 2. Ver en consola apenas entremos a la página de Gráficos
  useEffect(() => { 
    console.log("=== 📦 REVISANDO CONTEXTO EN PÁGINA TEST ===");
    
    // Convertimos las llaves del objeto en un arreglo para poder recorrerlo
    const fileIds = Object.keys(globalFiles);

    if (fileIds.length === 0) {
      console.warn("⚠️ El contexto está vacío. ¿Subiste archivos en el formulario antes de venir aquí?");
    } else {
      console.log(`✅ Se encontraron ${fileIds.length} archivos transferidos.`);
      
      // Recorremos el objeto usando un forEach para inspeccionar archivo por archivo
      fileIds.forEach((id) => {
        const archivo = globalFiles[id];
        console.log(`🔹 Pregunta ID: [${id}] -> Archivo: ${archivo.name} (${(archivo.size / 1024).toFixed(2)} KB)`);
      });
    }
  }, [globalFiles]);

//   return (
//     <div className="p-8 flex flex-col gap-4">
//       <h1 className="text-2xl font-bold">Página de Test</h1>
//       <p className="text-gray-600">Revisa la consola del navegador (F12) para ver los archivos recibidos.</p>

//       {/* 3. Botón manual para volver a inspeccionar cuando gustes */}
//       <button 
//         className="btn btn-primary w-fit"
//         onClick={() => {
//           console.log("🔍 Contenido crudo de globalFiles:", globalFiles);
//           console.table(Object.keys(globalFiles).map(id => ({ 
//             PreguntaID: id, 
//             Nombre: globalFiles[id].name,
//             Tipo: globalFiles[id].type 
//           })));
//         }}
//       >
//         Inspeccionar archivos en consola
//       </button>
//     </div>
//   );
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-slate-800">
        📸 Imágenes Adjuntas a la Auditoría
      </h2>

      {fileIds.length === 0 ? (
        <div className="alert alert-warning shadow-lg">
          <div>
            <span>⚠️ No se han subido imágenes para ninguna pregunta todavía.</span>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="table w-full">
            {/* Cabecera de la tabla */}
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="w-1/4">ID Pregunta</th>
                <th className="w-1/4">Vista Previa</th>
                <th className="w-2/4">Detalles del Archivo</th>
              </tr>
            </thead>
            
            {/* Cuerpo de la tabla */}
            <tbody>
              {fileIds.map((id) => {
                const file = globalFiles[id];
                // Creamos la URL temporal para la etiqueta <img>
                const imagenUrl = URL.createObjectURL(file);

                return (
                  <tr key={id} className="hover:bg-slate-50 transition-colors">
                    {/* ID de la Pregunta */}
                    <td className="font-semibold text-primary">
                      {id}
                    </td>

                    {/* Miniatura de la Imagen */}
                    <td>
                      <div className="avatar">
                        <div className="w-16 h-16 rounded-lg mask mask-squircle bg-base-300">
                          <img 
                            src={imagenUrl} 
                            alt={`Evidencia ${id}`} 
                            // Revocamos la URL de memoria cuando la imagen se desmonte para evitar fugas de memoria
                            onLoad={() => URL.revokeObjectURL(imagenUrl)}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Información del Archivo */}
                    <td>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700 max-w-xs truncate" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          Tamaño: {(file.size / 1024).toFixed(1)} KB | Tipo: {file.type.split('/')[1].toUpperCase()}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default test;