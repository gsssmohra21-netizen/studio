
"use client";

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
import type { Product } from "@/lib/products";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { addDocumentNonBlocking, useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import type { PaymentSetting } from "@/lib/settings";
import { Skeleton } from "./ui/skeleton";
import { useEffect, useState } from "react";
import { CustomerDetails } from "./customer-details-form";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Terminal } from "lucide-react";


const formSchema = z.object({
  paymentMethod: z.enum(["cash", "online"], {
    required_error: "You need to select a payment method.",
  }),
});

interface OrderFormProps {
    product: Product;
    selectedSize: string;
    setDialogOpen: (open: boolean) => void;
}

export function OrderForm({ product, selectedSize, setDialogOpen }: OrderFormProps) {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const paymentSettingsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'settings', 'paymentOptions');
  }, [firestore]);

  const { data: paymentSettings, isLoading: isLoadingPaymentSettings } = useDoc<PaymentSetting>(paymentSettingsRef);

  useEffect(() => {
    try {
        const savedDetails = localStorage.getItem('customerDetails');
        if (savedDetails) {
            setCustomerDetails(JSON.parse(savedDetails));
        }
    } catch (error) {
        console.error("Could not parse customer details from localStorage for order form", error);
    }
  }, []);

  const isGlobalCodEnabled = paymentSettings?.isCashOnDeliveryEnabled ?? true;
  const isProductCodAvailable = product.isCashOnDeliveryAvailable ?? true;
  const isFinalCodEnabled = isGlobalCodEnabled && isProductCodAvailable;


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethod: isFinalCodEnabled ? undefined : "online",
    },
  });

  useEffect(() => {
    if (!isFinalCodEnabled && form.getValues('paymentMethod') !== 'online') {
        form.setValue('paymentMethod', 'online');
    }
  }, [isFinalCodEnabled, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!customerDetails) {
        toast({
            variant: 'destructive',
            title: 'Customer details are missing!',
            description: 'Please refresh and enter your details to proceed.',
        });
        return;
    }

    if (firestore) {
        try {
            const ordersCollectionRef = collection(firestore, 'orders');
            const newDocRef = doc(ordersCollectionRef);
            const newOrder = {
                id: newDocRef.id,
                productId: product.id,
                customerName: customerDetails.name,
                customerContact: customerDetails.phone,
                customerAddress: customerDetails.address,
                orderDate: new Date().toISOString(),
                isCompleted: false,
                completedDate: "",
                productDetails: {
                    name: product.name,
                    price: product.salePrice,
                    size: selectedSize
                }
            };
            await addDocumentNonBlocking(newDocRef, newOrder);
        } catch (error) {
            console.error("Error saving order to Firestore:", error);
            toast({
                variant: 'destructive',
                title: 'Order could not be saved automatically',
                description: 'Please ensure you send the WhatsApp message.'
            });
        }
    }

    const message = `
New Order from Darpan Wears!
-------------------------
Product ID: ${product.id}
Product: ${product.name}
Size: ${selectedSize}
Price: ₹${product.salePrice}
Payment Method: ${values.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Online Payment'}
-------------------------
Customer Details:
Name: ${customerDetails.name}
Phone: ${customerDetails.phone}
Address: ${customerDetails.address}
    `;

    const whatsappNumber = "919332307996";
    const encodedMessage = encodeURIComponent(message.trim());
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');

    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.error("Audio play failed", e));

    toast({
        title: "✅ Order Sent!",
        description: "Your order has been sent. We will contact you shortly.",
    });
    
    setDialogOpen(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg border">
                <p><strong>Product:</strong> {product.name}</p>
                <p><strong>Size:</strong> {selectedSize}</p>
                 <div className="flex items-baseline gap-2">
                    <p><strong>Price:</strong></p>
                    <p className="font-bold text-primary">₹{product.salePrice}</p>
                    <p className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</p>
                </div>
            </div>

            {customerDetails && (
                <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Confirm Your Details</AlertTitle>
                    <AlertDescription className="text-xs">
                        <p><strong>Name:</strong> {customerDetails.name}</p>
                        <p><strong>Contact:</strong> {customerDetails.phone}</p>
                        <p><strong>Address:</strong> {customerDetails.address}</p>
                    </AlertDescription>
                </Alert>
            )}

            {isLoadingPaymentSettings ? (
                <Skeleton className="h-20 w-full" />
            ) : (
                 <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                        <FormItem className="space-y-3">
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-1"
                            >
                            {isFinalCodEnabled && (
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                    <RadioGroupItem value="cash" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                    Cash on Delivery
                                </FormLabel>
                                </FormItem>
                            )}
                            <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                <RadioGroupItem value="online" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                Online Payment
                                </FormLabel>
                            </FormItem>
                            </RadioGroup>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
            )}
        </div>
        <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            Send Order on WhatsApp
        </Button>
      </form>
    </Form>
  );
}
