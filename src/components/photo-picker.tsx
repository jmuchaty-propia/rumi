"use client";

import { useEffect, useMemo } from "react";
import { Camera, X } from "lucide-react";

/**
 * Selector de fotos con miniaturas. Pensado para el móvil:
 * el input abre la galería / cámara y se pueden ir sumando fotos.
 */
export function PhotoPicker({
  label,
  hint,
  files,
  onChange,
  max = 5,
  required = false,
}: {
  label: string;
  hint?: string;
  files: File[];
  onChange: (files: File[]) => void;
  max?: number;
  required?: boolean;
}) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  return (
    <div>
      <label className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-primary"> *</span>}
      </label>
      {hint && <p className="text-xs text-muted mt-0.5">{hint}</p>}

      <div className="mt-2 grid grid-cols-3 gap-2">
        {previews.map((url, i) => (
          <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            {i === 0 && (
              <span className="absolute bottom-1 left-1 text-[10px] font-semibold bg-black/60 text-white px-1.5 py-0.5 rounded">
                Portada
              </span>
            )}
            <button
              type="button"
              aria-label="Quitar foto"
              onClick={() => onChange(files.filter((_, j) => j !== i))}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {files.length < max && (
          <label className="aspect-square rounded-lg border-2 border-dashed border-primary/30 bg-rumi-soft flex flex-col items-center justify-center gap-1 text-primary cursor-pointer hover:border-primary/60 transition-colors">
            <Camera size={22} />
            <span className="text-xs font-medium">Añadir</span>
            <span className="text-[10px] text-muted">
              {files.length}/{max}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []);
                onChange([...files, ...picked].slice(0, max));
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}
