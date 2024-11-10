import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProcessCard from "@/components/ProcessCard";
import { useProcessContext } from "@/contexts/ProcessContext";

export default function TaskManager() {
  const { processes } = useProcessContext();

  return (
    <Card className="grow-1">
      <CardHeader>
        <CardTitle>Task Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-col overflow-y-auto">
          {processes.map((process) => (
            <ProcessCard key={process.pid} process={process} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
