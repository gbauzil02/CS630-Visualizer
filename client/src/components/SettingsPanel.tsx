import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import ProcessForm from "@/components/ProcessForm";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useProcessContext } from "@/contexts/ProcessContext";

export type Process = {
  pid: string;
  state: string;
  ioStatus: string;
  size: number;
  io: number;
  q1: number;
  q2: number;
  q3: number;
};

const formSchema = z.object({
  memorySize: z.coerce.number().positive().int().min(0),
  timeSlice: z.coerce.number().positive().int().min(1).max(20),
});

export default function SettingsPanel() {
  const { processes, setProcesses } = useProcessContext();

  function addProcess(size: number, io: number) {
    const process: Process = {
      pid: String(processes.length + 1),
      size,
      state: "NEW",
      ioStatus: "None",
      io,
      q1: 0,
      q2: 0,
      q3: 0,
    };

    setProcesses([...processes, process]);
  }

  async function loadSimulation(payload: {
    processes: Process[];
    timeSlice: number;
    memorySize: number;
  }) {
    await fetch("http://localhost:5001/load", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      memorySize: 64,
      timeSlice: 5,
    },
  });

  const { toast } = useToast();

  const handleSubmit = form.handleSubmit(
    (values: z.infer<typeof formSchema>) => {
      if (processes.length === 0) {
        toast({
          title: "Error",
          description: "You must add at least one process!",
          variant: "destructive",
        });
        return;
      }
      loadSimulation({ processes, ...values });
      toast({
        title: "Success",
        description: "Simulation loaded successfully!",
      });
    }
  );

  function reset() {
    form.reset();
    setProcesses([]);
    toast({
      title: "Success",
      description: "Simulation values reset successfully!",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="uppercase">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <section className="space-y-2">
          <h2 className="font-semibold text-xl uppercase">Process Settings</h2>
          <div className="flex gap-2">
            <Button onClick={() => addProcess(12, 0)}>Add Basic Process</Button>
            <Button onClick={() => addProcess(12, 2)}>
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
                <ProcessForm addProcess={addProcess} />
              </PopoverContent>
            </Popover>
          </div>
        </section>
        <Separator />
        <section>
          <h2 className="font-semibold text-xl uppercase">
            Simulation Settings
          </h2>
          <Form {...form}>
            <form className="grid grid-cols-2 gap-2">
              <FormField
                control={form.control}
                name="memorySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="memory-size">Memory Size:</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="memory-size"
                        type="number"
                        placeholder="64"
                        min={0}
                        step={8}
                      />
                    </FormControl>
                    <FormDescription>
                      The size of the memory in KB.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeSlice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="time-slice">Time Slice:</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="time-slice"
                        type="number"
                        placeholder="5"
                      />
                    </FormControl>
                    <FormDescription>
                      The time slice in seconds.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </section>
      </CardContent>
      <CardFooter className="flex gap-2 justify-end">
        <Button onClick={handleSubmit}>Load Simulation</Button>
        <Button onClick={reset} variant="destructive">
          Reset
        </Button>
      </CardFooter>
    </Card>
  );
}
