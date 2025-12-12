import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function FormInputField({ name, label, type = "text", defaultValue }: { name: string; label: string; type?: string; defaultValue?: any }) {
  return (
    <FormField name={name} render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input type={type} defaultValue={defaultValue} {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  );
}

