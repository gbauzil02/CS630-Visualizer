import { motion } from "motion/react";
import type { Process } from "@/components/SettingsPanel";

type StateProps = {
  name: string;
  className?: string;
  processes: Process[];
};

export default function State({ name, className, processes }: StateProps) {
  return (
    <div className={className}>
      <h2 className="font-bold">{name}</h2>
      <motion.ul className="h-16 border border-black bg-muted px-1 flex gap-1 overflow-x-auto">
        {processes
          .filter((process) => {
            if (name === "BLOCKED_1") {
              return process.state === "BLOCKED" && process.q1 === 1;
            }
            if (name === "BLOCKED_2") {
              return process.state === "BLOCKED" && process.q2 === 1;
            }
            if (name === "BLOCKED_3") {
              return process.state === "BLOCKED" && process.q3 === 1;
            }
            return process.state === name;
          })
          .map((process) => (
            <motion.li
              key={`${name}-${process.pid}`}
              className="p-2 self-center font-bold bg-green-500 text-white rounded-full shadow flex items-center justify-center w-10 h-10"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {process.pid}
            </motion.li>
          ))}
      </motion.ul>
    </div>
  );
}
