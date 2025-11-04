
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, useCollection, useDoc, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Megaphone, Image as ImageIcon, Shield, Bot } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import type { PaymentSetting, SiteSetting, AnnouncementSetting, HeroImage, AIPromptSetting } from '@/lib/settings';
import Image from 'next/image';

const footerSchema = z.object({
  content: z.string().min(1, "Footer content cannot be empty."),
});

const privacyPolicySchema = z.object({
    content: z.string().min(1, "Privacy Policy content cannot be empty."),
});

const announcementSchema = z.object({
  content: z.string().optional(),
});

const paymentSchema = z.object({
  isCashOnDeliveryEnabled: z.boolean(),
});

const heroImageSchema = z.object({
  imageUrl: z.string().url('Please enter a valid image URL.'),
});

const aiPromptSchema = z.object({
    basePrompt: z.string().min(20, 'The AI prompt must be at least 20 characters.'),
});

type FooterFormData = z.infer<typeof footerSchema>;
type PrivacyPolicyFormData = z.infer<typeof privacyPolicySchema>;
type AnnouncementFormData = z.infer<typeof announcementSchema>;
type PaymentFormData = z.infer<typeof paymentSchema>;
type HeroImageFormData = z.infer<typeof heroImageSchema>;
type AIPromptFormData = z.infer<typeof aiPromptSchema>;


