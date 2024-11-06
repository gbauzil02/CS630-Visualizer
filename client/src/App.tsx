import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function App() {
  return (
    <main className="mx-auto max-w-7xl flex gap-4">
      <div className="w-full flex flex-col gap-4">
        <div className=" h-72"></div>
        <Button className=" self-end">Run</Button>
        <Card>
          <CardContent>
            <Button>Add Process</Button>
          </CardContent>
        </Card>
      </div>
      <Card className="grow-1">
        <CardHeader>
          <CardTitle>Task Manager</CardTitle>
        </CardHeader>
        <CardContent>hi</CardContent>
      </Card>
    </main>
  );
}

export default App;
