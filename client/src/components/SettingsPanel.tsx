import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "./ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";

export type Process = {
  pid: string;
  state: string;
  IOStatus: string;
  size: number;
  hasIO: boolean;
  numOfEvents?: number;
};

export default function SettingsPanel() {
  const [processes, setProcesses] = useState<Process[]>([]);

  function addProcess(size: number, hasIO: boolean, numOfEvents?: number) {
    const process: Process = {
      pid: Math.random().toString(36).substring(7),
      size,
      hasIO,
      state: "New",
      IOStatus: "None",
    };

    if (hasIO) {
      process.numOfEvents = numOfEvents;
    }

    setProcesses([...processes, process]);
  }

  async function loadSimulation() {
    await fetch("http://localhost:3000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        processes,
        timeSlice: 5,
        memorySize: 64,
      }),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <section className="space-y-2">
          <h2 className="font-semibold text-xl uppercase">Process Settings</h2>
          <div className="flex gap-2">
            <Button onClick={() => addProcess(12, false)}>
              Add Basic Process
            </Button>
            <Button onClick={() => addProcess(12, true, 2)}>
              Add Process with I/O
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button>
                  <span>Create Custom Process</span>
                  <Plus />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <div className="space-y-2">
                  <div>
                    <label htmlFor="process-size">Size:</label>
                    <Input id="process-size" type="number" placeholder="12" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="process-io">Has I/O:</label>
                    <Checkbox id="process-io" />
                  </div>
                  <div>
                    <label htmlFor="process-events">Number of Events:</label>
                    <Input id="process-events" type="number" placeholder="2" />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </section>
        <Separator />
        <section>
          <h2 className="font-semibold text-xl uppercase">
            Simulation Settings
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="time-slice">Time Slice:</label>
              <Input id="time-slice" type="number" placeholder="5" />
            </div>
            <div>
              <label htmlFor="memory-size">Memory Size:</label>
              <Input id="memory-size" type="number" placeholder="64" />
            </div>
          </div>
        </section>
      </CardContent>
      <CardFooter>
        <Button onClick={loadSimulation}>Load Simulation</Button>
      </CardFooter>
    </Card>
  );
}
