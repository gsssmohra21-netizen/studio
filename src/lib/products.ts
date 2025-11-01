import { PlaceHolderImages } from './placeholder-images';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  priceFormatted: string;
  images: {
      id: string;
      url: string;
      alt: string;
      hint: string;
  }[];
  sizes: string[];
};

const getImage = (id: string) => {
    const img = PlaceHolderImages.find(p => p.id === id);
    if (!img) {
        // Fallback for safety, though it should not happen if JSON is correct
        return {
            id: 'fallback',
            url: 'https://picsum.photos/seed/fallback/600/800',
            alt: 'Fallback image',
            hint: 'product photo'
        };
    }
    return {
        id: img.id,
        url: img.imageUrl,
        alt: img.description,
        hint: img.imageHint,
    }
}

export const products: Product[] = [
  {
    id: 'prod_1',
    name: 'Denim Jacket',
    description: 'A timeless denim jacket that adds a cool, casual layer to any outfit. Made from 100% durable cotton, it features classic button-front styling, chest pockets, and a comfortable fit that gets better with every wear.',
    price: 2999,
    priceFormatted: '₹2,999',
    images: [getImage('prod_1_img')],
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'prod_2',
    name: 'Classic White Tee',
    description: 'The perfect wardrobe essential. Our Classic White Tee is crafted from ultra-soft premium cotton for a breathable, comfortable feel. Its versatile design makes it ideal for layering or wearing on its own.',
    price: 899,
    priceFormatted: '₹899',
    images: [getImage('prod_2_img')],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
  },
  {
    id: 'prod_3',
    name: 'Black Skinny Jeans',
    description: 'Elevate your style with our Black Skinny Jeans. Designed to flatter, these jeans offer a sleek, modern silhouette with just the right amount of stretch for all-day comfort. A versatile staple for any wardrobe.',
    price: 2499,
    priceFormatted: '₹2,499',
    images: [getImage('prod_3_img')],
    sizes: ['28', '30', '32', '34', '36'],
  },
  {
    id: 'prod_4',
    name: 'Floral Summer Dress',
    description: 'Embrace the sunshine in our beautiful Floral Summer Dress. Featuring a vibrant floral print, a lightweight and breezy fabric, and a flattering A-line cut, this dress is perfect for picnics, parties, or a day out.',
    price: 1999,
    priceFormatted: '₹1,999',
    images: [getImage('prod_4_img')],
    sizes: ['S', 'M', 'L'],
  },
];

export const getProductById = (id: string): Product | undefined => {
    return products.find(p => p.id === id);
}
