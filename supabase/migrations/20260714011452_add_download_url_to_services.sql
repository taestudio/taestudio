ALTER TABLE services ADD COLUMN IF NOT EXISTS download_url text;

UPDATE services
SET download_url = 'https://wfdihgjmwljckmmlvyfo.supabase.co/storage/v1/object/public/products/The%20Soft%20Power%20Reset%20Worksheet%20.pdf'
WHERE slug = 'soft-power-reset';
