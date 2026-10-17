-- Rumi MVP schema: rooms + seekers, public read/insert (no auth yet), photo bucket.

CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'VES')),
  location_city TEXT NOT NULL,
  location_zone TEXT NOT NULL,
  room_type TEXT NOT NULL CHECK (room_type IN ('privada', 'compartida')),
  gender_pref TEXT NOT NULL DEFAULT 'cualquiera' CHECK (gender_pref IN ('cualquiera', 'solo_mujeres', 'solo_hombres')),
  available_from DATE,
  phone TEXT NOT NULL,
  photos TEXT[] NOT NULL DEFAULT '{}',
  -- Filtros Venezuela
  has_planta BOOLEAN NOT NULL DEFAULT false,
  has_agua BOOLEAN NOT NULL DEFAULT false,
  has_wifi BOOLEAN NOT NULL DEFAULT false,
  has_ac BOOLEAN NOT NULL DEFAULT false,
  accepts_crypto BOOLEAN NOT NULL DEFAULT false,
  owner_direct BOOLEAN NOT NULL DEFAULT true,
  verified BOOLEAN NOT NULL DEFAULT false,
  includes_services BOOLEAN NOT NULL DEFAULT false,
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE seekers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER,
  occupation TEXT,
  bio TEXT NOT NULL,
  budget_min NUMERIC NOT NULL CHECK (budget_min >= 0),
  budget_max NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'VES')),
  preferred_city TEXT NOT NULL,
  preferred_zones TEXT[] NOT NULL DEFAULT '{}',
  move_in_date DATE,
  gender TEXT,
  phone TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (budget_max >= budget_min)
);

CREATE INDEX rooms_created_at_idx ON rooms (created_at DESC);
CREATE INDEX seekers_created_at_idx ON seekers (created_at DESC);

-- Keep updated_at current
CREATE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER rooms_set_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER seekers_set_updated_at BEFORE UPDATE ON seekers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS: lectura e inserción públicas (MVP sin auth). UPDATE/DELETE llegan con auth.
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE seekers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rooms are publicly readable"
  ON rooms FOR SELECT USING (true);

-- Anonymous inserts can't self-mark as verified
CREATE POLICY "Anyone can insert rooms"
  ON rooms FOR INSERT WITH CHECK (verified = false);

CREATE POLICY "Seekers are publicly readable"
  ON seekers FOR SELECT USING (true);

CREATE POLICY "Anyone can insert seekers"
  ON seekers FOR INSERT WITH CHECK (verified = false);

-- Storage: bucket público para fotos (5 MB, solo imágenes)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('room-photos', 'room-photos', true, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']);

CREATE POLICY "Anyone can upload room photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'room-photos');
