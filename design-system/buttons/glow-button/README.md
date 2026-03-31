# Glow Button

Reusable cross-project copy of the SmartFlow glow button system.

This folder exists so future projects can copy the button directly from a stable top-level GitHub path instead of digging through app-specific docs.

## Files

- [GlowButton.tsx](/Users/ambrosevoon/Projects/realestate-outreach/design-system/buttons/glow-button/GlowButton.tsx)
  Standalone component copy
- [glow-button-style.md](/Users/ambrosevoon/Projects/realestate-outreach/design-system/buttons/glow-button/glow-button-style.md)
  Reuse guide covering dark mode, light mode, and popup behavior

## Intended Use

Use this for:

- premium primary actions
- important product actions
- CTA groups that need more presence than a default button

Do not use it for every tiny control.

## Project Assumptions

This copy assumes:

- React
- TypeScript
- Tailwind CSS
- `class-variance-authority`
- a `cn()` utility

If your target project does not already have a `cn()` helper, replace the import with your local class merge utility.

## Light And Dark Mode

This button system is approved for both:

- dark mode
- light mode

Important:

If your app uses portals for dialogs, drawers, or popovers, your light-mode overrides must also target those portal containers. Otherwise the button can look correct on pages but too dark inside modals.

## Canonical Doc

The main detailed reference still lives here:

- [glow-button-style.md](/Users/ambrosevoon/Projects/realestate-outreach/docs/design/buttons/glow-button-style.md)
