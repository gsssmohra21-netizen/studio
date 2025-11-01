
"use client";

import * as React from "react";
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from '@/components/ui/separator';
import ProductDetailsClient from '@/components/product-details-client';
import type { Product } from "@/lib/products";

interface ProductDetailsDialogProps {
  product: Product;
  children: React.ReactNode;
}

export function ProductDetailsDialog({ product, children }: ProductDetailsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full h-auto max-h-[90vh] grid grid-cols-1 md:grid-cols-2 gap-0 p-0">
        <div className="flex justify-center items-start overflow-hidden rounded-l-lg">
             <div className="aspect-[3/4] w-full relative">
                <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt}
                    fill
                    className="object-cover"
                    data-ai-hint={product.images[0].hint}
                    priority
                />
             </div>
        </div>
        <div className="flex flex-col p-6 sm:p-8 overflow-y-auto">
            <h1 className="text-3xl lg:text-4xl font-bold font-headline text-foreground mb-3">{product.name}</h1>
            <p className="text-2xl font-bold text-primary mb-4">{product.priceFormatted}</p>
            <Separator className="my-4" />
            <div className="prose prose-sm text-muted-foreground leading-relaxed mb-6 max-w-none">
              <p>{product.description}</p>
            </div>
            
            <ProductDetailsClient product={product} />

          </div>
      </DialogContent>
    </Dialog>
  );
}
