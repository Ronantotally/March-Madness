"use client";

import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  size: number;
  fallbackText: string;
  fallbackColor: string;
  className?: string;
}

export default function TeamLogo({
  src,
  alt,
  size,
  fallbackText,
  fallbackColor,
  className = "",
}: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-full font-mono font-bold text-white ${className}`}
        style={{
          width: size,
          height: size,
          background: fallbackColor,
          fontSize: Math.max(7, size * 0.3),
        }}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
