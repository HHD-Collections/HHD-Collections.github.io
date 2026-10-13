import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { ProductImage } from '../../types';

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-charcoal-100 dark:bg-charcoal-800 rounded-2xl flex items-center justify-center text-charcoal-400">
        No image available
      </div>
    );
  }

  const currentImage = images[selectedIndex] || images[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Main Image Viewport */}
      <div
        className="relative aspect-square w-full rounded-2xl overflow-hidden bg-charcoal-50 dark:bg-charcoal-800/80 border border-charcoal-200 dark:border-charcoal-700/60 shadow-sm cursor-crosshair group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={currentImage.url}
          alt={currentImage.altText || productName}
          className={`w-full h-full object-cover object-center transition-transform duration-200 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={
            isZoomed
              ? {
                  transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                }
              : undefined
          }
          onError={(e) => {
            (e.target as HTMLImageElement).src = './assets/logo.png';
          }}
        />

        {/* Zoom Hint Indicator */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-full flex items-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Hover to Zoom</span>
        </div>

        {/* Counter Badge */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-full pointer-events-none">
          {selectedIndex + 1} / {images.length}
        </div>

        {/* Left / Right Carousel Controls */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-charcoal-800/90 text-charcoal-800 dark:text-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-charcoal-700 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-charcoal-800/90 text-charcoal-800 dark:text-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-charcoal-700 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Multiple Thumbnail Gallery Selector */}
      {images.length > 1 && (
        <div className="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-thin">
          {images.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                  isSelected
                    ? 'border-brand-500 ring-2 ring-brand-500/30 scale-105'
                    : 'border-charcoal-200 dark:border-charcoal-700 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.altText || `${productName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = './assets/logo.png';
                  }}
                />
                {img.isPrimary && (
                  <span className="absolute bottom-0 inset-x-0 bg-brand-500/90 text-white text-[8px] font-bold py-0.5 text-center uppercase tracking-wider">
                    Main
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
