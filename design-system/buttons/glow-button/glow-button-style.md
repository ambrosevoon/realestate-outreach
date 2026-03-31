# Glow Button Reuse Guide

This is the reusable copy of the SmartFlow glow button guide for future projects.

For the full in-project reference, see:

- [glow-button-style.md](/Users/ambrosevoon/Projects/realestate-outreach/docs/design/buttons/glow-button-style.md)

## Approved Behavior

- restrained animated edge glow
- no large background glow wash behind grouped buttons
- readable dark-mode surface
- readable light-mode surface
- readable popup buttons in day mode

## Reuse Notes

When moving this into another project:

1. copy [GlowButton.tsx](/Users/ambrosevoon/Projects/realestate-outreach/design-system/buttons/glow-button/GlowButton.tsx)
2. wire it into that project’s shared button primitive if needed
3. verify both dark mode and light mode
4. explicitly verify dialogs, drawers, and popovers if they are rendered through portals

## Why This Copy Exists

This top-level folder is intended to be a GitHub-friendly reuse location for future projects, separate from app-specific implementation notes.
