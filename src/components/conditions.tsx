import { CigaretteOff, GraduationCap, Briefcase, CalendarClock, Wallet, Users } from "lucide-react";
import { OCCUPATION_PLURAL, Room, moveInCost, stayLabel } from "@/lib/types";

/** Lista de condiciones del dueño + lo que cuesta mudarse */
export function RoomConditions({ room }: { room: Room }) {
  const items: { icon: React.ElementType; text: string }[] = [];
  if (!room.smoking_allowed) items.push({ icon: CigaretteOff, text: "No fumadores" });
  if (room.allowed_occupations.length > 0) {
    const onlyStudents =
      room.allowed_occupations.length === 1 && room.allowed_occupations[0] === "estudiante";
    items.push({
      icon: onlyStudents ? GraduationCap : Briefcase,
      text: "Solo " + room.allowed_occupations.map((o) => OCCUPATION_PLURAL[o]).join(" o "),
    });
  }
  if (room.gender_pref !== "cualquiera")
    items.push({
      icon: Users,
      text: room.gender_pref === "solo_mujeres" ? "Solo mujeres" : "Solo hombres",
    });
  items.push({
    icon: CalendarClock,
    text: room.min_stay_months
      ? `Estancia mínima: ${stayLabel(room.min_stay_months)}`
      : "Sin estancia mínima",
  });

  const parts = [
    room.deposit_months > 0 &&
      `${room.deposit_months} ${room.deposit_months === 1 ? "mes" : "meses"} de depósito`,
    room.advance_months > 0 &&
      `${room.advance_months} ${room.advance_months === 1 ? "mes" : "meses"} adelantado`,
  ].filter(Boolean);

  return (
    <div className="space-y-3">
      <div className="bg-rumi-soft rounded-xl p-4 flex items-start gap-3">
        <Wallet size={20} className="text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-ink">
            Para mudarte: <span className="font-bold text-primary">${moveInCost(room)}</span>
          </p>
          <p className="text-xs text-muted">
            {parts.length ? parts.join(" + ") : "Sin depósito ni adelanto"}
          </p>
        </div>
      </div>
      <ul className="grid grid-cols-1 gap-1.5">
        {items.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2 text-sm text-ink/80">
            <Icon size={16} className="text-primary shrink-0" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Versión compacta para la tarjeta */
export function ConditionTags({ room }: { room: Room }) {
  const tags: string[] = [];
  if (!room.smoking_allowed) tags.push("🚭 No fumadores");
  if (room.allowed_occupations.length === 1)
    tags.push(room.allowed_occupations[0] === "estudiante" ? "🎓 Estudiantes" : "💼 Trabajadores");
  if (room.min_stay_months) tags.push(`📅 Mín. ${stayLabel(room.min_stay_months)}`);
  if (tags.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span key={t} className="text-xs text-ink/70 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
          {t}
        </span>
      ))}
    </div>
  );
}
