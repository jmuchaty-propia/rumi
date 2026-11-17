-- Contacto privado: los teléfonos dejan de ser públicos.
-- Quien busca se POSTULA a una habitación; quien publica puede INVITAR a quien busca.
-- Cada anuncio/perfil tiene un owner_token secreto que abre su panel privado
-- (no hay login todavía: el link privado hace de "cuenta").

-- 1. Condiciones del anuncio + token + activo/pausado
ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS owner_token UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS smoking_allowed BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allowed_occupations TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS min_stay_months INTEGER
    CHECK (min_stay_months IS NULL OR min_stay_months BETWEEN 1 AND 36),
  ADD COLUMN IF NOT EXISTS deposit_months INTEGER NOT NULL DEFAULT 1
    CHECK (deposit_months BETWEEN 0 AND 6),
  ADD COLUMN IF NOT EXISTS advance_months INTEGER NOT NULL DEFAULT 1
    CHECK (advance_months BETWEEN 0 AND 6),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS rooms_owner_token_idx ON rooms (owner_token);

ALTER TABLE seekers
  ADD COLUMN IF NOT EXISTS owner_token UUID NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS smoker BOOLEAN,
  ADD COLUMN IF NOT EXISTS stay_months INTEGER
    CHECK (stay_months IS NULL OR stay_months BETWEEN 1 AND 36),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_initial TEXT
    GENERATED ALWAYS AS (upper(left(btrim(last_name), 1))) STORED;

CREATE UNIQUE INDEX IF NOT EXISTS seekers_owner_token_idx ON seekers (owner_token);

-- 2. Lectura pública SIN teléfono, token ni apellido completo
REVOKE SELECT ON rooms FROM anon, authenticated;
GRANT SELECT (
  id, title, description, price, currency, location_city, location_zone,
  room_type, gender_pref, available_from, photos, home_photos,
  latitude, longitude, location_exact,
  has_planta, has_agua, has_wifi, has_ac, accepts_crypto, owner_direct,
  verified, includes_services, is_demo,
  smoking_allowed, allowed_occupations, min_stay_months,
  deposit_months, advance_months, is_active, created_at, updated_at
) ON rooms TO anon, authenticated;

REVOKE SELECT ON seekers FROM anon, authenticated;
GRANT SELECT (
  id, name, last_initial, age, gender, occupation_type, occupation, bio,
  budget_min, budget_max, currency, preferred_city, preferred_zones,
  move_in_date, avatar_url, smoker, stay_months,
  verified, is_demo, is_active, created_at, updated_at
) ON seekers TO anon, authenticated;

-- Solo se listan anuncios/perfiles activos
DROP POLICY IF EXISTS "Rooms are publicly readable" ON rooms;
CREATE POLICY "Active rooms are publicly readable" ON rooms FOR SELECT USING (is_active);
DROP POLICY IF EXISTS "Seekers are publicly readable" ON seekers;
CREATE POLICY "Active seekers are publicly readable" ON seekers FOR SELECT USING (is_active);

-- Nadie anónimo puede editar/borrar directo (se hace vía funciones con token)
REVOKE UPDATE, DELETE ON rooms, seekers FROM anon, authenticated;

-- 3. Postulaciones (buscador -> habitación)
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age BETWEEN 18 AND 99),
  gender TEXT CHECK (gender IN ('masculino', 'femenino', 'prefiero_no_decir')),
  occupation_type TEXT NOT NULL CHECK (occupation_type IN ('trabajador', 'estudiante', 'otro')),
  occupation TEXT,
  smoker BOOLEAN NOT NULL,
  stay_months INTEGER CHECK (stay_months IS NULL OR stay_months BETWEEN 1 AND 36),
  move_in_date DATE,
  message TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'aceptada', 'rechazada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS applications_room_idx ON applications (room_id, created_at DESC);
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON applications FROM anon, authenticated;
GRANT INSERT ON applications TO anon, authenticated;
CREATE POLICY "Anyone can apply to an active real room"
  ON applications FOR INSERT WITH CHECK (
    status = 'pendiente'
    AND EXISTS (SELECT 1 FROM rooms r WHERE r.id = room_id AND r.is_active AND NOT r.is_demo)
  );

