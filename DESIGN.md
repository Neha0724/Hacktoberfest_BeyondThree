---
name: Executive Slate
colors:
  surface: '#f9f9ff'
  surface-dim: '#d0daf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e8eeff'
  surface-container-high: '#dfe8ff'
  surface-container-highest: '#d9e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#44474e'
  inverse-surface: '#273143'
  inverse-on-surface: '#ecf0ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#475f85'
  primary: '#2a4267'
  on-primary: '#ffffff'
  primary-container: '#425a80'
  on-primary-container: '#b9d2fe'
  inverse-primary: '#afc7f3'
  secondary: '#485f84'
  on-secondary: '#ffffff'
  secondary-container: '#bed5ff'
  on-secondary-container: '#455c80'
  tertiary: '#3d4349'
  on-tertiary: '#ffffff'
  tertiary-container: '#545a61'
  on-tertiary-container: '#ccd1d9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#afc7f3'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#2f476c'
  secondary-fixed: '#d5e3ff'
  secondary-fixed-dim: '#b0c8f1'
  on-secondary-fixed: '#001b3b'
  on-secondary-fixed-variant: '#30476a'
  tertiary-fixed: '#dee3eb'
  tertiary-fixed-dim: '#c2c7cf'
  on-tertiary-fixed: '#171c22'
  on-tertiary-fixed-variant: '#42474e'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d9e3fb'
typography:
  headline-xl:
    fontFamily: Hanken Grotesk
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system embodies a calm, precise, and understated corporate aesthetic tailored for data-dense fintech and institutional productivity suites. It prioritizes clarity, informational hierarchy, and cognitive ease over decorative embellishment. The tone is deliberate, disciplined, and enduring.

The visual style is **Corporate / Modern** merged with **Subtle Tonal Layering**. It rejects stark black-and-white contrasts and saturated neo-accents in favor of measured slate, cool steel, and atmospheric neutrals. The interface achieves depth through disciplined border contrasts and slight surface-fill shifts rather than pronounced dropshadows.

## Colors

The palette relies on a dual-mode system powered by CSS custom properties. Colors are desaturated and lean cool-blue/gray to promote sustained focus across long operational sessions.

### CSS Custom Properties Architecture

```css
:root,
[data-theme="light"] {
  --color-bg-base: #F5F7FA;
  --color-surface-card: #FFFFFF;
  --color-surface-secondary: #EDF1F7;
  --color-accent-primary: #3D5AFE;
  --color-accent-secondary: #6C83FF;
  --color-accent-subtle: #E8ECFF;
  --color-text-primary: #1D2939;
  --color-text-secondary: #667085;
  --color-border: #DCE3EC;
  --color-status-success: #12A37F;
  --color-status-warning: #E8960C;
  --color-status-error: #E5484D;
  --color-status-info: #0EA5E9;

  /* Categorical Chart Palette */
  --chart-1: #3D5AFE;
  --chart-2: #12A37F;
  --chart-3: #E8960C;
  --chart-4: #8B5CF6;
  --chart-5: #0EA5E9;
  --chart-6: #E5484D;
  --chart-7: #EC4899;
  --chart-8: #64748B;
}

[data-theme="dark"] {
  --color-bg-base: #111722;
  --color-surface-card: #192231;
  --color-surface-secondary: #222E40;
  --color-accent-primary: #7C93FF;
  --color-accent-secondary: #A3B2FF;
  --color-accent-subtle: #1F2A5C;
  --color-text-primary: #E8EDF5;
  --color-text-secondary: #A0ADBF;
  --color-border: #303D50;
  --color-status-success: #3DD6AC;
  --color-status-warning: #FFB547;
  --color-status-error: #FF7A80;
  --color-status-info: #4CC2FF;

  /* Categorical Chart Palette */
  --chart-1: #7C93FF;
  --chart-2: #3DD6AC;
  --chart-3: #FFB547;
  --chart-4: #A78BFA;
  --chart-5: #4CC2FF;
  --chart-6: #FF7A80;
  --chart-7: #F472B6;
  --chart-8: #94A3B8;
}
```

### Application Principles
- **Interactive Prominence:** `--color-accent-primary` drives primary calls-to-action, high-priority active tabs, and critical focus indicators.
- **Supportive Context:** `--color-accent-subtle` is reserved for table row hovers, soft badge backgrounds, and secondary interactive states.
- **Validation Signals:** Status colors are grounded and muted—never neon. Use them strictly for analytical indicators, alerts, and inline verification.

## Typography

The typography uses **Hanken Grotesk** across all roles to ensure geometric precision, high legibility in dense tables, and a crisp, modern tone.

