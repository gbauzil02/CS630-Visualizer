import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProcessCard from "@/components/ProcessCard";
import { useProcessContext } from "@/contexts/ProcessContext";

export default function TaskManager() {
  const { processes } = useProcessContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Manager</CardTitle>
      </CardHeader>
      <CardContent className="max-h-[969px] overflow-y-auto">
        <div className="flex gap-2 flex-col">
          {processes.map((process) => (
            <ProcessCard key={process.pid} process={process} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
