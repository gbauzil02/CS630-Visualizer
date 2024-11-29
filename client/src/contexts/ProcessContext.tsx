import React, { useState, createContext } from "react";
import { UpdatedProcess } from "@/components/State";

type ProcessContextType = {
  processes: UpdatedProcess[];
  setProcesses: React.Dispatch<React.SetStateAction<UpdatedProcess[]>>;
};

export const ProcessContext = createContext<ProcessContextType | null>(null);

export function ProcessContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [processes, setProcesses] = useState<UpdatedProcess[]>([]);

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
