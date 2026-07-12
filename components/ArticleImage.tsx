"use client";

import { useState } from "react";

export default function ArticleImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-neutral-100 text-neutral-400 ${className ?? ""}`}
        aria-hidden
      >
        <span className="font-masthead text-3xl select-none">مجيد</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className ?? ""}`}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
