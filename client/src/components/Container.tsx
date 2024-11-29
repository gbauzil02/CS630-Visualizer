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
    "BLOCKED_1",
    "BLOCKED_2",
    "BLOCKED_3",
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
    <motion.div layout className="grid grid-cols-4 gap-x-4 gap-y-8">
      {STATES.map((state) => (
        <State
          key={state}
          name={state}
          processes={processes}
          className="first:col-span-full first:justify-self-start first:w-1/4 [&:nth-last-child(-n+3)]:col-start-2 shadow-md"
        />
      ))}
    </motion.div>
  );
}