function SiteSettingsForms() {
  const { toast } = useToast();
  const firestore = useFirestore();

  // Announcement Form
  const [isSubmittingAnnouncement, setIsSubmittingAnnouncement] = useState(false);
  const announcementDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'announcement') : null, [firestore]);
  const { data: announcementData, isLoading: isLoadingAnnouncement } = useDoc<AnnouncementSetting>(announcementDocRef);
  const announcementForm = useForm<AnnouncementFormData>({ resolver: zodResolver(announcementSchema) });
  useEffect(() => {
    if (announcementData) {
      announcementForm.reset({ content: announcementData.content });
    }
  }, [announcementData, announcementForm]);

  const onAnnouncementSubmit: SubmitHandler<AnnouncementFormData> = async (data) => {
    if (!firestore || !announcementDocRef) return;
    setIsSubmittingAnnouncement(true);
    try {
      await setDoc(announcementDocRef, data, { merge: true });
      toast({ title: 'Announcement Updated!', description: 'Your announcement bar has been saved.' });
    } catch (error) {
      console.error('Error updating announcement:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update announcement.' });
    } finally {
      setIsSubmittingAnnouncement(false);
    }
  };


  // Footer Form
  const [isSubmittingFooter, setIsSubmittingFooter] = useState(false);
  const footerDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'footer') : null, [firestore]);
  const { data: footerData, isLoading: isLoadingFooter } = useDoc<SiteSetting>(footerDocRef);
  const footerForm = useForm<FooterFormData>({ resolver: zodResolver(footerSchema) });
  useEffect(() => {
    if (footerData) {
      footerForm.reset({ content: footerData.content });
    } else {
        footerForm.reset({ content: `© ${new Date().getFullYear()} Darpan Wears. All rights reserved.` })
    }
  }, [footerData, footerForm]);

  const onFooterSubmit: SubmitHandler<FooterFormData> = async (data) => {
    if (!firestore || !footerDocRef) return;
    setIsSubmittingFooter(true);
    try {
      await setDoc(footerDocRef, data, { merge: true });
      toast({ title: 'Footer Updated!', description: 'Your website footer has been saved.' });
    } catch (error) {
      console.error('Error updating footer:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update footer.' });
    } finally {
      setIsSubmittingFooter(false);
    }
  };

  // Privacy Policy Form
  const [isSubmittingPrivacy, setIsSubmittingPrivacy] = useState(false);
  const privacyDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'privacyPolicy') : null, [firestore]);
  const { data: privacyData, isLoading: isLoadingPrivacy } = useDoc<SiteSetting>(privacyDocRef);
  const privacyForm = useForm<PrivacyPolicyFormData>({ resolver: zodResolver(privacyPolicySchema) });
  useEffect(() => {
    if (privacyData) {
        privacyForm.reset({ content: privacyData.content });
    } else {
        privacyForm.reset({ content: `Welcome to Darpan Wears. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.` });
    }
  }, [privacyData, privacyForm]);
  
  const onPrivacySubmit: SubmitHandler<PrivacyPolicyFormData> = async (data) => {
    if (!firestore || !privacyDocRef) return;
    setIsSubmittingPrivacy(true);
    try {
      await setDoc(privacyDocRef, data, { merge: true });
      toast({ title: 'Privacy Policy Updated!', description: 'Your privacy policy has been saved.' });
    } catch (error) {
      console.error('Error updating privacy policy:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update privacy policy.' });
    } finally {
      setIsSubmittingPrivacy(false);
    }
  };


  // Payment Form
  const paymentDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'paymentOptions') : null, [firestore]);
  const { data: paymentData, isLoading: isLoadingPayment } = useDoc<PaymentSetting>(paymentDocRef);
  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
  });

  useEffect(() => {
    if (paymentData) {
        paymentForm.reset({ isCashOnDeliveryEnabled: paymentData.isCashOnDeliveryEnabled });
    } else {
        paymentForm.reset({ isCashOnDeliveryEnabled: true });
    }
  }, [paymentData, paymentForm]);

  const handlePaymentSettingChange = async (checked: boolean) => {
    if (!firestore || !paymentDocRef) return;
    paymentForm.setValue('isCashOnDeliveryEnabled', checked);
    try {
      await setDoc(paymentDocRef, { isCashOnDeliveryEnabled: checked }, { merge: true });
      toast({ title: 'Payment Settings Updated', description: `Cash on Delivery has been ${checked ? 'enabled' : 'disabled'}.` });
    } catch (error) {
      console.error('Error updating payment settings:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update payment settings.' });
      paymentForm.setValue('isCashOnDeliveryEnabled', !checked);
    }
  };


  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-2xl font-bold font-headline mb-4">General Settings</h2>
            <Card>
                <CardHeader>
                    <CardTitle>Payment Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoadingPayment ? <Skeleton className="h-20 w-full" /> : (
                    <Form {...paymentForm}>
                        <FormField
                            control={paymentForm.control}
                            name="isCashOnDeliveryEnabled"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Global Cash on Delivery</FormLabel>
                                        <FormDescription>
                                            Enable or disable COD for all products by default.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={handlePaymentSettingChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                            />
                    </Form>
                    )}
                </CardContent>
            </Card>
        </div>

        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" /> Announcement Bar</CardTitle>
                </CardHeader>
                <CardContent>
                {isLoadingAnnouncement ? <Skeleton className="h-40 w-full" /> : (
                <Form {...announcementForm}>
                    <form onSubmit={announcementForm.handleSubmit(onAnnouncementSubmit)} className="space-y-4">
                    <FormField
                        control={announcementForm.control}
                        name="content"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Announcement Text</FormLabel>
                            <FormDescription>
                                This text will appear in a special bar on your homepage. Leave it empty to hide the bar.
                            </FormDescription>
                            <FormControl>
                            <Textarea placeholder="e.g., ✨ Diwali Sale is LIVE! ✨" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSubmittingAnnouncement} className="w-full">
                        {isSubmittingAnnouncement ? 'Saving Announcement...' : 'Save Announcement'}
                    </Button>
                    </form>
                </Form>
                )}
                </CardContent>
            </Card>
        </div>
        
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Footer Content</CardTitle>
                </CardHeader>
                <CardContent>
                {isLoadingFooter ? <Skeleton className="h-40 w-full" /> : (
                <Form {...footerForm}>
                    <form onSubmit={footerForm.handleSubmit(onFooterSubmit)} className="space-y-4">
                    <FormField
                        control={footerForm.control}
                        name="content"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Footer Text</FormLabel>
                            <FormDescription>
                                This content will appear in your site's footer. You can use this for copyright, contact info, or other details.
                            </FormDescription>
                            <FormControl>
                            <Textarea placeholder="Enter footer text here..." {...field} rows={5} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSubmittingFooter} className="w-full">
                        {isSubmittingFooter ? 'Saving Footer...' : 'Save Footer'}
                    </Button>
                    </form>
                </Form>
                )}
                </CardContent>
            </Card>
        </div>

        <div>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Privacy Policy</CardTitle>
                </CardHeader>
                <CardContent>
                {isLoadingPrivacy ? <Skeleton className="h-40 w-full" /> : (
                <Form {...privacyForm}>
                    <form onSubmit={privacyForm.handleSubmit(onPrivacySubmit)} className="space-y-4">
                    <FormField
                        control={privacyForm.control}
                        name="content"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Policy Content</FormLabel>
                            <FormDescription>
                                This content will be displayed on your Privacy Policy page.
                            </FormDescription>
                            <FormControl>
                            <Textarea placeholder="Enter your privacy policy text here..." {...field} rows={10} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isSubmittingPrivacy} className="w-full">
                        {isSubmittingPrivacy ? 'Saving Policy...' : 'Save Privacy Policy'}
                    </Button>
                    </form>
                </Form>
                )}
                </CardContent>
            </Card>
        </div>
    </div>
  )
}

