import { Category } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-kitchen-dining',
    name: 'Kitchen & Dining',
    slug: 'kitchen-dining',
    description: 'Smart kitchen storage, dining essentials, premium drinkware, and efficient meal preparation appliances.',
    coverImage: './products/prod-006/image-1.jpeg',
    order: 1,
    active: true,
    itemCount: 6,
  },
  {
    id: 'cat-home-organization',
    name: 'Home & Organization',
    slug: 'home-organization',
    description: 'Declutter your living space with stylish organizers, protective covers, and smart wall-mounted accessories.',
    coverImage: './products/prod-003/image-1.jpeg',
    order: 2,
    active: true,
    itemCount: 3,
  },
  {
    id: 'cat-health-beauty',
    name: 'Health & Beauty',
    slug: 'health-beauty',
    description: 'Luxury personal care tools, salon-grade styling gear, and elegant compact travel organizers.',
    coverImage: './products/prod-012/image-1.jpeg',
    order: 3,
    active: true,
    itemCount: 3,
  },
  {
    id: 'cat-home-appliances-toys',
    name: 'Home Appliances & Toys',
    slug: 'home-appliances-toys',
    description: 'Innovative instant heating appliances and engaging interactive toys for family enjoyment.',
    coverImage: './products/prod-013/image-1.jpeg',
    order: 4,
    active: true,
    itemCount: 2,
  },
];
