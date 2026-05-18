"use client";

import { useState, useEffect } from "react";

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export default function SafeImage({
  src,
  alt,
  fallbackSrc = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=600",
  style,
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  // Sync state if the source prop changes
  useEffect(() => {
    setImgSrc(src || fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      style={style}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
