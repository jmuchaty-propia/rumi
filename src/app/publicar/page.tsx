"use client";

import { useState } from "react";
import { ArrowLeft, Check, Lock } from "lucide-react";
import Link from "next/link";
import { createRoom, uploadPhoto } from "@/lib/queries";
import { CITIES, OccupationType, STAY_OPTIONS, moveInCost } from "@/lib/types";
import { Chips, PrivateLinkCard } from "@/components/form-bits";
import { panelUrl, savePanel } from "@/lib/local";
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

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const btn =
    "w-9 h-9 rounded-lg border border-gray-200 text-lg text-ink/70 hover:border-primary/40 disabled:opacity-30";
  return (
    <div>
      <label className="text-sm font-medium text-ink">{label}</label>
      <div className="flex items-center gap-3 mt-1">
        <button type="button" className={btn} disabled={value <= 0} onClick={() => onChange(value - 1)}>
          −
        </button>
        <span className="w-6 text-center font-semibold text-ink">{value}</span>
        <button type="button" className={btn} disabled={value >= 6} onClick={() => onChange(value + 1)}>
          +
        </button>
      </div>
    </div>
  );
}

export default function PublicarPage() {
  const [panelLink, setPanelLink] = useState("");
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
  // Condiciones
  const [noSmokers, setNoSmokers] = useState(false);
  const [occupations, setOccupations] = useState<OccupationType[]>([]);
  const [minStay, setMinStay] = useState("0");
  const [deposit, setDeposit] = useState(1);
  const [advance, setAdvance] = useState(1);

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

      const token = await createRoom({
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
        smoking_allowed: !noSmokers,
        allowed_occupations: occupations,
        min_stay_months: Number(minStay) || null,
        deposit_months: deposit,
        advance_months: advance,
      });
      savePanel({ kind: "room", token, title: form.title });
      setPanelLink(panelUrl({ kind: "room", token }));
    } catch {
      setError("No se pudo publicar. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setSubmitting(false);
      setProgress("");
    }
  }

  if (panelLink) {
    return (
      <PrivateLinkCard
        url={panelLink}
        phone={form.phone}
        title="¡Habitación publicada!"
        description="Las personas interesadas se postularán con su perfil. Tú decides a quién escribirle — tu WhatsApp no aparece en el anuncio."
      />
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
          Gratis, en 3 minutos. Los interesados se postulan y tú eliges a quién escribirle.
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

        {/* 4. Condiciones */}
        <Section n={4} title="Condiciones">
          <p className="text-xs text-muted -mt-2">
            Sirven de filtro: se muestran en el anuncio y verás si cada postulante las cumple.
          </p>

          <div>
            <label className="text-sm font-medium text-ink">¿Para quién?</label>
            <Chips
              options={[
                ["cualquiera", "Cualquiera"],
                ["solo_mujeres", "Solo mujeres"],
                ["solo_hombres", "Solo hombres"],
              ]}
              value={form.gender_pref}
              onChange={(v) => update("gender_pref", v)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink">Ocupación</label>
            <Chips
              options={[
                ["estudiante", "Solo estudiantes"],
                ["trabajador", "Solo trabajadores"],
              ]}
              value={occupations}
              onChange={(v) =>
                setOccupations((prev) => (prev.includes(v) ? [] : [v as OccupationType]))
              }
            />
            <p className="text-xs text-muted mt-1">Sin seleccionar = cualquiera</p>
          </div>

          <div>
            <label className="text-sm font-medium text-ink">Fumadores</label>
            <Chips
              options={[
                ["si", "Se permite fumar"],
                ["no", "No fumadores"],
              ]}
              value={noSmokers ? "no" : "si"}
              onChange={(v) => setNoSmokers(v === "no")}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ink">Estancia mínima</label>
            <Chips
              options={[
                ["0", "Sin mínimo"],
                ...STAY_OPTIONS.filter((o) => o.v > 1).map(
                  (o) => [String(o.v), o.label] as [string, string]
                ),
              ]}
              value={minStay}
              onChange={setMinStay}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Stepper label="Meses de depósito" value={deposit} onChange={setDeposit} />
            <Stepper label="Meses adelantados" value={advance} onChange={setAdvance} />
          </div>
          {Number(form.price) > 0 && (
            <p className="text-sm text-ink bg-rumi-soft rounded-lg px-3 py-2">
              Para mudarse:{" "}
              <span className="font-bold text-primary">
                ${moveInCost({ price: Number(form.price), deposit_months: deposit, advance_months: advance })}
              </span>
            </p>
          )}
        </Section>

        {/* 5. Contacto */}
        <Section n={5} title="Contacto">
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
            <p className="text-xs text-muted mt-1 inline-flex items-center gap-1">
              <Lock size={12} />
              No se muestra en el anuncio. Te llega el link de tu panel aquí.
            </p>
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
