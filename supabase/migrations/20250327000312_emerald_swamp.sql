/*
  # Add example reservations

  1. New Data
    - Adds 5 example reservations with different statuses and dates
    - Includes contact information and descriptions
    - Creates laptop assignments for approved reservations

  2. Data Structure
    - Reservations have realistic dates and times
    - Contact details follow consistent format
    - Descriptions reflect actual use cases
*/

-- Add example reservations
INSERT INTO reservations (
  contact_name,
  contact_email,
  contact_phone,
  start_date,
  start_time,
  end_date,
  end_time,
  quantity,
  description,
  status,
  processed_date,
  reason
)
VALUES
  (
    'Emma van der Berg',
    'emma.vdberg@example.com',
    '06-12345678',
    '2025-04-01',
    '09:00',
    '2025-04-01',
    '17:00',
    15,
    'Workshop digitale vaardigheden voor beginners. We hebben laptops nodig met Microsoft Office en een stabiele internetverbinding.',
    'pending',
    NULL,
    NULL
  ),
  (
    'Thomas de Vries',
    'thomas.devries@example.com',
    '06-23456789',
    '2025-04-03',
    '13:00',
    '2025-04-03',
    '16:00',
    8,
    'Cursus basis programmeren voor jongeren. Visual Studio Code moet geïnstalleerd zijn.',
    'approved',
    '2025-03-26 14:30:00',
    NULL
  ),
  (
    'Sophie Bakker',
    'sophie.b@example.com',
    '06-34567890',
    '2025-04-05',
    '10:00',
    '2025-04-05',
    '15:00',
    12,
    'Taalcursus met gebruik van Duolingo en andere online leermiddelen.',
    'rejected',
    '2025-03-26 15:45:00',
    'Onvoldoende laptops beschikbaar op de gewenste datum'
  ),
  (
    'Lucas Jansen',
    'l.jansen@example.com',
    '06-45678901',
    '2025-04-08',
    '14:00',
    '2025-04-08',
    '17:00',
    10,
    'Workshop fotobewerking met GIMP. Laptops moeten minimaal 8GB RAM hebben.',
    'pending',
    NULL,
    NULL
  ),
  (
    'Maria Visser',
    'maria.visser@example.com',
    '06-56789012',
    '2025-04-10',
    '09:30',
    '2025-04-10',
    '12:30',
    6,
    'Online sollicitatietraining. We hebben laptops nodig met webcam en Microsoft Teams.',
    'approved',
    '2025-03-26 16:15:00',
    NULL
  );

-- Assign laptops to approved reservations
WITH approved_reservations AS (
  SELECT id FROM reservations WHERE status = 'approved'
),
available_laptops AS (
  SELECT id FROM laptops WHERE status = 'beschikbaar' LIMIT 3
)
INSERT INTO laptop_assignments (reservation_id, laptop_id)
SELECT 
  r.id,
  l.id
FROM approved_reservations r
CROSS JOIN available_laptops l;