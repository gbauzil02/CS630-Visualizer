import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProcessCard from "@/components/ProcessCard";

export default function TaskManager() {
  return (
    <Card className="grow-1">
      <CardHeader>
        <CardTitle>Task Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <ProcessCard
          process={{
            pid: "1",
            hasIO: true,
            IOStatus: "Waiting",
            size: 10,
            state: "Ready",
          }}
        />
      </CardContent>
    </Card>
  );
}
