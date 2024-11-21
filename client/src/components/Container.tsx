import { useEffect } from "react";
import { motion } from "motion/react";
import State from "@/components/State";
import { socket } from "@/services/socket";
import { useProcessContext } from "@/contexts/ProcessContext";

export default function Container() {
  const { processes, setProcesses } = useProcessContext();

  const STATES = [
    "NEW",
    "READY_SUS",
    "READY",
    "RUNNING",
    "EXIT",
    "BLOCK_SUS",
    "BLOCKED",
  ];

  useEffect(() => {
    socket.on("processes", (data) => {
      console.log(data);
      setProcesses(data);
    });

    return () => {
      socket.off("processes");
    };
  }, [processes, setProcesses]);

  return (
    <motion.div layout className="grid grid-cols-4 gap-x-4 gap-y-16">
      {STATES.map((state) => (
        <State
          key={state}
          name={state}
          processes={processes}
          className="first:col-span-full first:justify-self-start first:w-1/4 shadow-md"
        />
      ))}
    </motion.div>
  );
}
