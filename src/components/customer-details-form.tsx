
'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { DialogFooter } from "./ui/dialog";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().regex(/^\+?[1-9][0-9]{7,14}$/, { message: "Please enter a valid phone number (e.g., +919876543210)." }),
  address: z.string().min(10, { message: "Address must be at least 10 characters." }),
});

export type CustomerDetails = z.infer<typeof formSchema>;

interface CustomerDetailsFormProps {
    setCustomerDetails: (details: CustomerDetails) => void;
    setIsOpen: (isOpen: boolean) => void;
}

export function CustomerDetailsForm({ setCustomerDetails, setIsOpen }: CustomerDetailsFormProps) {
  const { toast } = useToast();

  const form = useForm<CustomerDetails>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
    },
  });

  function onSubmit(values: CustomerDetails) {
    localStorage.setItem('customerDetails', JSON.stringify(values));
    setCustomerDetails(values);
    toast({
        title: "Details Saved!",
        description: "You can now proceed with your shopping.",
    });
    setIsOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., Ramesh Kumar" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
                <FormItem>
                <FormLabel>WhatsApp Number</FormLabel>
                <FormControl>
                    <Input placeholder="e.g., +919876543210" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Full Address</FormLabel>
                <FormControl>
                    <Textarea placeholder="e.g., House No, Street, City, State, Pincode" className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        <DialogFooter>
            <Button type="submit" className="w-full">
                Save and Continue
            </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
