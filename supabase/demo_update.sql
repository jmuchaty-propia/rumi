-- Anuncios y perfiles de ejemplo: fotos, ubicación y marca is_demo.
-- Bórralos cuando haya suficientes anuncios reales:
--   DELETE FROM rooms WHERE is_demo; DELETE FROM seekers WHERE is_demo;
UPDATE rooms SET is_demo = true, location_exact = false, latitude = v.lat, longitude = v.lng,
  photos = v.photos, home_photos = v.home
FROM (VALUES
 ('Habitación amueblada en Chacao', 10.495, -66.855,
   ARRAY['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=75','https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1200&q=75'],
   ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=75','https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=75','https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=75']),
 ('Cuarto amplio en Los Palos Grandes', 10.500, -66.845,
   ARRAY['https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200&q=75'],
   ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=75','https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=75']),
 ('Habitación compartida económica en Baruta', 10.430, -66.875,
   ARRAY['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=75'],
   ARRAY['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=75']),
 ('Suite independiente en Lechería', 10.185, -64.695,
   ARRAY['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=75','https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=75'],
   ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=75']),
 ('Cuarto en Naguanagua cerca de la UC', 10.275, -68.005,
   ARRAY['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=75'],
   ARRAY['https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=75','https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=75'])
) AS v(title, lat, lng, photos, home)
WHERE rooms.title = v.title;

UPDATE seekers SET is_demo = true, name = v.first, last_name = v.last,
  gender = v.gender, occupation_type = v.occ, avatar_url = v.avatar
FROM (VALUES
 ('María G.', 'María', 'González', 'femenino', 'trabajador', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=75'),
 ('Carlos R.', 'Carlos', 'Rodríguez', 'masculino', 'estudiante', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=75'),
 ('Andrea M.', 'Andrea', 'Martínez', 'femenino', 'trabajador', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=75'),
 ('Luis P.', 'Luis', 'Pérez', 'masculino', 'trabajador', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=75')
) AS v(old, first, last, gender, occ, avatar)
WHERE seekers.name = v.old;
