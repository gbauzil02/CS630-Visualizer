import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container, Stage, Text } from "@pixi/react";
import { Circle } from "@/components/Circle";
import { TextStyle } from "pixi.js";

function App() {
  return (
    <main className="mx-auto max-w-7xl space-y-4">
      <h1 className="text-2xl font-bold uppercase text-center">
        7 State Process Model Simulation
      </h1>
      <div className="flex gap-4">
        <div className="w-full flex flex-col gap-4">
          <Stage>
            <Container>
              <Text
                text="Hello World!"
                x={150}
                y={150}
                style={
                  new TextStyle({
                    fill: "white",
                    fontSize: 36,
                    fontFamily: "Arial",
                  })
                }
              />
              <Circle />
            </Container>
          </Stage>
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
      </div>
    </main>
  );
}

export default App;
