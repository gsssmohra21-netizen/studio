
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Product } from '@/lib/products';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Search, PlusCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';


const productSchema = z.object({
  name: z.string().min(3, 'Product name is required'),
  category: z.string().min(3, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  originalPrice: z.coerce.number().min(0, 'Original price must be a positive number'),
  salePrice: z.coerce.number().min(0, 'Sale price must be a positive number'),
  images: z.array(z.object({ url: z.string().url('Please enter a valid image URL') })).min(1, 'Please add at least one image.'),
  sizes: z.string().min(1, 'Please enter at least one size (comma-separated)'),
  isCashOnDeliveryAvailable: z.boolean(),
  productLink: z.string().url('Please enter a valid URL for the product link').optional().or(z.literal('')),
  videoUrl: z.string().url('Please enter a valid video URL').optional().or(z.literal('')),
});

type ProductFormData = z.infer<typeof productSchema>;

function AddProductForm() {
    const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    const productForm = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            category: '',
            description: '',
            originalPrice: 0,
            salePrice: 0,
            images: [{ url: '' }],
            sizes: '',
            isCashOnDeliveryAvailable: true,
            productLink: '',
            videoUrl: '',
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: productForm.control,
        name: 'images'
    });

    const onProductSubmit: SubmitHandler<ProductFormData> = async (data) => {
        if (!firestore) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Firestore is not available. Please try again later.",
            });
            return;
        }

        setIsSubmittingProduct(true);
        
        try {
            const productsCollectionRef = collection(firestore, 'products');
            const newDocRef = doc(productsCollectionRef); 
            const productId = newDocRef.id;

            const newProduct = {
                id: productId,
                name: data.name,
                category: data.category,
                description: data.description,
                originalPrice: data.originalPrice,
                salePrice: data.salePrice,
                priceFormatted: `₹${data.salePrice}`,
                images: data.images.map((img, index) => (
                    {
                        id: `${productId}_img_${index}`,
                        url: img.url,
                        alt: data.name,
                        hint: 'product photo',
                    }
                )),
                sizes: data.sizes.split(',').map(s => s.trim()),
                isCashOnDeliveryAvailable: data.isCashOnDeliveryAvailable,
                productLink: data.productLink || '',
                videoUrl: data.videoUrl || '',
            };

            await addDocumentNonBlocking(newDocRef, newProduct);
            
            toast({
                title: 'Product Added!',
                description: `${data.name} has been successfully added to your store.`,
            });
            productForm.reset();
        } catch (error) {
            console.error('Error adding product:', error);
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: 'Could not add the product. Please try again.',
            });
        } finally {
            setIsSubmittingProduct(false);
        }
    };
    
    return (
         <div className="max-w-2xl">
            <h2 className="text-2xl font-bold font-headline mb-8">Add New Product</h2>
            <Form {...productForm}>
                <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-6">
                <FormField
                    control={productForm.control}
                    name="name"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., Cool T-Shirt" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={productForm.control}
                    name="category"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., T-Shirts, Jackets" {...field} />
                        </FormControl>
                        <FormDescription>
                            Assign a category to this product (e.g., Jackets, T-Shirts).
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={productForm.control}
                    name="description"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                        <Textarea placeholder="Describe the product..." {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={productForm.control}
                        name="originalPrice"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Original Price (₹)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 1299" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={productForm.control}
                        name="salePrice"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Sale Price (₹)</FormLabel>
                            <FormControl>
                            <Input type="number" placeholder="e.g., 999" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                
                <div>
                    <FormLabel>Images</FormLabel>
                    <div className="space-y-4 pt-2">
                    {fields.map((field, index) => (
                        <FormField
                        key={field.id}
                        control={productForm.control}
                        name={`images.${index}.url`}
                        render={({ field }) => (
                            <FormItem>
                            <div className="flex items-center gap-2">
                                <FormControl>
                                <Input placeholder="https://example.com/image.jpg" {...field} />
                                </FormControl>
                                <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => remove(index)}
                                disabled={fields.length <= 1}
                                >
                                <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    ))}
                    </div>
                    <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ url: '' })}
                    >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Image
                    </Button>
                </div>

                <FormField
                    control={productForm.control}
                    name="sizes"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Sizes (comma-separated)</FormLabel>
                        <FormControl>
                        <Input placeholder="e.g., S, M, L, XL" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

                <FormField
                    control={productForm.control}
                    name="isCashOnDeliveryAvailable"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                        <FormLabel>Cash on Delivery</FormLabel>
                        <FormDescription>
                            Is COD available for this specific product?
                        </FormDescription>
                        </div>
                        <FormControl>
                        <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                        />
                        </FormControl>
                    </FormItem>
                    )}
                />

                <FormField
                    control={productForm.control}
                    name="videoUrl"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Video URL (Optional)</FormLabel>
                        <FormControl>
                        <Input placeholder="https://example.com/video.mp4" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={productForm.control}
                    name="productLink"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Product Link (Admin only)</FormLabel>
                        <FormControl>
                        <Input placeholder="https://example.com/product-link" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" disabled={isSubmittingProduct} className="w-full">
                    {isSubmittingProduct ? 'Adding Product...' : 'Add Product'}
                </Button>
                </form>
            </Form>
        </div>
    );
}


function ProductSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [foundProduct, setFoundProduct] = useState<Product | null>(null);
    const [searched, setSearched] = useState(false);

    const firestore = useFirestore();
    const productsCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'products');
    }, [firestore]);

    const { data: products, isLoading } = useCollection<Product>(productsCollection);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearched(true);
        if (!products || !searchTerm) {
            setFoundProduct(null);
            return;
        }
        const result = products.find(p => p.id === searchTerm.trim());
        setFoundProduct(result || null);
    };

    return (
        <div className="space-y-4">
             <h2 className="text-2xl font-bold font-headline">Find Product by ID</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                    type="text"
                    placeholder="Enter Product ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow"
                />
                <Button type="submit" disabled={isLoading}>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                </Button>
            </form>
            {searched && (
                <div className="pt-4">
                    {foundProduct ? (
                         <Card>
                            <CardContent className="p-4">
                               <p className="font-bold">{foundProduct.name}</p>
                               <p className="text-sm text-muted-foreground">ID: {foundProduct.id}</p>
                               {foundProduct.productLink ? (
                                   <a href={foundProduct.productLink} target="_blank" rel="noopener noreferrer" className="text-primary underline mt-2 inline-block">
                                        {foundProduct.productLink}
                                   </a>
                               ) : (
                                  <p className="text-sm text-muted-foreground mt-2">No product link available.</p>
                               )}
                            </CardContent>
                         </Card>
                    ) : (
                        <p className="text-muted-foreground text-center">Product not found.</p>
                    )}
                </div>
            )}
        </div>
    )
}

function ProductList() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const productsCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'products');
    }, [firestore]);

    const { data: products, isLoading } = useCollection<Product>(productsCollection);

    const handleDelete = (productId: string, productName: string) => {
        if (!firestore) return;
        const docRef = doc(firestore, 'products', productId);
        deleteDocumentNonBlocking(docRef);
        toast({
            title: 'Product Deleted',
            description: `${productName} has been removed from your store.`,
        });
    };

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-bold font-headline">Manage Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading && Array.from({ length: 3 }).map((_, i) => (
                     <Card key={i}><CardContent className="p-4 space-y-4"><Skeleton className="aspect-square w-full" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-5 w-1/2" /><div className="flex justify-end gap-2 pt-2"><Skeleton className="h-9 w-20" /><Skeleton className="h-9 w-20" /></div></CardContent></Card>
                ))}
                {products?.map((product) => (
                    <Card key={product.id} className="flex flex-col">
                        <CardHeader className="p-0">
                             <Image
                                src={product.images[0].url}
                                alt={product.images[0].alt}
                                width={400}
                                height={400}
                                className="object-cover aspect-square rounded-t-lg"
                             />
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                            <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                            <div className="flex items-baseline gap-2">
                                <p className="text-primary font-semibold">₹{product.salePrice}</p>
                                <p className="text-muted-foreground line-through text-sm">₹{product.originalPrice}</p>
                            </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                             <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/edit/${product.id}`}>
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="sm">
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the product
                                            "{product.name}".
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(product.id, product.name)}>
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </CardFooter>
                    </Card>
                ))}
            </div>
            {!isLoading && products?.length === 0 && (
                <p className="text-muted-foreground text-center py-8">No products found.</p>
            )}
        </div>
    );
}

export default function AdminProductsPage() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            <h1 className="text-3xl font-bold font-headline">Products</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-1">
                     <AddProductForm />
                </div>
                <div className="lg:col-span-2 space-y-12">
                    <ProductSearch />
                    <Separator />
                    <ProductList />
                </div>
            </div>
        </div>
    );
}
