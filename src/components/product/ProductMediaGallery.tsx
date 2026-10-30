"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import type { CatalogProductMedia } from "@/lib/catalog/types";

interface ProductMediaGalleryProps {
  media: CatalogProductMedia[];
  title: string;
}

export function ProductMediaGallery({ media, title }: ProductMediaGalleryProps) {
  const images = media.length > 0 ? media : [
    {
      id: "placeholder",
      productId: "placeholder",
      storagePath: "",
      publicUrl: "/images/placeholder.jpg",
      altText: title,
      displayOrder: 0,
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Touch gesture state (explicitly preserving vertical scrolling via touch-pan-y)
  const touchCoordsRef = useRef<{ startX: number; startY: number } | null>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const activeImage = images[activeIndex] || images[0];

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsZoomed(false);
  }, [images.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    setIsZoomed(false);
  }, [images.length]);

  // Touch gestures for swipe
  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    const touch = e.touches[0];
    touchCoordsRef.current = { startX: touch.clientX, startY: touch.clientY };
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (!touchCoordsRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchCoordsRef.current.startX;
    const deltaY = touch.clientY - touchCoordsRef.current.startY;
    touchCoordsRef.current = null;

    // Only swipe if predominantly horizontal and exceeds threshold, preserving vertical scrolling
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
  }

  // Keyboard navigation for thumbnails
  function handleThumbnailKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const nextIdx = (index + 1) % images.length;
      setActiveIndex(nextIdx);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prevIdx = (index - 1 + images.length) % images.length;
      setActiveIndex(prevIdx);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(images.length - 1);
    }
  }

  // Lightbox key listeners & scroll lock
  useEffect(() => {
    if (!isLightboxOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsLightboxOpen(false);
        setIsZoomed(false);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isLightboxOpen, handleNext, handlePrev]);

  return (
    <div className="space-y-4 w-full">
      {/* Main Viewport Container */}
      <div
        className="relative aspect-square w-full rounded-3xl overflow-hidden bg-surface-cloud border border-border-warm shadow-xs select-none touch-pan-y group cursor-zoom-in"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setIsLightboxOpen(true)}
        role="region"
        aria-label="Main product visual"
      >
        <Image
          src={activeImage.publicUrl}
          alt={activeImage.altText || title}
          fill
          priority
          loading="eager"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Zoom Hint Badge */}
        <div className="absolute bottom-4 right-4 bg-espresso-deep/75 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity pointer-events-none">
          <span>🔍</span> Click to zoom
        </div>

        {/* Counter Badge */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-surface-custard/90 backdrop-blur-xs text-espresso-deep px-2.5 py-1 rounded-full text-[10px] font-bold border border-border-warm/60">
            {activeIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation Rail */}
      {images.length > 1 && (
        <div
          role="tablist"
          aria-label="Product image thumbnails"
          className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none"
        >
          {images.map((item, idx) => {
            const isSelected = idx === activeIndex;
            return (
              <button
                key={item.id}
                role="tab"
                type="button"
                aria-selected={isSelected}
                aria-label={`View photo ${idx + 1} of ${images.length}: ${item.altText || title}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActiveIndex(idx)}
                onKeyDown={(e) => handleThumbnailKeyDown(e, idx)}
                className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  isSelected
                    ? "border-primary shadow-sm scale-102"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={item.publicUrl}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox / Zoom Dialog Modal */}
      {isLightboxOpen && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} image zoom view`}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsLightboxOpen(false);
              setIsZoomed(false);
            }
          }}
        >
          {/* Top Controls Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <span className="text-white/80 text-xs font-semibold px-3 py-1 rounded-full bg-white/10">
              {activeIndex + 1} / {images.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsZoomed((prev) => !prev)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                aria-label={isZoomed ? "Zoom out" : "Zoom in"}
              >
                {isZoomed ? "🔍 Zoom Out" : "🔎 Zoom In"}
              </button>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setIsZoomed(false);
                }}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close image zoom view"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center text-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-white z-10"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center text-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-white z-10"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}

          {/* Lightbox Center Image */}
          <div
            className={`relative max-w-4xl max-h-[85vh] w-full h-[70vh] flex items-center justify-center transition-transform duration-300 cursor-pointer ${
              isZoomed ? "scale-125" : "scale-100"
            }`}
            onClick={() => setIsZoomed((prev) => !prev)}
          >
            <Image
              src={activeImage.publicUrl}
              alt={activeImage.altText || title}
              fill
              sizes="(max-width: 1024px) 95vw, 1200px"
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}

