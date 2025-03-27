/*
  # Add sample laptops

  1. New Data
    - Adds three sample laptops with different specifications
    - Each laptop has a different status and configuration
*/

INSERT INTO laptops (computer_name, cpu, ram, gpu, software_version, status)
VALUES 
  (
    'Dell XPS 15',
    'Intel Core i9-13900H',
    '32GB DDR5-4800',
    'NVIDIA RTX 4070',
    'Windows 11 Pro 22H2',
    'beschikbaar'
  ),
  (
    'MacBook Pro 16',
    'Apple M2 Pro',
    '32GB Unified Memory',
    'Apple M2 Pro 19-core',
    'macOS Sonoma 14.3',
    'beschikbaar'
  ),
  (
    'Lenovo ThinkPad P1',
    'Intel Core i7-13800H',
    '16GB DDR5-4800',
    'NVIDIA RTX 3080',
    'Windows 11 Pro 22H2',
    'beschikbaar'
  );

-- Add some initial remarks
INSERT INTO laptop_remarks (laptop_id, content)
SELECT 
  id,
  'Nieuwe laptop toegevoegd aan het systeem'
FROM laptops;