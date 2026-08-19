// src/db/db.js
import Dexie from 'dexie';

export const db = new Dexie('AuditoriaImagesDB');

db.version(1).stores({
  // '++id' es un ID autoincrementable único
  // 'auditId' y 'questionId' son índices para poder buscar y filtrar rápido
  images: '++id, auditId, questionId'
});

// 1. Guardar imágenes asociadas a una auditoría y a una pregunta específica
export const saveImagesToDB = async (auditId, questionId, filesArray) => {
  try {
    // Preparamos los registros para Dexie
    const records = filesArray.map(file => ({
      auditId: auditId,
      questionId: questionId,
      file: file // El objeto File / Blob binario
    }));

    // Añadimos los registros a la tabla 'images'
    await db.images.bulkAdd(records);
    console.log(`Imágenes guardadas correctamente para la auditoría ${auditId}, pregunta ${questionId}`);
  } catch (error) {
    console.error("Error al guardar en Dexie:", error);
  }
};