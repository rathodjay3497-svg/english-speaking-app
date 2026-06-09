---
name: Bolo English Design System
colors:
  surface: '#fff8f3'
  surface-dim: '#e1d9cf'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fbf2e8'
  surface-container: '#f6ece3'
  surface-container-high: '#f0e7dd'
  surface-container-highest: '#eae1d7'
  on-surface: '#1f1b15'
  on-surface-variant: '#3f4946'
  inverse-surface: '#343029'
  inverse-on-surface: '#f8efe5'
  outline: '#6f7976'
  outline-variant: '#bfc9c5'
  surface-tint: '#22695e'
  primary: '#004f46'
  on-primary: '#ffffff'
  primary-container: '#21685d'
  on-primary-container: '#a0e4d6'
  inverse-primary: '#90d3c6'
  secondary: '#924b1c'
  on-secondary: '#ffffff'
  secondary-container: '#ffa26c'
  on-secondary-container: '#783607'
  tertiary: '#49463d'
  on-tertiary: '#ffffff'
  tertiary-container: '#615d54'
  on-tertiary-container: '#ddd6cb'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#abf0e1'
  primary-fixed-dim: '#90d3c6'
  on-primary-fixed: '#00201b'
  on-primary-fixed-variant: '#005046'
  secondary-fixed: '#ffdbc9'
  secondary-fixed-dim: '#ffb68e'
  on-secondary-fixed: '#331200'
  on-secondary-fixed-variant: '#753405'
  tertiary-fixed: '#e8e2d6'
  tertiary-fixed-dim: '#ccc6ba'
  on-tertiary-fixed: '#1e1b14'
  on-tertiary-fixed-variant: '#4a463e'
  background: '#fff8f3'
  on-background: '#1f1b15'
  surface-variant: '#eae1d7'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style
The brand personality is encouraging, educational, and culturally grounded. It aims to make English learning feel like a warm, supportive conversation rather than a rigid academic exercise. The target audience includes Gujarati speakers transitioning into professional or social English environments.

The visual style is **Modern Organic**. It combines the structure of a professional SaaS platform with the softness of an editorial magazine. Key traits include:
- **Warmth:** Extensive use of beige and cream tones to reduce eye strain and feel more inviting than pure white.
- **Clarity:** Distinctive typography that handles bilingual (English/Gujarati) text with equal importance.
- **Trust:** Solid, grounding teal accents that provide a sense of progress and reliability.

## Colors
This design system uses a palette inspired by natural, earthy tones to evoke a sense of calm and focus.

- **Primary (Teal):** Used for main actions, active states, and focus areas. It represents growth and stability.
- **Secondary (Soft Orange):** Used for highlighting progress, streaks, and gamified elements (like level tags).
- **Surface (Beige/Cream):** The primary background color. It creates a soft, paper-like feel that facilitates long reading sessions.
- **Neutral (Deep Charcoal/Brown):** Used for text and icons to ensure high legibility against the warm backgrounds without the harshness of pure black.

## Typography
The typography strategy utilizes a "Serif for Voice, Sans for Utility" approach. 

- **Headlines:** Use *Source Serif 4*. This font provides an authoritative yet literary feel that works beautifully for English and complements the curves of Gujarati script. Use it for "Ready to speak?" prompts and card titles.
- **Body & Interface:** Use *Plus Jakarta Sans*. It is highly legible, modern, and has a friendly, rounded geometry that keeps the interface feeling approachable. 
- **Bilingual Handling:** Ensure Gujarati text is rendered at roughly 110% of the English font size to maintain visual optical balance, as Gujarati characters often have more vertical complexity.

## Layout & Spacing
The design system employs a **Fluid Grid** system based on an 8px root unit.

- **Desktop:** 12-column grid with 24px gutters. Max content width is 1280px.
- **Tablet:** 8-column grid with 24px gutters.
- **Mobile:** 4-column grid with 16px margins.

Cards should use "md" (24px) internal padding to maintain an airy, premium feel. Vertical spacing between sections should be "lg" (40px) to clearly demarcate different learning modules.

## Elevation & Depth
Depth is communicated through **Tonal Layering** and soft, ambient shadows rather than harsh borders.

- **Level 0 (Base):** The primary background (`#F4EDE1`).
- **Level 1 (Cards):** Slightly lighter or white-based surfaces with a very soft, diffused shadow (10% opacity of the neutral color) to indicate interactability.
- **Active State:** Elements like the "All" filter chip use the primary teal color with no shadow, appearing "pressed" or "seated" into the layout.
- **Overlays:** Modals and playback controls use a slightly more pronounced shadow and a subtle backdrop blur to keep the user focused on the immediate task.

## Shapes
The shape language is consistently **Rounded**, reflecting a friendly and safe environment for making mistakes while learning. 

- **Standard Radius:** 0.5rem (8px) for small components like inputs and buttons.
- **Large Radius:** 1rem (16px) for practice cards and main container sections.
- **Pill Shapes:** Used exclusively for tags (e.g., "BEG", "INT", "ADV") and status indicators to differentiate them from functional buttons.

## Components

### Practice Cards
Cards feature a top-right "Level Tag" (Pill shape). The icon should be placed in a subtle 48x48px circle with a light tinted background. Titles use `headline-md` and metadata (Time, Category) uses `label-md`.

### Audio Playback Controls
Playback bars are docked or floating. Use a Primary Teal for the progress bar and Soft Orange for the "Current Position" indicator. Buttons for "Replay" and "Slow Down" should be large, circular, and use high-contrast icons.

### List Items
List items (e.g., Vocabulary lists) use a subtle bottom border (`1px` at 10% opacity). Bookmark icons should appear on the far right. When "Marked as Learned," the icon transitions from an outline to a solid Soft Orange fill.

### Buttons & Chips
- **Primary Button:** Solid Teal background, white `label-md` text.
- **Ghost Button:** Teal outline, Teal text, for secondary actions like "View All."
- **Filter Chips:** Use a light-colored background that flips to Teal with white text when selected.

### Input Fields
Inputs use a solid background slightly darker than the page base with a `1px` border that highlights in Teal upon focus. Ensure enough vertical height for Gujarati script descenders.