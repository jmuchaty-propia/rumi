// Datos guardados en el teléfono del usuario (sin login todavía).
// Todo va en try/catch: el almacenamiento puede no estar disponible.

export interface SavedPanel {
  kind: "room" | "seeker";
  token: string;
  title: string;
  created_at: string;
}

const PANELS_KEY = "rumi:panels";
const PROFILE_KEY = "rumi:my-profile";

export function getSavedPanels(): SavedPanel[] {
  try {
    return JSON.parse(localStorage.getItem(PANELS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function savePanel(p: Omit<SavedPanel, "created_at">) {
  try {
    const list = getSavedPanels().filter((x) => x.token !== p.token);
    list.unshift({ ...p, created_at: new Date().toISOString() });
    localStorage.setItem(PANELS_KEY, JSON.stringify(list.slice(0, 20)));
  } catch {
    /* ignore */
  }
}

export function panelUrl(p: Pick<SavedPanel, "kind" | "token">) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/${p.kind === "room" ? "panel" : "perfil"}/${p.token}`;
}

/** Perfil de quien busca, para no reescribirlo en cada postulación */
export interface MyProfile {
  name: string;
  last_name: string;
  age: string;
  gender: string;
  occupation_type: string;
  occupation: string;
  smoker: "si" | "no" | "";
  stay_months: string;
  phone: string;
  avatar_url?: string | null;
}

export function getMyProfile(): Partial<MyProfile> {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function saveMyProfile(p: Partial<MyProfile>) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...getMyProfile(), ...p }));
  } catch {
    /* ignore */
  }
}
