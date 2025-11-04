
'use client';

import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Order } from '@/lib/orders';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Search, CheckCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function OrderListPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    const ordersCollection = useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'orders');
    }, [firestore]);

    const { data: orders, isLoading } = useCollection<Order>(ordersCollection);
    
    const sortedOrders = useMemo(() => {
        return orders ? [...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()) : [];
    }, [orders]);


    const filteredOrders = useMemo(() => {
        if (!sortedOrders) return [];
        if (!searchTerm) return sortedOrders;
        return sortedOrders.filter(order => 
            order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customerContact.includes(searchTerm) ||
            order.productId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sortedOrders, searchTerm]);


    const handleStatusChange = (order: Order) => {
        if (!firestore) return;
        const docRef = doc(firestore, 'orders', order.id);
        const newStatus = !order.isCompleted;
        const updateData: { isCompleted: boolean; completedDate?: string } = { isCompleted: newStatus };
        if (newStatus) {
            updateData.completedDate = new Date().toISOString();
        } else {
            updateData.completedDate = '';
        }
        updateDocumentNonBlocking(docRef, updateData);
        toast({
            title: `Order ${newStatus ? 'Completed' : 'Marked as Pending'}`,
            description: `Order for ${order.customerName} has been updated.`,
        });
    };
    
    const handleDeleteOrder = (order: Order) => {
        if (!firestore) return;
        const docRef = doc(firestore, 'orders', order.id);
        deleteDocumentNonBlocking(docRef);
        toast({
            title: 'Order Deleted',
            description: `Order for ${order.customerName} has been deleted.`,
        });
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
             <h1 className="text-3xl font-bold font-headline">Manage Orders</h1>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Search by customer, contact, or Product ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full max-w-md"
                />
            </div>
             <div className="space-y-4">
                {isLoading && Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
                
                {!isLoading && filteredOrders && filteredOrders.map(order => (
                    <Card key={order.id} className={`w-full ${order.isCompleted ? 'bg-green-500/10 border-green-500/30' : ''}`}>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className='font-semibold text-lg'>{order.customerName}</p>
                                    <p className='text-sm text-muted-foreground'>{order.customerContact}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                     <Switch 
                                        checked={order.isCompleted}
                                        onCheckedChange={() => handleStatusChange(order)}
                                        aria-label='Toggle order status'
                                        className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-yellow-500"
                                    />
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete this order?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will permanently delete the order for {order.customerName}. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDeleteOrder(order)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                            <Separator/>
                             <div className="space-y-2 text-sm">
                                <p className="text-muted-foreground">{order.customerAddress}</p>
                                <p><strong>Product ID:</strong> <span className='font-mono'>{order.productId}</span></p>
                                {order.productDetails && (
                                    <p><strong>Item:</strong> {order.productDetails.name} (Size: {order.productDetails.size})</p>
                                )}
                             </div>
                             <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
                                 <div className='flex items-center gap-1.5'>
                                     <Clock className="h-3 w-3" />
                                     <span>Ordered: {format(new Date(order.orderDate), "PPp")}</span>
                                 </div>
                                 {order.isCompleted && order.completedDate && (
                                     <div className='flex items-center gap-1.5 text-green-600 font-medium'>
                                         <CheckCircle className="h-3 w-3" />
                                         <span>Completed: {format(new Date(order.completedDate), "PPp")}</span>
                                     </div>
                                 )}
                             </div>

                        </CardContent>
                    </Card>
                ))}
                 {!isLoading && filteredOrders?.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">No orders found.</p>
                         {searchTerm && <p className="text-sm text-muted-foreground mt-2">Try clearing your search.</p>}
                    </div>
                )}
             </div>
        </div>
    )
}
