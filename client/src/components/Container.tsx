import { useEffect } from "react";
import { motion } from "motion/react";
import State from "@/components/State";
import { socket } from "@/services/socket";
import { useProcessContext } from "@/contexts/ProcessContext";

export default function Container() {
  const { processes, setProcesses } = useProcessContext();

  const STATES = [
    "NEW",
    "READY",
    "RUNNING",
    "EXIT",
    "BLOCKED",
    "BLOCK_SUS",
    "READY_SUS",
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
    <motion.div
      layout
      className="grid grid-cols-4 gap-x-4 gap-y-16 first:col-span-full first:justify-self-start"
    >
      {STATES.map((state) => (
        <State key={state} name={state} processes={processes} />
      ))}
    </motion.div>
  );
}
