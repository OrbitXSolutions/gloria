"use client";

import type React from "react";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import type { ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import {
  DEFAULT_FALLBACKS,
  ImageFallbackConfig,
  isValidImageUrl,
  logImageError,
  getNextFallback,
} from "@/lib/common/image-error-handler";

export interface SafeImageProps extends Omit<ImageProps, "src" | "onError"> {
  src: string | null | undefined;
  fallbackType?: keyof typeof DEFAULT_FALLBACKS;
  fallbackConfig?: ImageFallbackConfig;
  showLoadingState?: boolean;
  context?: string;
  onImageError?: (error: string, src: string) => void;
  onImageLoad?: (src: string) => void;
}

export default function SafeImage({
  src,
  alt,
  fallbackType = "product",
  fallbackConfig,
  showLoadingState = true,
  context,
  className,
  onImageError,
  onImageLoad,
  ...props
}: SafeImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Get fallback configuration
  const config = fallbackConfig || DEFAULT_FALLBACKS[fallbackType];

  // Initialize the image source
  useEffect(() => {
    if (!src || !isValidImageUrl(src)) {
      setCurrentSrc(config.final);
      setIsLoading(false);
      setHasError(true);
      return;
    }

    setCurrentSrc(src);
    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [src, config.final]);

  const handleImageError = useCallback(
    (error: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const errorMessage = `Failed to load image: ${currentSrc}`;
      logImageError(currentSrc, error.nativeEvent, context);

      // Get next fallback
      const nextSrc = getNextFallback(currentSrc, config, retryCount);

      if (nextSrc && nextSrc !== currentSrc) {
        setCurrentSrc(nextSrc);
        setRetryCount((prev) => prev + 1);
      } else {
        setHasError(true);
        setIsLoading(false);
      }

      // Call custom error handler if provided
      onImageError?.(errorMessage, currentSrc);
    },
    [currentSrc, config, retryCount, context, onImageError]
  );

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onImageLoad?.(currentSrc);
  }, [currentSrc, onImageLoad]);

  const handleImageLoadStart = useCallback(() => {
    setIsLoading(true);
  }, []);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Loading State */}
      {isLoading && showLoadingState && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Error State Overlay */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg
              className="w-8 h-8 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}

      {/* Actual Image */}
      <Image
        {...props}
        src={currentSrc || config.final}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          className
        )}
        onError={handleImageError}
        onLoad={handleImageLoad}
        onLoadStart={handleImageLoadStart}
        // Prevent Next.js from optimizing placeholder images
        unoptimized={currentSrc.includes("placeholder.svg")}
      />
    </div>
  );
}
