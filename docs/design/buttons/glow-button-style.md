# Glow Button Style Guide

This document is the source-of-truth reference for the SmartFlow glow button system.

It covers:

- where the button system lives
- which variants use the glow treatment
- how the button is supposed to behave in dark mode
- how the button is supposed to behave in light mode
- what was intentionally removed from the original 21st.dev inspiration

## Source Of Truth

- Shared button primitive: [button.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/button.tsx)
- Glow implementation: [shiny-button-1.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/shiny-button-1.tsx)
- Light/dark theme overrides: [globals.css](/Users/ambrosevoon/Projects/realestate-outreach/app/globals.css)

## Design Intent

The glow button is used when an action should feel premium, deliberate, and high-signal.

It is designed to support the SmartFlow visual language:

- elevated
- premium
- polished
- slightly cinematic
- clear enough for dashboard workflows

This is not meant to be a novelty button. It should still work as a practical product control in dense UI.

## Why This Version Exists

The original 21st.dev reference had a strong visual idea, but it was too aggressive for real grouped product controls.

This project keeps:

- animated edge energy
- luminous border treatment
- premium surface feel
- distinct variant color identity

This project intentionally removes or tones down:

- oversized ambient glow behind button groups
- fixed demo dimensions that break real app layouts
- overly dark light-mode buttons
- spillover glow that makes adjacent buttons blur together

## Where It Applies

The shared [button.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/button.tsx) primitive routes these variants through the glow treatment:

- `default`
- `outline`
- `secondary`
- `destructive`

These variants intentionally stay plain:

- `ghost`
- `link`

Reason:

- small utility controls should stay compact
- low-emphasis actions should not compete with major CTAs
- icon-only controls become noisy if everything glows

## Supported Sizes

- `default`
- `sm`
- `lg`
- `icon`

The implementation was adapted so app-provided sizing, padding, and rounding still affect the visible surface correctly.

## Approved Dark Mode

Dark mode is the original home of this button system.

Approved dark-mode behavior:

- deep glass-like surface
- bright outer-edge animated highlight
- restrained but visible hover energy
- clear text and icon contrast
- grouped buttons remain visually separate

Dark mode should feel:

- premium
- focused
- cinematic
- slightly high-tech

Dark mode should not:

- create a large blurred glow wash behind whole sections
- overpower nearby cards or text
- make grouped action rows feel smeared together

## Approved Light Mode

Light mode is not just the dark button copied onto a white surface.

Approved light-mode behavior:

- bright surface fill
- darker readable text and icons
- softer glow tuned for pale backgrounds
- border energy still visible without making the button look neon-heavy
- popup and drawer buttons must remain clearly readable against white and off-white surfaces

Light mode should feel:

- premium
- clean
- deliberate
- lighter and calmer than dark mode

Light mode should not:

- keep the dark fill from night mode
- rely on low-contrast dark-on-dark text
- disappear into bright dialog surfaces
- look like a pasted dark theme artifact

## Popup And Drawer Rule

Important implementation note:

Portal-rendered surfaces such as the lead drawer do not live inside `.dashboard-page`, so light-mode button styling must not be scoped only to dashboard containers.

Light-mode glow button overrides must also cover:

- `.lead-drawer`
- `.app-dialog-content`
- `.app-popover`

This is required so popup actions like:

- `Save Notes`
- `Send Email`
- `AI Draft`
- `Schedule Follow-up`
- `Mark Won`
- `Mark Lost`

stay readable in day mode.

## Usage

Standard usage stays the same because the shared button primitive owns the effect:

```tsx
import { Button } from "@/components/ui/button"

export function ExampleActions() {
  return (
    <div className="flex gap-3">
      <Button>Save Changes</Button>
      <Button variant="outline">Import CSV</Button>
      <Button variant="secondary">Mark Won</Button>
      <Button variant="destructive">Mark Lost</Button>
    </div>
  )
}
```

## Styling Rules

- Use glow buttons for important product actions and major decision points
- Prefer a smaller number of glowing actions per cluster
- Keep minor utility actions on `ghost` or `link`
- If a toolbar starts feeling loud, reduce glow-button density before weakening contrast
- Do not reintroduce a section-level background glow wash behind grouped buttons without visual review
- In light mode, prioritize readability over drama

## Implementation Notes

Core implementation details:

- [shiny-button-1.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/shiny-button-1.tsx)
  - `surfaceVariants` controls fill, border, and text treatment
  - `borderVariants` controls the luminous edge shell
  - `glowGradient()` controls animated edge color behavior
- [globals.css](/Users/ambrosevoon/Projects/realestate-outreach/app/globals.css)
  - dashboard light-mode glow tuning
  - drawer/dialog/popover light-mode glow tuning

## Reuse Guidance

If you want to reuse this button system elsewhere in the project:

1. Start with [button.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/button.tsx)
2. Use supported glowing variants first
3. Use `ghost` or `link` for low-emphasis controls
4. Extend [shiny-button-1.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/shiny-button-1.tsx) only if a real product case needs it
5. If the button will appear inside a portal surface, verify both dark and light mode explicitly

## Verified Approved State

Approved live behavior as of 2026-03-31:

- grouped header buttons render as separate controls
- ambient section glow has been removed
- edge shine remains visible
- day-mode dashboard buttons use bright readable surfaces
- day-mode popup buttons in the lead drawer use bright readable surfaces

Verification evidence:

- Dark-mode / restrained edge-glow state:
  - [page-2026-03-30T07-15-47-564Z.png](/Users/ambrosevoon/Projects/.playwright-cli/page-2026-03-30T07-15-47-564Z.png)
- Light-mode popup readability:
  - [page-2026-03-31T07-41-45-650Z.png](/Users/ambrosevoon/Projects/.playwright-cli/page-2026-03-31T07-41-45-650Z.png)
