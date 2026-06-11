import { createContext, useState, useContext } from 'react';

const AuditoriaContext = createContext();

export const AuditoriaProvider = ({ children }) => {
  // Aquí se guardan los archivos binarios puros de todas las preguntas
  const [globalFiles, setGlobalFiles] = useState({});

  return (
    <AuditoriaContext.Provider value={{ globalFiles, setGlobalFiles }}>
      {children}
    </AuditoriaContext.Provider>
  );
};

export const useAuditoria = () => useContext(AuditoriaContext);