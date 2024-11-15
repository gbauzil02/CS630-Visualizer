import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

const formSchema = z.object({
  size: z.coerce.number().positive().int(),
  hasIO: z.boolean(),
  events: z.coerce.number().positive().int().max(3).optional(),
});

type ProcessFormProps = {
  addProcess: (size: number, hasIO: boolean, events?: number) => void;
};

export default function ProcessForm({ addProcess }: ProcessFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      size: 1,
      hasIO: false,
      events: 1,
    },
  });

  const isHasIOChecked = form.watch("hasIO");

  function onSubmit(values: z.infer<typeof formSchema>) {
    addProcess(values.size, values.hasIO, values.events);
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
                />
              </FormControl>
              <FormDescription>The size of the process in KB.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="hasIO"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  id="process-io"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor="process-io">Has I/O:</FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="events"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="process-events">Number of Events:</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  id="process-events"
                  type="number"
                  disabled={!isHasIOChecked}
                  placeholder="2"
                  min={1}
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
