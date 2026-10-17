-- Datos iniciales (antes en src/lib/mock-data.ts)

INSERT INTO rooms (title, description, price, currency, location_city, location_zone, room_type, gender_pref, available_from, phone, has_planta, has_agua, has_wifi, has_ac, accepts_crypto, owner_direct, verified, includes_services, created_at) VALUES
('Habitación amueblada en Chacao',
 'Habitación privada en apartamento compartido, cerca del metro Chacao. Incluye cama, escritorio y closet. Baño compartido. Ambiente tranquilo, ideal para profesionales.',
 150, 'USD', 'Caracas', 'Chacao', 'privada', 'cualquiera', '2026-11-01', '+584141234567',
 true, true, true, false, true, true, true, true, '2026-10-10'),
('Cuarto amplio en Los Palos Grandes',
 'Habitación grande con baño privado en casa de familia. Zona segura, cerca de centros comerciales y transporte. Se admiten mascotas pequeñas.',
 200, 'USD', 'Caracas', 'Los Palos Grandes', 'privada', 'solo_mujeres', '2026-10-20', '+584249876543',
 true, true, true, true, false, true, false, true, '2026-10-08'),
('Habitación compartida económica en Baruta',
 'Habitación compartida (2 personas) en apartamento estudiantil. Muy cerca de la USB y la UCAB. Internet rápido, ideal para estudiantes.',
 80, 'USD', 'Caracas', 'Baruta', 'compartida', 'solo_hombres', '2026-11-15', '+584161112233',
 false, true, true, false, true, false, true, false, '2026-10-12'),
('Suite independiente en Lechería',
 'Mini-suite con entrada independiente, baño privado y cocineta. Urbanización cerrada con vigilancia 24h. Planta y cisterna. Ideal para parejas o profesionales.',
 250, 'USD', 'Lechería', 'El Morro', 'privada', 'cualquiera', '2026-10-25', '+584121234000',
 true, true, true, true, true, true, true, true, '2026-10-11'),
('Cuarto en Naguanagua cerca de la UC',
 'Habitación en casa de familia, incluye comida. A 10 min caminando de la Universidad de Carabobo. Ambiente familiar y seguro.',
 100, 'USD', 'Valencia', 'Naguanagua', 'privada', 'cualquiera', '2026-11-01', '+584145556677',
 false, true, true, false, false, true, false, true, '2026-10-09');

INSERT INTO seekers (name, age, occupation, bio, budget_min, budget_max, currency, preferred_city, preferred_zones, move_in_date, gender, phone, verified, created_at) VALUES
('María G.', 24, 'Diseñadora gráfica',
 'Busco cuarto en Caracas, soy tranquila y ordenada. Trabajo remoto. No fumo.',
 100, 180, 'USD', 'Caracas', ARRAY['Chacao', 'Altamira', 'Los Palos Grandes'], '2026-11-01', 'Mujer', '+584149990011', true, '2026-10-11'),
('Carlos R.', 22, 'Estudiante de Ingeniería (USB)',
 'Estudiante de último semestre buscando cuarto cerca de la USB o Baruta. Presupuesto ajustado pero responsable con pagos.',
 60, 100, 'USD', 'Caracas', ARRAY['Baruta', 'El Cafetal', 'Chuao'], '2026-10-20', 'Hombre', '+584241112200', true, '2026-10-10'),
('Andrea M.', 28, 'Abogada',
 'Profesional recién mudada a Valencia por trabajo. Busco algo tranquilo y con buen internet para trabajar desde casa algunos días.',
 120, 200, 'USD', 'Valencia', ARRAY['Prebo', 'Trigal', 'Naguanagua'], '2026-11-15', 'Mujer', '+584165553344', false, '2026-10-12'),
('Luis P.', 30, 'Desarrollador web (remoto)',
 'Trabajo remoto full-time. Necesito buen wifi y un espacio tranquilo. Puedo pagar en crypto o USD. Limpio y respetuoso.',
 150, 250, 'USD', 'Caracas', ARRAY['Chacao', 'Las Mercedes', 'Altamira'], '2026-10-25', 'Hombre', '+584127778899', true, '2026-10-09');
