create table if not exists public.re_outreach_demo_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  agency_name text not null,
  suburb text,
  website text,
  status text not null default 'new',
  score integer not null default 0,
  last_contacted_at timestamptz,
  next_followup_at timestamptz,
  owner_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.re_outreach_demo_leads (
  name,
  email,
  phone,
  agency_name,
  suburb,
  website,
  status,
  score,
  last_contacted_at,
  next_followup_at,
  owner_notes
)
values
  (
    'Sarah Chen',
    'sarah.chen@perthproperty-demo.example',
    '0412 555 101',
    'Perth Property Collective',
    'Mount Lawley WA',
    'https://perthproperty-demo.example',
    'new',
    82,
    null,
    null,
    'Demo lead for product walkthroughs. Fake contact details only.'
  ),
  (
    'Marcus Doyle',
    'marcus.doyle@riverstone-realty-demo.example',
    '0412 555 102',
    'Riverstone Realty Group',
    'South Perth WA',
    'https://riverstone-realty-demo.example',
    'contacted',
    74,
    '2026-03-29T03:30:00.000Z',
    null,
    'Use this row to demo contacted-state filtering.'
  ),
  (
    'Priya Nair',
    'priya.nair@swanriverhomes-demo.example',
    '0412 555 103',
    'Swan River Homes',
    'Subiaco WA',
    'https://swanriverhomes-demo.example',
    'replied',
    88,
    '2026-03-30T05:00:00.000Z',
    null,
    'Demo lead with reply history.'
  ),
  (
    'Lachlan Price',
    'lachlan.price@coastlineagents-demo.example',
    '0412 555 104',
    'Coastline Agents',
    'Scarborough WA',
    'https://coastlineagents-demo.example',
    'demo_booked',
    91,
    '2026-03-31T01:15:00.000Z',
    '2026-04-04T02:00:00.000Z',
    'Useful for demoing post-demo workflow states.'
  ),
  (
    'Ella Morgan',
    'ella.morgan@northshoreproperty-demo.example',
    '0412 555 105',
    'Northshore Property Partners',
    'Leederville WA',
    'https://northshoreproperty-demo.example',
    'new',
    69,
    null,
    null,
    'Great example for AI draft demos.'
  ),
  (
    'Daniel Kwan',
    'daniel.kwan@westedgeagents-demo.example',
    '0412 555 106',
    'West Edge Agents',
    'Victoria Park WA',
    'https://westedgeagents-demo.example',
    'won',
    95,
    '2026-03-27T06:20:00.000Z',
    null,
    'Demo closed-won example.'
  ),
  (
    'Nina Hart',
    'nina.hart@foothillrealty-demo.example',
    '0412 555 107',
    'Foothill Realty Studio',
    'Kalamunda WA',
    'https://foothillrealty-demo.example',
    'lost',
    57,
    null,
    null,
    'Demo closed-lost example.'
  )
on conflict do nothing;