-- 4. Invitaciones (dueño -> buscador)
CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seeker_id UUID NOT NULL REFERENCES seekers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  room_url TEXT,
  price NUMERIC CHECK (price IS NULL OR price >= 0),
  zone TEXT,
  phone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente', 'aceptada', 'rechazada')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS invitations_seeker_idx ON invitations (seeker_id, created_at DESC);
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON invitations FROM anon, authenticated;
GRANT INSERT ON invitations TO anon, authenticated;
CREATE POLICY "Anyone can invite an active real seeker"
  ON invitations FOR INSERT WITH CHECK (
    status = 'pendiente'
    AND EXISTS (SELECT 1 FROM seekers s WHERE s.id = seeker_id AND s.is_active AND NOT s.is_demo)
  );

-- 5. Paneles privados (por token)
CREATE OR REPLACE FUNCTION get_room_panel(p_token UUID) RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT json_build_object(
    'room', to_jsonb(r) - 'owner_token',
    'applications', COALESCE((
      SELECT json_agg(a ORDER BY a.created_at DESC)
      FROM public.applications a WHERE a.room_id = r.id
    ), '[]'::json)
  )
  FROM public.rooms r WHERE r.owner_token = p_token;
$$;

CREATE OR REPLACE FUNCTION set_application_status(p_token UUID, p_id UUID, p_status TEXT)
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  UPDATE public.applications a SET status = p_status
  FROM public.rooms r
  WHERE a.id = p_id AND a.room_id = r.id AND r.owner_token = p_token;
$$;

CREATE OR REPLACE FUNCTION set_room_active(p_token UUID, p_active BOOLEAN)
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  UPDATE public.rooms SET is_active = p_active WHERE owner_token = p_token;
$$;

CREATE OR REPLACE FUNCTION get_seeker_panel(p_token UUID) RETURNS JSON
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT json_build_object(
    'seeker', to_jsonb(s) - 'owner_token',
    'invitations', COALESCE((
      SELECT json_agg(i ORDER BY i.created_at DESC)
      FROM public.invitations i WHERE i.seeker_id = s.id
    ), '[]'::json)
  )
  FROM public.seekers s WHERE s.owner_token = p_token;
$$;

CREATE OR REPLACE FUNCTION set_invitation_status(p_token UUID, p_id UUID, p_status TEXT)
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  UPDATE public.invitations i SET status = p_status
  FROM public.seekers s
  WHERE i.id = p_id AND i.seeker_id = s.id AND s.owner_token = p_token;
$$;

CREATE OR REPLACE FUNCTION set_seeker_active(p_token UUID, p_active BOOLEAN)
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  UPDATE public.seekers SET is_active = p_active WHERE owner_token = p_token;
$$;

REVOKE EXECUTE ON FUNCTION get_room_panel, set_application_status, set_room_active,
  get_seeker_panel, set_invitation_status, set_seeker_active FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_room_panel, set_application_status, set_room_active,
  get_seeker_panel, set_invitation_status, set_seeker_active TO anon, authenticated;

-- Condiciones de ejemplo en los anuncios demo
UPDATE rooms SET smoking_allowed = false, min_stay_months = 6 WHERE is_demo AND title LIKE '%Chacao%';
UPDATE rooms SET smoking_allowed = false, allowed_occupations = '{trabajador}' WHERE is_demo AND title LIKE '%Palos Grandes%';
UPDATE rooms SET allowed_occupations = '{estudiante}', min_stay_months = 6, deposit_months = 0 WHERE is_demo AND title LIKE '%Baruta%';
UPDATE rooms SET min_stay_months = 12, deposit_months = 2 WHERE is_demo AND title LIKE '%Lechería%';
UPDATE rooms SET allowed_occupations = '{estudiante}', smoking_allowed = false WHERE is_demo AND title LIKE '%Naguanagua%';
UPDATE seekers SET smoker = false, stay_months = 12 WHERE is_demo;
