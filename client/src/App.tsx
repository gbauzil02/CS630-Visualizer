import { Button } from "@/components/ui/button";
import { Container, Stage, Text } from "@pixi/react";
import { Circle } from "@/components/Circle";
import { TextStyle } from "pixi.js";
import SettingsPanel from "@/components/SettingsPanel";
import TaskManager from "@/components/TaskManager";
import { Toaster } from "@/components/ui/toaster";
import { ProcessContextProvider } from "@/contexts/ProcessContext";

function App() {
  return (
    <>
      <main className="mx-auto max-w-7xl space-y-4">
        <h1 className="text-2xl font-bold uppercase text-center">
          7 State Process Model Simulation
        </h1>
        <ProcessContextProvider>
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
              <SettingsPanel />
            </div>
            <TaskManager />
          </div>
        </ProcessContextProvider>
      </main>
      <Toaster />
    </>
  );
}

export default App;
