"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-surface/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-content mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary tracking-tight">
          rumi
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-6">
          <Link
            href="/habitaciones"
            className="text-sm text-ink/70 hover:text-ink transition-colors"
          >
            Habitaciones
          </Link>
          <Link
            href="/buscando"
            className="text-sm text-ink/70 hover:text-ink transition-colors"
          >
            Buscan cuarto
          </Link>
          <Link
            href="/publicar"
            className="text-sm font-medium text-white bg-primary hover:bg-primary-dark px-4 py-2 rounded-lg transition-colors"
          >
            Publicar
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden p-2 text-ink/70"
          aria-label="Menú"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-gray-100 bg-surface px-4 py-3 space-y-2">
          <Link
            href="/habitaciones"
            className="block py-2 text-sm text-ink/70"
            onClick={() => setOpen(false)}
          >
            Habitaciones
          </Link>
          <Link
            href="/buscando"
            className="block py-2 text-sm text-ink/70"
            onClick={() => setOpen(false)}
          >
            Buscan cuarto
          </Link>
          <Link
            href="/publicar"
            className="block py-2 text-sm font-medium text-primary"
            onClick={() => setOpen(false)}
          >
            Publicar cuarto
          </Link>
          <Link
            href="/busco"
            className="block py-2 text-sm font-medium text-accent"
            onClick={() => setOpen(false)}
          >
            Busco cuarto
          </Link>
        </div>
      )}
    </nav>
  );
}
