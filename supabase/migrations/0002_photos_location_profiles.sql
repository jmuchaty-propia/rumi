-- Fotos de la casa, ubicación en mapa (exacta/aproximada), perfil de buscador
-- completo y marca de anuncios de ejemplo.

ALTER TABLE rooms
  ADD COLUMN IF NOT EXISTS home_photos TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_exact BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE seekers
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS occupation_type TEXT
    CHECK (occupation_type IN ('trabajador', 'estudiante', 'otro')),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

-- La edad mínima para crear perfil es 18
ALTER TABLE seekers
  ADD CONSTRAINT seekers_age_adult CHECK (age IS NULL OR age BETWEEN 18 AND 99);

-- Los inserts anónimos no pueden marcarse como verificados ni como ejemplo
DROP POLICY IF EXISTS "Anyone can insert rooms" ON rooms;
CREATE POLICY "Anyone can insert rooms"
  ON rooms FOR INSERT WITH CHECK (verified = false AND is_demo = false);

DROP POLICY IF EXISTS "Anyone can insert seekers" ON seekers;
CREATE POLICY "Anyone can insert seekers"
  ON seekers FOR INSERT WITH CHECK (verified = false AND is_demo = false);
