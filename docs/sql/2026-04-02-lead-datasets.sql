-- Add datasource metadata to the single live leads table.
-- This keeps the app on one table while allowing Version 1.0 + suburb-based datasets.

alter table public.re_outreach_leads
  add column if not exists dataset_key text,
  add column if not exists dataset_label text,
  add column if not exists location text;

-- Backfill the current live leads into the legacy datasource.
update public.re_outreach_leads
set
  dataset_key = 'version-1-0',
  dataset_label = 'Version 1.0',
  location = coalesce(location, suburb)
where dataset_key is null;

create index if not exists re_outreach_leads_dataset_key_idx
  on public.re_outreach_leads (dataset_key);

create index if not exists re_outreach_leads_location_idx
  on public.re_outreach_leads (location);
