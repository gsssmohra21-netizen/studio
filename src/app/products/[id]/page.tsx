import { getProductById } from '@/lib/products';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import ProductDetailsClient from '@/components/product-details-client';
import Link from 'next/link';

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = getProductById(params.id);

  if (!product) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen flex flex-col">
       <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center sm:justify-start h-20">
            <Link href="/" className="text-3xl font-bold text-primary font-headline">
              KapdaKart
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
          <div className="flex justify-center items-start">
             <div className="aspect-[3/4] w-full max-w-md rounded-lg overflow-hidden shadow-lg sticky top-28">
                <Image
                    src={product.images[0].url}
                    alt={product.images[0].alt}
                    width={600}
                    height={800}
                    className="object-cover w-full h-full"
                    data-ai-hint={product.images[0].hint}
                    priority
                />
             </div>
          </div>
          <div className="flex flex-col pt-4">
            <h1 className="text-4xl lg:text-5xl font-bold font-headline text-foreground mb-4">{product.name}</h1>
            <p className="text-3xl font-bold text-primary mb-6">{product.priceFormatted}</p>
            <Separator className="my-6" />
            <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>
            
            <ProductDetailsClient product={product} />

          </div>
        </div>
      </main>
      <footer className="bg-card border-t mt-auto">
          <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} KapdaKart. All rights reserved.</p>
          </div>
      </footer>
    </div>
  );
}
