import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Process } from "@/components/SettingsPanel";

export default function ProcessCard({ process }: { process: Process }) {
  function countEvents() {
    let count = 0;
    if (process.q1 === 1) {
      count++;
    }
    if (process.q2 === 1) {
      count++;
    }
    if (process.q3 === 1) {
      count++;
    }
    return count;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process {process.pid}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          <li>State: {process.state}</li>
          <li>IO Status: {process.ioStatus}</li>
          <li># of Event Queues: {countEvents()}</li>
        </ul>
      </CardContent>
    </Card>
  );
}
