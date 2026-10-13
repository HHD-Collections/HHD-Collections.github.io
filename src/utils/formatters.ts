/**
 * Currency & Formatting Utilities for HHD Collections
 */

export function formatPrice(amount: number, currency = 'PKR'): string {
  if (isNaN(amount)) return 'Rs. 0';
  const formatted = new Intl.NumberFormat('en-PK', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `Rs. ${formatted}`;
}

export function formatPriceUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(timestamp: string | number | Date): string {
  if (!timestamp) return 'N/A';
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateDiscountPercentage(regularPrice: number, salePrice?: number): number {
  if (!salePrice || salePrice >= regularPrice) return 0;
  return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
}
