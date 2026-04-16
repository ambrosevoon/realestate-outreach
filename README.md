# SmartFlow Outreach Command Center

A full-stack outbound sales platform built for selling AI automation services to real estate agents across Perth, Western Australia. The system handles every stage of the sales pipeline — from automated lead discovery through to AI-assisted email outreach, follow-up scheduling, and conversion tracking — in a single cohesive interface.

**Live demo:** https://realestate-outreach-sand.vercel.app/dashboard

> A Demo Mode toggle is available on the dashboard for safe walkthroughs using pre-seeded sample data. No live emails will be sent in demo mode.

## Purpose

The real estate industry in Australia generates a high volume of inbound buyer and seller enquiries, most of which agents handle manually. This creates a well-defined pain point: slow response times, inconsistent follow-up, and missed opportunities when agents are stretched across inspections, negotiations, and admin.

SmartFlow Outreach was built to demonstrate how AI-assisted automation can solve this. More specifically, it serves as the internal sales tool used to prospect and convert real estate agents into clients for that very automation product. The platform closes its own loop — it is itself an example of the workflow efficiency it sells.

## How It Works

### Lead Discovery

The Discover Agents feature issues a location-based search (e.g. "Subiaco" or "Fremantle") via a backend n8n workflow that queries web data sources to surface real estate agents operating in that suburb. Results are returned with name, agency, phone, email, suburb, and website where available, then presented in a preview dialog before being written to the database. Duplicate detection runs against existing leads at import time.

Leads can also be added manually through a creation form or imported in bulk via CSV upload, with column mapping and a preview step before any data is committed.

### Pipeline Management

Every lead moves through a six-stage pipeline:

```
New  →  Contacted  →  Replied  →  Demo Booked  →  Won  →  Lost
```

Status updates can be applied manually from the lead drawer or are triggered automatically. When a lead books a demo via Cal.com, an n8n webhook receives the booking event, matches the attendee email to a lead record in Supabase, and advances the status to Demo Booked without any manual action required.

### AI Email Drafting

Opening any lead from the pipeline table slides in a detail drawer. From there, the AI Draft button sends the lead's name, agency, suburb, and any custom instructions to an n8n workflow, which calls an LLM via OpenRouter (Claude) and returns a personalised cold outreach email with a subject line and full body copy.

The draft appears in an editable pane inside the drawer. Subject and body are both editable before sending. A re-generate button allows new variations to be requested with refined instructions.

### Email Sending

Sending routes through an n8n Gmail workflow. In Demo Mode, all outgoing mail is intercepted and redirected to a safe test address. When the Live Mode and Real Email toggle are both active, the email goes to the lead's actual address and the lead status advances to Contacted automatically.

### Activity Timeline

Every significant action on a lead — email sent, follow-up scheduled, status change — is written to an activities table in Supabase and surfaced as a chronological timeline inside the lead drawer. The timeline persists across sessions.

### Analytics

The dashboard includes summary cards (total leads, contacted rate, reply rate, demos booked) and a fuller analytics section that visualises pipeline distribution and outreach pace over time.

## Architecture

```
Browser (Next.js App Router)
    │
    ├── Supabase (PostgreSQL)
    │     ├── re_outreach_leads      — lead records
    │     └── re_outreach_activities — activity log per lead
    │
    └── n8n (self-hosted, workflow automation)
          ├── /webhook/generate-draft    — LLM draft generation via OpenRouter
          ├── /webhook/send-email        — Gmail outreach
          ├── /webhook/update-lead       — status sync
          ├── /webhook/schedule-followup — follow-up date writes
          └── /webhook/cal-booking       — Cal.com booking events → demo_booked
```

The frontend communicates with Supabase directly using the anon key for all data reads and writes. Backend side-effects (email sending, AI generation, external API calls) are handled exclusively by n8n workflows triggered via webhook POST requests from the browser. This keeps the Next.js layer thin and stateless.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4, ShadCN UI |
| Database | Supabase (PostgreSQL) |
| Automation | n8n (self-hosted on Hostinger VPS) |
| AI / LLM | OpenRouter — Claude via n8n workflow |
| Email | Gmail API via n8n |
| Scheduling | Cal.com (booking webhook) |
| Deployment | Vercel |

## Key Features

* **Lead discovery** — location-based agent search surfacing real contact data
* **CSV import** — bulk lead upload with column mapping and duplicate detection
* **AI email drafting** — personalised cold outreach generated per lead with custom instruction support
* **Editable drafts** — subject and body fully editable before sending
* **Email routing** — Demo Mode intercepts all mail to a safe address; Live Mode sends to real recipients
* **Pipeline tracking** — six-stage status progression with manual and automated transitions
* **Cal.com integration** — demo bookings auto-advance lead status via webhook
* **Activity timeline** — persistent per-lead history of every action taken
* **Analytics dashboard** — pipeline summary cards and outreach pace visualisation
* **Prompt manager** — version-controlled LLM prompt system with activate/deactivate per version
* **Demo / Live Mode toggle** — safe client walkthroughs using pre-seeded data, no configuration required

## Design

The interface uses a dark glassmorphism aesthetic with a deep navy base, amber and cyan accents, and a frosted-glass toolbar layer. Typography is tightly tracked with a large hero heading on the dashboard to position the product as a premium tool rather than a utility. Light mode is fully supported via a theme toggle.