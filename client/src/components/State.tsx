import { motion } from "motion/react";
import type { Process } from "./SettingsPanel";

type StateProps = {
  name: string;
  className?: string;
  processes: Process[];
};

export default function State({ name, className, processes }: StateProps) {
  return (
    <div className={className}>
      <h2>{name}</h2>
      <motion.ul className="rounded-lg h-16 border border-black bg-muted px-1 flex gap-1 overflow-x-auto">
        {processes
          .filter((process) => process.state === name)
          .map((process) => (
            <motion.li
              key={process.pid}
              layoutId={`process-${process.pid}`}
              className="p-2 self-center font-bold bg-green-500 text-white rounded-full shadow"
            >
              {process.pid}
            </motion.li>
          ))}
      </motion.ul>
    </div>
  );
}
