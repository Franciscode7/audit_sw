import html2pdf from "html2pdf.js";

/**
 * Exporta un elemento HTML a PDF con configuraciones de alta calidad.
 * @param {HTMLElement} element - El elemento del DOM que se va a renderizar (reportRef.current).
 * @param {Object} auditData - Los datos de la auditoría que contienen al auditor, etc.
 */
export const downloadPDF = (element, auditData, type, auditorName) => {
    
  if (!element) {
    console.error("No se proporcionó un elemento HTML válido para generar el PDF.");
    return;
  }

  // 1. Clonamos el elemento para no afectar la vista del usuario
  const clonedElement = element.cloneNode(true);
  
clonedElement.style.width = "750px";
clonedElement.style.minWidth = "750px";  // Evita que colapse
clonedElement.style.maxWidth = "750px";  // Evita que se estire
clonedElement.style.margin = "0 auto";    // Centrado absoluto
clonedElement.style.padding = "20px";     // Aire limpio en los bordes del papel
clonedElement.style.boxSizing = "border-box";
clonedElement.style.display = "block";    // Asegura comportamiento de bloque limpio
  
  clonedElement.style.color = 'black';
  clonedElement.style.backgroundColor = 'white';
  
  const allElements = clonedElement.querySelectorAll('*');
  allElements.forEach(el => {
    if (el.classList.contains('badge') || el.classList.contains('btn')) {
      el.style.backgroundColor = '#eeeeee'; 
      el.style.color = '#000000';
      el.style.borderColor = '#cccccc';
    }

    if (el.classList.contains('whitespace-nowrap') && el.tagName === 'SPAN') {
      // Le inyectamos el margen negativo puro directamente al clon
      el.style.marginTop = "-18px"; 
    }

  });

  // 3. Configuración del PDF (Extrayendo dinámicamente el nombre del auditor)
  const opt = {
    margin: 10,
    filename: `Reporte de ${type} elaborado por ${auditorName || 'desconocido'}.pdf`,
    image: { type: 'jpeg', quality: 0.99 },
    html2canvas: { 
      scale: 4, // Bajado a 3 por rendimiento óptimo con múltiples fotos móviles, usa 4 si prefieres.
      useCORS: true,
      logging: false,
      imageTimeout: 0,
      state: 'ready',
      windowWidth: 750
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
  };

  // 4. Ejecutar la conversión y descarga
  html2pdf().set(opt).from(clonedElement).save();
};






// En tu archivo de funciones o helpers (ej. utils.js o db.js)
export const DeleteDraft = (selectedAuditId, setSavedAudits, setSelectedAuditId) => {
  if (window.confirm("¿Estás seguro de eliminar este borrador de forma permanente?")) {
    // 1. Borramos del localStorage
    localStorage.removeItem(selectedAuditId);
    
    // 2. Actualizamos la lista local de borradores para que desaparezca del select
    setSavedAudits(prev => prev.filter(audit => audit.id !== selectedAuditId));
    
    // 3. Limpiamos la selección actual
    setSelectedAuditId("");
    
    console.log("Borrador eliminado con éxito.");
  }
};

export const GoForm = (navigate, categoriaSeleccionada, currentDraftId) => {
  navigate(
    `formulario?categoria=${encodeURIComponent(categoriaSeleccionada)}&draftId=${encodeURIComponent(currentDraftId)}`
  );
};