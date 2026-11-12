/*
# Restrict anon access to services.download_url column

## Plain English
The previous migration tried to REVOKE SELECT on the download_url column from
anon, but a table-level GRANT SELECT ON services TO anon still grants access
to all columns. To actually restrict the column, we must revoke the table-level
grant from anon and replace it with column-level grants that exclude download_url.

## Changes
- REVOKE SELECT ON services FROM anon (removes table-level grant)
- GRANT SELECT on all services columns EXCEPT download_url to anon
- authenticated keeps the table-level grant (admin dashboard needs download_url)
*/
REVOKE SELECT ON services FROM anon;

GRANT SELECT (
  id, slug, name, tagline, description, price_display, price_dollars,
  badge_text, accent_color, cta_href, page_href, image_url, icon,
  features, sort_order, is_active, is_featured, created_at, updated_at,
  stripe_price_id
) ON services TO anon;
