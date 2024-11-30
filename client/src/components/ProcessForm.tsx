import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type ProcessFormProps = {
  addProcess: (size: number, io: number) => void;
  maxMemorySize: number;
};

export default function ProcessForm({
  addProcess,
  maxMemorySize,
}: ProcessFormProps) {
  const formSchema = z.object({
    size: z.coerce.number().positive().int().max(maxMemorySize),
    io: z.coerce.number().int().max(3),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      size: 1,
      io: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    addProcess(values.size, values.io);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="size"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="process-size">Size:</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="process-size"
                  type="number"
                  placeholder="12"
                  min={1}
                  max={maxMemorySize}
                />
              </FormControl>
              <FormDescription>The size of the process in KB.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="io"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="process-events">Number of Events:</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="process-events"
                  type="number"
                  placeholder="2"
                  min={0}
                  max={3}
                />
              </FormControl>
              <FormDescription>
                The number of I/O events the process will perform.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create Process</Button>
      </form>
    </Form>
  );
}
