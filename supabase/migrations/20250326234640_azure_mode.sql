/*
  # Initial database schema

  1. New Tables
    - `laptops`
      - `id` (uuid, primary key)
      - `computer_name` (text)
      - `cpu` (text)
      - `ram` (text)
      - `gpu` (text)
      - `software_version` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `laptop_problems`
      - `id` (uuid, primary key)
      - `laptop_id` (uuid, foreign key)
      - `description` (text)
      - `reporter_name` (text)
      - `reporter_email` (text)
      - `resolver_name` (text, nullable)
      - `status` (text)
      - `repair_details` (text, nullable)
      - `date_reported` (timestamptz)
      - `date_resolved` (timestamptz, nullable)

    - `laptop_remarks`
      - `id` (uuid, primary key)
      - `laptop_id` (uuid, foreign key)
      - `content` (text)
      - `created_at` (timestamptz)

    - `reservations`
      - `id` (uuid, primary key)
      - `contact_name` (text)
      - `contact_email` (text)
      - `contact_phone` (text)
      - `start_date` (date)
      - `start_time` (time)
      - `end_date` (date)
      - `end_time` (time)
      - `quantity` (integer)
      - `description` (text)
      - `status` (text)
      - `processed_date` (timestamptz, nullable)
      - `reason` (text, nullable)
      - `created_at` (timestamptz)

    - `laptop_assignments`
      - `id` (uuid, primary key)
      - `reservation_id` (uuid, foreign key)
      - `laptop_id` (uuid, foreign key)
      - `created_at` (timestamptz)

    - `advice_requests`
      - `id` (uuid, primary key)
      - `type` (text)
      - `description` (text)
      - `requirements` (text[])
      - `additional_notes` (text)
      - `status` (text)
      - `rejection_reason` (text, nullable)
      - `created_at` (timestamptz)
      - `processed_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to perform CRUD operations
*/

-- Create laptops table
CREATE TABLE laptops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  computer_name text NOT NULL,
  cpu text NOT NULL,
  ram text NOT NULL,
  gpu text NOT NULL,
  software_version text NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create laptop_problems table
CREATE TABLE laptop_problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  laptop_id uuid REFERENCES laptops(id) ON DELETE CASCADE,
  description text NOT NULL,
  reporter_name text NOT NULL,
  reporter_email text NOT NULL,
  resolver_name text,
  status text NOT NULL,
  repair_details text,
  date_reported timestamptz NOT NULL DEFAULT now(),
  date_resolved timestamptz
);

-- Create laptop_remarks table
CREATE TABLE laptop_remarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  laptop_id uuid REFERENCES laptops(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create reservations table
CREATE TABLE reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  start_date date NOT NULL,
  start_time time NOT NULL,
  end_date date NOT NULL,
  end_time time NOT NULL,
  quantity integer NOT NULL,
  description text NOT NULL,
  status text NOT NULL,
  processed_date timestamptz,
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Create laptop_assignments table
CREATE TABLE laptop_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE,
  laptop_id uuid REFERENCES laptops(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(reservation_id, laptop_id)
);

-- Create advice_requests table
CREATE TABLE advice_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  description text NOT NULL,
  requirements text[] NOT NULL DEFAULT '{}',
  additional_notes text,
  status text NOT NULL,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

-- Enable Row Level Security
ALTER TABLE laptops ENABLE ROW LEVEL SECURITY;
ALTER TABLE laptop_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE laptop_remarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE laptop_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE advice_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all access for authenticated users" ON laptops
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON laptop_problems
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON laptop_remarks
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON reservations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON laptop_assignments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON advice_requests
  FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for laptops table
CREATE TRIGGER update_laptops_updated_at
    BEFORE UPDATE ON laptops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();