import { OCCUPATION_LABELS, SeekerProfile, displayName } from "@/lib/types";
import { ShieldCheck, MapPin, User, Briefcase, GraduationCap } from "lucide-react";
import { SafeImg, WhatsAppIcon } from "./ui";

export function SeekerCard({ seeker }: { seeker: SeekerProfile }) {
  const name = displayName(seeker);
  const whatsappUrl = `https://wa.me/${seeker.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hola ${seeker.name}, vi tu perfil en Rumi buscando habitación. Tengo algo que podría interesarte.`
  )}`;
  const budget =
    seeker.budget_min === seeker.budget_max
      ? `~$${seeker.budget_max}/mes`
      : `$${seeker.budget_min}–${seeker.budget_max}/mes`;
  const OccIcon = seeker.occupation_type === "estudiante" ? GraduationCap : Briefcase;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 hover:border-gray-200 transition-colors">
      <div className="flex items-start gap-3">
        {seeker.avatar_url ? (
          <SafeImg
            src={seeker.avatar_url}
            alt={name}
            fallbackIcon={false}
            className="w-14 h-14 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-primary-light/50 flex items-center justify-center shrink-0">
            <User size={22} className="text-primary" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-ink truncate">
              {name}
              {seeker.age ? <span className="font-normal text-muted">, {seeker.age}</span> : null}
            </h3>
            {seeker.verified && <ShieldCheck size={14} className="text-primary shrink-0" />}
          </div>
          {(seeker.occupation_type || seeker.occupation) && (
            <p className="text-sm text-muted flex items-center gap-1 truncate">
              <OccIcon size={13} className="shrink-0" />
              {seeker.occupation ||
                (seeker.occupation_type && OCCUPATION_LABELS[seeker.occupation_type])}
            </p>
          )}
          <p className="text-sm font-semibold text-primary mt-0.5">{budget}</p>
        </div>
      </div>

      {seeker.bio && <p className="text-sm text-ink/70 leading-relaxed line-clamp-3">{seeker.bio}</p>}

      <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
        <span className="inline-flex items-center gap-1 mr-1">
          <MapPin size={13} />
          {seeker.preferred_city}
        </span>
        {seeker.preferred_zones.slice(0, 3).map((zone) => (
          <span key={zone} className="text-xs px-2 py-0.5 bg-gray-100 text-ink/60 rounded">
            {zone}
          </span>
        ))}
      </div>

      {seeker.is_demo ? (
        <div className="w-full py-2.5 text-center text-xs font-medium text-muted bg-gray-50 rounded-lg">
          Perfil de ejemplo
        </div>
      ) : (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-whatsapp hover:bg-whatsapp/90 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <WhatsAppIcon />
          Ofrecer habitación
        </a>
      )}
    </div>
  );
}
