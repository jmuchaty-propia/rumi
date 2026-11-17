"use client";

import { useRef, useState } from "react";
import { SafeImg } from "./ui";

/** Carrusel deslizable (scroll-snap): nativo en el móvil, sin librerías. */
export function PhotoGallery({ photos, alt }: { photos: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  if (photos.length === 0) {
    return <SafeImg src={null} alt={alt} className="w-full aspect-[4/3] rounded-xl" />;
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget;
          setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex overflow-x-auto snap-x snap-mandatory rounded-xl no-scrollbar"
      >
        {photos.map((url, i) => (
          <SafeImg
            key={url + i}
            src={url}
            alt={`${alt} — foto ${i + 1}`}
            className="w-full shrink-0 snap-center aspect-[4/3] object-cover"
          />
        ))}
      </div>
      {photos.length > 1 && (
        <>
          <span className="absolute top-2 right-2 text-xs font-medium bg-black/60 text-white px-2 py-0.5 rounded-full">
            {index + 1}/{photos.length}
          </span>
          <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                aria-label={`Foto ${i + 1}`}
                onClick={() =>
                  ref.current?.scrollTo({ left: i * ref.current.clientWidth, behavior: "smooth" })
                }
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
