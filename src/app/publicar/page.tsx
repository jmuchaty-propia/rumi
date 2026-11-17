"use client";

import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { createRoom, uploadPhoto } from "@/lib/queries";
import { CITIES } from "@/lib/types";
import { PhotoPicker } from "@/components/photo-picker";
import { LocationPicker, PickedLocation, approximate } from "@/components/location-picker";

const MAX_PHOTOS = 5;

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
        <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center">
          {n}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function PublicarPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [roomPhotos, setRoomPhotos] = useState<File[]>([]);
  const [homePhotos, setHomePhotos] = useState<File[]>([]);
  const [location, setLocation] = useState<PickedLocation | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    location_city: "",
    location_zone: "",
    room_type: "privada",
    gender_pref: "cualquiera",
    phone: "",
    has_planta: false,
    has_agua: false,
    has_wifi: false,
    has_ac: false,
    accepts_crypto: false,
    owner_direct: false,
    includes_services: false,
  });

  const inputCls =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-base sm:text-sm bg-white text-ink placeholder-muted/60 " +
    "focus:outline-none focus:ring-2 focus:ring-primary/30 mt-1";

  function update(key: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (roomPhotos.length === 0) {
      setError("Agrega al menos una foto de la habitación — los anuncios con fotos reciben muchos más mensajes.");
      return;
    }
    if (!location) {
      setError("Marca la ubicación en el mapa (puede ser aproximada).");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const total = roomPhotos.length + homePhotos.length;
      let done = 0;
      const tick = () => setProgress(`Subiendo fotos ${++done}/${total}…`);
      const upload = (f: File, folder: "rooms" | "homes") =>
        uploadPhoto(f, folder).then((url) => (tick(), url));

      const [roomUrls, homeUrls] = await Promise.all([
        Promise.all(roomPhotos.map((f) => upload(f, "rooms"))),
        Promise.all(homePhotos.map((f) => upload(f, "homes"))),
      ]);
      setProgress("Publicando…");

      // Si es aproximada, solo se guarda el punto redondeado
      const coords = location.exact
        ? { lat: location.lat, lng: location.lng }
        : approximate(location.lat, location.lng);

      await createRoom({
        ...form,
        price: Number(form.price),
        currency: "USD",
        room_type: form.room_type as "privada" | "compartida",
        gender_pref: form.gender_pref as "cualquiera" | "solo_mujeres" | "solo_hombres",
        available_from: null,
        photos: roomUrls,
        home_photos: homeUrls,
        latitude: coords.lat,
        longitude: coords.lng,
        location_exact: location.exact,
      });
      setSubmitted(true);
    } catch {
      setError("No se pudo publicar. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setSubmitting(false);
      setProgress("");
    }
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center mx-auto">
          <Check size={28} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold text-ink">Habitación publicada</h1>
        <p className="text-muted text-sm">
          Tu anuncio está activo. Las personas interesadas te contactarán
          directamente por WhatsApp.
        </p>
        <Link href="/" className="inline-block text-sm font-medium text-primary hover:underline">
          Ver mi anuncio en Rumi
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
        <h1 className="text-2xl font-bold text-ink">Publicar habitación</h1>
        <p className="text-sm text-muted mt-1">
          Gratis, en 3 minutos. Las personas te escriben directo por WhatsApp.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Fotos */}
        <Section n={1} title="Fotos">
          <PhotoPicker
            label="La habitación"
            hint="Con buena luz natural. La primera será la portada."
            files={roomPhotos}
            onChange={setRoomPhotos}
            max={MAX_PHOTOS}
            required
          />
          <PhotoPicker
            label="La casa / áreas comunes"
            hint="Sala, cocina, baño, fachada… Genera confianza."
            files={homePhotos}
            onChange={setHomePhotos}
            max={MAX_PHOTOS}
          />
        </Section>

        {/* 2. Detalles */}
        <Section n={2} title="Detalles">
          <div>
            <label className="text-sm font-medium text-ink">Título del anuncio</label>
            <input
              type="text"
              required
              placeholder="Ej: Habitación amueblada en Chacao"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink">Descripción</label>
            <textarea
              required
              rows={4}
              placeholder="La habitación, la casa, quién vive ahí, reglas (visitas, mascotas, fumar)…"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className={inputCls + " resize-none"}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Precio/mes (USD)</label>
              <input
                type="number"
                inputMode="numeric"
                required
                min={1}
                placeholder="150"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Tipo</label>
              <select
                value={form.room_type}
                onChange={(e) => update("room_type", e.target.value)}
                className={inputCls}
              >
                <option value="privada">Privada</option>
                <option value="compartida">Compartida</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ink">¿Para quién?</label>
            <select
              value={form.gender_pref}
              onChange={(e) => update("gender_pref", e.target.value)}
              className={inputCls}
            >
              <option value="cualquiera">Cualquiera</option>
              <option value="solo_mujeres">Solo mujeres</option>
              <option value="solo_hombres">Solo hombres</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-ink mb-2 block">
              Servicios y características
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: "has_planta", label: "Planta eléctrica" },
                { key: "has_agua", label: "Agua 24h" },
                { key: "has_wifi", label: "WiFi incluido" },
                { key: "has_ac", label: "Aire acondicionado" },
                { key: "accepts_crypto", label: "Acepta crypto" },
                { key: "includes_services", label: "Servicios incluidos" },
                { key: "owner_direct", label: "Soy el dueño" },
              ].map(({ key, label }) => {
                const on = form[key as keyof typeof form] as boolean;
                return (
                  <label
                    key={key}
                    className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                      on
                        ? "bg-primary/5 border-primary/30 text-primary"
                        : "border-gray-200 text-ink/60 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={(e) => update(key, e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        on ? "bg-primary border-primary" : "border-gray-300"
                      }`}
                    >
                      {on && <Check size={10} className="text-white" />}
                    </div>
                    {label}
                  </label>
                );
              })}
            </div>
          </div>
        </Section>

        {/* 3. Ubicación */}
        <Section n={3} title="Ubicación">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-ink">Ciudad</label>
              <select
                required
                value={form.location_city}
                onChange={(e) => update("location_city", e.target.value)}
                className={inputCls}
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
              <label className="text-sm font-medium text-ink">Zona / Urb.</label>
              <input
                type="text"
                required
                placeholder="Ej: Chacao"
                value={form.location_zone}
                onChange={(e) => update("location_zone", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <LocationPicker city={form.location_city} value={location} onChange={setLocation} />
        </Section>

        {/* 4. Contacto */}
        <Section n={4} title="Contacto">
          <div>
            <label className="text-sm font-medium text-ink">WhatsApp (con código de país)</label>
            <input
              type="tel"
              required
              placeholder="+584141234567"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputCls}
            />
          </div>
        </Section>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-60"
        >
          {submitting ? progress || "Publicando…" : "Publicar gratis"}
        </button>
      </form>
    </div>
  );
}
