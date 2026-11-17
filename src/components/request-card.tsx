"use client";

import { Check, CircleAlert, X } from "lucide-react";
import { RequestStatus } from "@/lib/types";
import { SafeImg, WhatsAppIcon } from "./ui";

/** Tarjeta común para postulaciones (panel del dueño) e invitaciones (panel del buscador) */
export function RequestCard({
  avatarUrl,
  title,
  subtitle,
  children,
  status,
  matchOk,
  mismatches = [],
  whatsappUrl,
  contactLabel,
  onAccept,
  onReject,
  createdAt,
}: {
  avatarUrl?: string | null;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  status: RequestStatus;
  matchOk?: boolean;
  mismatches?: string[];
  whatsappUrl: string;
  contactLabel: string;
  onAccept: () => void;
  onReject: () => void;
  createdAt: string;
}) {
  return (
    <div
      className={`bg-white rounded-xl border p-4 space-y-3 ${
        status === "rechazada" ? "border-gray-100 opacity-60" : "border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {avatarUrl !== undefined && (
          <SafeImg
            src={avatarUrl}
            alt={title}
            fallbackIcon={false}
            className="w-14 h-14 rounded-full object-cover shrink-0"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-ink leading-tight">{title}</h3>
            <span className="text-[11px] text-muted shrink-0">
              {new Date(createdAt).toLocaleDateString("es-VE", { day: "numeric", month: "short" })}
            </span>
          </div>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
      </div>

      {matchOk !== undefined &&
        (matchOk ? (
          <p className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
            <Check size={13} /> Cumple tus condiciones
          </p>
        ) : (
          <p className="inline-flex items-start gap-1 text-xs font-medium text-amber-800 bg-amber-50 px-2 py-1 rounded">
            <CircleAlert size={13} className="shrink-0 mt-px" /> No cumple: {mismatches.join(" · ")}
          </p>
        ))}

      {children}

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onAccept}
          className="flex items-center justify-center gap-2 py-2.5 bg-whatsapp hover:bg-whatsapp/90 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <WhatsAppIcon />
          {status === "aceptada" ? "Escribir de nuevo" : contactLabel}
        </a>
        {status !== "rechazada" ? (
          <button
            type="button"
            onClick={onReject}
            aria-label="Descartar"
            className="px-3 border border-gray-200 rounded-lg text-ink/60 hover:border-gray-300"
          >
            <X size={18} />
          </button>
        ) : (
          <span className="px-3 flex items-center text-xs text-muted">Descartada</span>
        )}
      </div>
    </div>
  );
}

export function StatusTabs({
  value,
  onChange,
  counts,
}: {
  value: RequestStatus;
  onChange: (v: RequestStatus) => void;
  counts: Record<RequestStatus, number>;
}) {
  const tabs: [RequestStatus, string][] = [
    ["pendiente", "Nuevas"],
    ["aceptada", "Contactadas"],
    ["rechazada", "Descartadas"],
  ];
  return (
    <div className="flex gap-1 bg-rumi-soft p-1 rounded-lg">
      {tabs.map(([k, label]) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={`flex-1 text-xs sm:text-sm font-medium py-2 rounded-md transition-colors ${
            value === k ? "bg-white text-ink shadow-sm" : "text-ink/50"
          }`}
        >
          {label} ({counts[k]})
        </button>
      ))}
    </div>
  );
}
