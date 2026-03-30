# Glow Button Style Guide

This project uses a custom premium button treatment inspired by 21st.dev, adapted for SmartFlow's shader-based UI.

## Source Of Truth

- Shared button primitive: [components/ui/button.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/button.tsx)
- Glow implementation: [components/ui/shiny-button-1.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/shiny-button-1.tsx)

## Design Intent

Use this button when an action should feel premium, high-confidence, and product-defining.

The current approved look is:

- dark glass-like button surface
- animated shine concentrated on the outer edge
- no large ambient background glow behind grouped buttons
- restrained motion that still feels premium on hover

## Why This Version Exists

The original 21st.dev example looked strong in isolation, but the large glow wash became too visually loud when multiple buttons appeared next to each other in toolbars and action groups.

This repo version keeps:

- the premium animated edge
- the soft luminous border
- the dark elevated surface

This repo version intentionally removes:

- oversized section-level glow behind the button
- fixed dimensions that break real app layouts
- styling that spills across nearby grouped buttons

## Where It Applies

The shared [components/ui/button.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/button.tsx) primitive automatically routes these variants through the glow treatment:

- `default`
- `outline`
- `secondary`
- `destructive`

These variants intentionally stay plain:

- `ghost`
- `link`

Reason:

- utility icon buttons need to remain compact
- low-emphasis actions should not compete with primary CTAs
- grouped controls become noisy if every minor action glows

## Usage

Standard usage stays the same because the effect is wired into the shared button primitive:

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

## Supported Sizes

- `default`
- `sm`
- `lg`
- `icon`

The glow button implementation was adapted so app-provided sizing and rounding utilities apply to the visible surface correctly.

## Styling Rules

- Prefer this style for primary product actions, conversion actions, and high-signal dashboard actions
- Avoid stacking too many glowing buttons in one dense area unless they are important actions
- Keep surrounding surfaces darker so the edge shine reads clearly
- If a button group starts feeling loud, reduce variant count before reducing readability
- Do not reintroduce a large blurred background glow behind button groups without strong visual review

## Implementation Notes

The key implementation details live in [components/ui/shiny-button-1.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/shiny-button-1.tsx):

- `borderVariants` controls the luminous border color by variant
- `surfaceVariants` controls the dark glass surface and text styling
- `glowGradient()` defines the moving edge highlight colors
- the outer glow is intentionally tight and low-opacity
- the earlier oversized ambient glow layer was removed after live visual feedback

## If Reusing In Future

If you want the same look elsewhere in this project:

1. Use the shared [components/ui/button.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/button.tsx) component first
2. Pick one of the supported glowing variants
3. Use `ghost` or `link` for low-emphasis utility actions
4. If a special case is needed, extend [components/ui/shiny-button-1.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/shiny-button-1.tsx) rather than duplicating styles locally

## Verified Approved State

Approved live behavior as of 2026-03-30:

- grouped header buttons render as separate controls
- outer-edge shine remains visible
- section-level background glow wash is removed

Verification evidence:

- [page-2026-03-30T07-15-47-564Z.png](/Users/ambrosevoon/Projects/.playwright-cli/page-2026-03-30T07-15-47-564Z.png)