- **Tabular Figures:** When rendering financial figures, timestamps, or ledger rows, force tabular figures via `font-variant-numeric: tabular-nums;` to guarantee column alignment.
- **Hierarchy Structure:** Large titles (`headline-xl`, `headline-lg`) are reserved for broad viewports and executive dashboards, collapsing via responsive tokens on narrow devices.
- **Data Densities:** Primary interface copy defaults to `body-md` (14px). Metadata, nested key-value tags, and secondary context leverage `body-sm` (12px) and `label-sm` (11px) with slight letter-spacing expansions.

## Layout & Spacing

This design system uses an 8pt-aligned fluid grid architecture anchored to rigid maximum boundaries for dense workspaces.

### Grid & Breakpoints
- **Desktop (1280px+):** 12-column layout, `gutter-lg` (24px), `margin-lg` (32px), max content width capped at 1600px.
- **Tablet (768px - 1279px):** 8-column layout, `gutter` (16px), `margin-md` (24px).
- **Mobile (<768px):** 4-column layout, `gutter` (16px), `margin` (16px).

### Spacing Philosophy
Compact micro-spacings (`space-xs` [4px], `space-sm` [8px], `space-md` [12px]) keep form groups, data cells, and nested toolbar clusters close and scannable. Larger tokens (`space-lg` [16px], `space-xl` [24px]) separate autonomous structural panels and dashboard cards.

## Elevation & Depth

Depth is established primarily through **structural borders** and **tonal shifts**, keeping the interface anchored, crisp, and performant.

- **Surface Tiers:**
  - Base: `--color-bg-base`
  - Layer 1 (Cards, Workspaces): `--color-surface-card`
  - Layer 2 (Inset Wells, Table Headers, Filter Trays): `--color-surface-secondary`
- **Low-Contrast Outlines:** Every card, container, and input is bordered with a 1px solid stroke of `--color-border`.
- **Minimal Ambient Shadowing:** Floating elements (dropdowns, popovers, flyout dialogs) use a subtle, tinted shadow rather than dark diffuse blurs:
  - Dropdown / Popover: `0 4px 12px -2px rgba(17, 23, 34, 0.08), 0 0 0 1px var(--color-border)`
  - Modal: `0 12px 32px -4px rgba(17, 23, 34, 0.16), 0 0 0 1px var(--color-border)`
- **Dark Mode Elevation:** In dark mode, drop shadows decrease opacity and boundary separation relies directly on the contrast between `--color-surface-card` and the 1px `--color-border`.

## Shapes

The interface maintains a disciplined geometric geometry utilizing an exact **8px to 10px radius** profile:

- **Standard Components (Inputs, Buttons, Cards, Chips):** `8px` (`roundedness: 2`). This reinforces structured alignment and avoids toy-like, over-rounded shapes.
- **Large Overlays & Dialogs:** Up to `10px` for high-level modal viewports.
- **Micro-Indicators:** Checkboxes and status badges utilize `4px` or full pill (`9999px`) styling depending on visual role (pills reserved strictly for quantitative status counters).

## Components

### Buttons
- **Primary:** Background `--color-accent-primary`, text `#FFFFFF` (light) / `#111722` (dark), border `1px solid transparent`, radius `8px`. Hover: 8% darkened/lightened shift. Active: scale 0.99.
- **Secondary / Outline:** Background `--color-surface-card`, text `--color-text-primary`, border `1px solid --color-border`, radius `8px`. Hover: `--color-accent-subtle`.
- **Ghost:** Background transparent, text `--color-text-secondary`, border none. Hover: background `--color-accent-subtle`, text `--color-text-primary`.

### Cards & Panels
- **Structure:** Background `--color-surface-card`, border `1px solid --color-border`, border-radius `8px`.
- **Card Headers:** Separated by a `1px solid --color-border` horizontal divider or distinct `--color-surface-secondary` toolbar background. Padding: `space-lg` (16px).

### Input Fields & Controls
- **Text Inputs:** Height 36px (compact) or 40px (default). Background `--color-surface-card`, border `1px solid --color-border`, radius `8px`, text `--color-text-primary`.
- **Focus State:** Border color `--color-accent-primary`, outline `2px solid --color-accent-subtle` with 0px offset.
- **Checkboxes & Radios:** 16px footprint, border `1px solid --color-border`, background `--color-surface-card`. Checked state applies `--color-accent-primary` fill with white indicator.

### Chips & Badges
- **Status Badges:** Radius `4px` or `9999px`, padding `2px 8px`, typography `label-sm`.
- **Palette Pairing:** Tinted fill derived from status token at 12% opacity, with 100% solid status token text for WCAG AAA legibility.

### Data Tables
- **Header Row:** Background `--color-surface-secondary`, text `--color-text-secondary`, typography `label-md`, border-bottom `1px solid --color-border`.
- **Row Elements:** Alternate or uniform `--color-surface-card`, border-bottom `1px solid --color-border`. Hover: `--color-accent-subtle`. Cell padding: `space-md` vertically, `space-lg` horizontally.