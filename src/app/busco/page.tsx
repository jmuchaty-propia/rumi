"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { createSeeker } from "@/lib/queries";

const CITIES = ["Caracas", "Valencia", "Maracaibo", "Barquisimeto", "Lechería", "Mérida", "Margarita"];

export default function BuscoPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    occupation: "",
    bio: "",
    budget_min: "",
    budget_max: "",
    preferred_city: "",
    preferred_zones: "",
    move_in_date: "",
    phone: "",
  });

  function inputCls() {
    return (
      "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white text-ink placeholder-muted/60 " +
      "focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1"
    );
  }

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const budgetMin = Number(form.budget_min);
    const budgetMax = Number(form.budget_max);
    if (budgetMax < budgetMin) {
      setError("El presupuesto máximo debe ser mayor o igual al mínimo.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createSeeker({
        name: form.name,
        age: null,
        occupation: form.occupation,
        bio: form.bio,
        budget_min: budgetMin,
        budget_max: budgetMax,
        currency: "USD",
        preferred_city: form.preferred_city,
        preferred_zones: form.preferred_zones
          .split(",")
          .map((z) => z.trim())
          .filter(Boolean),
        move_in_date: form.move_in_date || null,
        gender: null,
        phone: form.phone,
      });
      setSubmitted(true);
    } catch {
      setError("No se pudo crear tu perfil. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mx-auto">
          <Check size={28} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold text-ink">Perfil creado</h1>
        <p className="text-muted text-sm">
          Tu perfil es visible para dueños de habitaciones. Te contactarán por
          WhatsApp si tienen algo para ti.
        </p>
        <Link
          href="/"
          className="inline-block text-sm font-medium text-primary hover:underline"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors"
      >
        <ArrowLeft size={16} />
        Volver
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-ink">Busco cuarto</h1>
        <p className="text-sm text-muted mt-1">
          Crea tu perfil para que dueños de habitaciones te encuentren y te
          contacten por WhatsApp.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-medium text-ink">Tu nombre</label>
          <input
            type="text"
            required
            placeholder="Nombre y apellido inicial"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputCls()}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink">Ocupación</label>
          <input
            type="text"
            required
            placeholder="Ej: Estudiante de Derecho, Diseñador freelance"
            value={form.occupation}
            onChange={(e) => update("occupation", e.target.value)}
            className={inputCls()}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ink">Sobre ti</label>
          <textarea
            required
            rows={3}
            placeholder="Cuéntale a los dueños un poco sobre ti — hábitos, horarios, si fumas, mascotas..."
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            className={inputCls() + " resize-none"}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-ink">
              Presupuesto mínimo (USD)
            </label>
            <input
              type="number"
              required
              placeholder="80"
              value={form.budget_min}
              onChange={(e) => update("budget_min", e.target.value)}
              className={inputCls()}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink">
              Presupuesto máximo (USD)
            </label>
            <input
              type="number"
              required
              placeholder="200"
              value={form.budget_max}
              onChange={(e) => update("budget_max", e.target.value)}
              className={inputCls()}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-ink">Ciudad</label>
            <select
              required
              value={form.preferred_city}
              onChange={(e) => update("preferred_city", e.target.value)}
              className={inputCls()}
            >
              <option value="">Seleccionar</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink">
              Fecha de mudanza
            </label>
            <input
              type="date"
              required
              value={form.move_in_date}
              onChange={(e) => update("move_in_date", e.target.value)}
              className={inputCls()}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink">
            Zonas preferidas
          </label>
          <input
            type="text"
            placeholder="Ej: Chacao, Altamira, Los Palos Grandes"
            value={form.preferred_zones}
            onChange={(e) => update("preferred_zones", e.target.value)}
            className={inputCls()}
          />
          <p className="text-xs text-muted mt-1">Separa con comas</p>
        </div>

        <div>
          <label className="text-sm font-medium text-ink">
            WhatsApp (con código de país)
          </label>
          <input
            type="tel"
            required
            placeholder="+584141234567"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputCls()}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-60"
        >
          {submitting ? "Creando..." : "Crear mi perfil"}
        </button>
      </form>
    </div>
  );
}