function HeroImageManager() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const heroImagesCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'heroImages');
    }, [firestore]);

    const { data: heroImages, isLoading } = useCollection<HeroImage>(heroImagesCollection);

    const form = useForm<HeroImageFormData>({
        resolver: zodResolver(heroImageSchema),
        defaultValues: {
            imageUrl: '',
        },
    });

    const onSubmit: SubmitHandler<HeroImageFormData> = async (data) => {
        if (!firestore) return;
        setIsSubmitting(true);
        try {
            const newDocRef = doc(heroImagesCollection!);
            const newHeroImage = {
                id: newDocRef.id,
                imageUrl: data.imageUrl,
            };
            await addDocumentNonBlocking(newDocRef, newHeroImage);
            toast({
                title: 'Hero Image Added!',
                description: 'The new image has been added to your homepage carousel.',
            });
            form.reset();
        } catch (error) {
            console.error('Error adding hero image:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not add the hero image.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (imageId: string) => {
        if (!firestore) return;
        const docRef = doc(firestore, 'heroImages', imageId);
        deleteDocumentNonBlocking(docRef);
        toast({
            title: 'Hero Image Deleted',
            description: `The image has been removed.`,
        });
    };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-3">
                    <ImageIcon className="h-6 w-6" />
                    Homepage Hero Section
                </h2>
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Hero Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Image URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://example.com/image.jpg" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isSubmitting} className="w-full">
                                    {isSubmitting ? 'Adding Image...' : 'Add Hero Image'}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div>
                <h3 className="text-xl font-bold font-headline mb-4">Current Hero Images</h3>
                <div className="space-y-4">
                    {isLoading && Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
                    {heroImages && heroImages.length > 0 ? (
                        heroImages.map(image => (
                            <Card key={image.id}>
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Image src={image.imageUrl} alt="Hero Image" width={80} height={80} className="rounded-md object-cover aspect-square" />
                                        <div>
                                            <p className="text-xs text-muted-foreground truncate max-w-xs">{image.imageUrl}</p>
                                        </div>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete this image?</AlertDialogTitle>
                                                <AlertDialogDescription>This will remove the image from your hero section. This cannot be undone.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(image.id)}>Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No hero images have been added yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function AdminAIDetails() {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const aiPromptDocRef = useMemoFirebase(() => firestore ? doc(firestore, 'settings', 'darpanAssistant') : null, [firestore]);
    const { data: aiPromptData, isLoading } = useDoc<AIPromptSetting>(aiPromptDocRef);

    const form = useForm<AIPromptFormData>({
        resolver: zodResolver(aiPromptSchema),
    });

    useEffect(() => {
        if (aiPromptData) {
            form.reset({ basePrompt: aiPromptData.basePrompt });
        } else {
            form.reset({
                basePrompt: `You are Darpan 2.0, a friendly and helpful AI shopping assistant for an e-commerce store called Darpan Wears.

Your goal is to answer user questions about products, ordering, shipping, or anything related to the store. Be concise and encouraging.

If the user provides an image, your primary task is to identify the product in the image by comparing it to the product catalog. State which product you think it is and why. If it's a screenshot from social media, acknowledge that and still try to find the matching product.

If no image is provided, answer the user's text-based question.

How to order:
1. Browse products and select one.
2. Check details, select a size, and click 'Order Now'.
3. Fill in your details and click 'Send Order on WhatsApp'.
All orders are placed via WhatsApp. Cash on Delivery is available for most products.`
            });
        }
    }, [aiPromptData, form]);

    const onSubmit: SubmitHandler<AIPromptFormData> = async (data) => {
        if (!aiPromptDocRef) return;
        setIsSubmitting(true);
        try {
            await setDoc(aiPromptDocRef, data, { merge: true });
            toast({
                title: 'AI Prompt Updated!',
                description: "Darpan 2.0's instructions have been saved.",
            });
        } catch (error) {
            console.error('Error updating AI prompt:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not update the AI prompt.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    return(
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-3">
                    <Bot className="h-6 w-6" />
                    Darpan 2.0 AI Assistant
                </h2>
                <Card>
                    <CardHeader>
                        <CardTitle>AI Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-48 w-full" />
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="basePrompt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>AI System Prompt</FormLabel>
                                                <FormDescription>
                                                    These are the core instructions for the AI. Edit this to change its personality, add details about shipping/returns, or provide other store information.
                                                </FormDescription>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="You are a helpful AI assistant..."
                                                        rows={15}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={isSubmitting} className="w-full">
                                        {isSubmitting ? 'Saving Prompt...' : 'Save AI Prompt'}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function AdminSettingsPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
             <h1 className="text-3xl font-bold font-headline">Settings</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <SiteSettingsForms />
                <div className="space-y-12">
                    <HeroImageManager />
                    <AdminAIDetails />
                </div>
            </div>
        </div>
    );
}
