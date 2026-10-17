import { SeekerProfile } from "@/lib/types";
import { ShieldCheck, MapPin, Calendar, User } from "lucide-react";

export function SeekerCard({ seeker }: { seeker: SeekerProfile }) {
  const whatsappUrl = `https://wa.me/${seeker.phone.replace(/\+/g, "")}?text=${encodeURIComponent(
    `Hola ${seeker.name}, vi tu perfil en Rumi buscando habitación. Tengo algo que podría interesarte.`
  )}`;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 hover:border-gray-200 transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-primary-light/50 flex items-center justify-center shrink-0">
          <User size={20} className="text-primary" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-ink truncate">{seeker.name}</h3>
            {seeker.verified && (
              <ShieldCheck size={14} className="text-primary shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted">{seeker.occupation}</p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-ink/70 leading-relaxed">{seeker.bio}</p>

      {/* Details */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        <span className="inline-flex items-center gap-1">
          <MapPin size={13} />
          {seeker.preferred_city}
        </span>
        {seeker.move_in_date && (
          <span className="inline-flex items-center gap-1">
            <Calendar size={13} />
            {new Date(seeker.move_in_date).toLocaleDateString("es-VE", {
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      {/* Budget + zones */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-primary">
          ${seeker.budget_min}–${seeker.budget_max}/mes
        </span>
        <div className="flex flex-wrap gap-1 justify-end">
          {seeker.preferred_zones.slice(0, 3).map((zone) => (
            <span
              key={zone}
              className="text-xs px-2 py-0.5 bg-gray-100 text-ink/60 rounded"
            >
              {zone}
            </span>
          ))}
        </div>
      </div>

      {/* WhatsApp CTA */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 bg-whatsapp hover:bg-whatsapp/90 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.638l4.67-1.388A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.239 0-4.308-.724-5.994-1.952a.5.5 0 00-.404-.078l-3.29.978.892-3.156a.5.5 0 00-.062-.425A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z" />
        </svg>
        Ofrecer habitación
      </a>
    </div>
  );
}
