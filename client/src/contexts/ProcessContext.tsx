import React, { useState, createContext } from "react";
import type { Process } from "@/components/SettingsPanel";

type ProcessContextType = {
  processes: Process[];
  setProcesses: React.Dispatch<React.SetStateAction<Process[]>>;
};

export const ProcessContext = createContext<ProcessContextType | null>(null);

export function ProcessContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [processes, setProcesses] = useState<Process[]>([]);

  return (
    <ProcessContext.Provider value={{ processes, setProcesses }}>
      {children}
    </ProcessContext.Provider>
  );
}

export function useProcessContext() {
  const context = React.useContext(ProcessContext);
  if (!context) {
    throw new Error(
      "useProcessContext must be used within a ProcessContextProvider"
    );
  }
  return context;
}
