"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Home, User } from "lucide-react";
import { SavedPanel, getSavedPanels } from "@/lib/local";

/** Lista los paneles guardados en este teléfono */
export default function MyPanelsPage() {
  const [panels, setPanels] = useState<SavedPanel[] | null>(null);
  useEffect(() => setPanels(getSavedPanels()), []);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <h1 className="text-xl font-bold text-ink">Mi panel</h1>

      {panels === null ? null : panels.length === 0 ? (
        <div className="text-center py-10 space-y-3">
          <p className="text-sm text-muted">
            No hay anuncios ni perfiles guardados en este teléfono.
          </p>
          <p className="text-xs text-muted">
            Si publicaste desde otro dispositivo, abre el link privado que te enviaste por WhatsApp.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <Link href="/publicar" className="px-4 py-2 bg-primary text-white text-sm rounded-lg">
              Publicar habitación
            </Link>
            <Link href="/busco" className="px-4 py-2 border border-gray-200 text-sm rounded-lg">
              Crear perfil
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {panels.map((p) => (
            <Link
              key={p.token}
              href={`/${p.kind === "room" ? "panel" : "perfil"}/${p.token}`}
              className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl p-3 hover:border-gray-200"
            >
              <span className="w-10 h-10 rounded-full bg-rumi-soft flex items-center justify-center text-primary">
                {p.kind === "room" ? <Home size={18} /> : <User size={18} />}
              </span>
              <span className="min-w-0">
                <span className="block font-medium text-ink truncate">{p.title}</span>
                <span className="block text-xs text-muted">
                  {p.kind === "room" ? "Ver postulaciones" : "Ver invitaciones"}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
