import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Process } from "@/components/SettingsPanel";

export default function ProcessCard({ process }: { process: Process }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{process.pid}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul>
          <li>State: {process.state}</li>
          <li>IO Status: {process.IOStatus}</li>
        </ul>
      </CardContent>
    </Card>
  );
}
