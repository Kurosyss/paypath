# PayPath — Brand Assets & Visual Identity Specification
## Product-Driven Visual Reset: The Payment Lifecycle Engine

PayPath is the **PayPal Payment Reliability Lab & AI Diagnostic Engine**, designed to test payment lifecycles under chaos conditions, expose race conditions and state drift, intercept duplicate captures, enforce 10 formal safety invariants, and diagnose root causes using AI.

This document establishes the official visual identity, asset catalog, color tokens, typography rules, and usage standards following our **Product-Driven Creative Art Direction Reset**.

---

## 1. Creative Direction: Grounded in the Actual PayPath Product

The visual identity is built directly around PayPath's actual payment lifecycle:

$$\text{ORDER} \longrightarrow \text{BUYER APPROVAL} \longrightarrow \text{CAPTURE} \longrightarrow \text{RECONCILIATION}$$

It demonstrates what PayPath actually does:
- Detects duplicate events and unsafe retries.
- Intercepts race conditions at the concurrency gate.
- Prevents double-captures and incorrect state transitions.
- Authoritatively locks settlement into an immutable ledger.

### Explicit Rejection of AI Tropes and Generic Abstractions
- **Rejected:** Unrelated abstract monograms, arbitrary `V0` letter combinations, generic waveforms, straight lines, or technical infographics.
- **Rejected:** Isometric mechanical machinery, stacked slabs, CAD dimension arrows, registration crosshairs, or TrancheLock clones.
- **Adopted:** Pure monochrome editorial minimalism, spatial balance, and an authentic transaction-path metaphor where an invalid/duplicate path is detected and intercepted while the authoritative transaction reaches a verified final state.

---

## 2. Evaluation of the Three Symbol Concepts

To solve the brand mark challenge, three genuinely distinct concepts were developed, rendered, and rigorously benchmarked across scales:

| Concept Direction | Visual Metaphor | Pros | Cons | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **Concept 1: The Verification Boundary** | A transaction path crossing an authoritative threshold through a boundary aperture into a solid verified block. | Clear boundary metaphor. | Multiple fragmented blocks degrade optical unity at 16×16 favicon scale. | *Eliminated* |
| **Concept 2: The Bifurcated Route (Selected)** | **Divergence & Interception:** A payment lifecycle route forks at the concurrency gate. The duplicate/rogue branch is arrested by a solid vertical stop barrier, while the authoritative branch advances through to verified settlement. | **Directly communicates PayPath's purpose.** Distinct silhouette, intentional negative space air gap, instantly recognizable at 16×16 and 32×32 in both dark and light modes. | None. | **SELECTED & REFINED** |
| **Concept 3: The Reconciled Loop** | A continuous routing ribbon navigating lifecycle stages and looping back into an immutable ledger anchor. | Cohesive continuous path. | Resembles a stylized letter "P" monogram, conflicting with our anti-monogram directive. | *Eliminated* |

### Why Concept 2 Communicates PayPath's Real Purpose
1. **The Incoming Stem:** Represents an initiated payment intent (`order.create`).
2. **The Fork Junction:** Represents the concurrency gate during capture where race conditions and duplicate retries occur.
3. **The Lower Intercepted Path:** Represents the rogue duplicate request or unsafe retry attempt. It is decisively halted by the **Authoritative Interception Barrier** with an unmistakable negative-space air gap, proving zero double-charge.
4. **The Upper Authoritative Path:** Represents the legitimate transaction continuing forward, locking into an immutable settlement block.
5. **Scale Invariance:** The geometry was mathematically tailored on a 64×64 grid with 8px stroke weight and a 5px air gap, ensuring it reads with high contrast and zero clutter on 16×16 browser tabs.

---

## 3. Marketing Artwork: The Payment Lifecycle Hero

### A. Devpost Project Thumbnail (1200×800, 3:2 Landscape)
The Devpost thumbnail makes the payment lifecycle the visual hero:
- **Header:** Features the refined PayPath Bifurcated Route mark, crisp `PayPath` wordmark, `PAYMENT RELIABILITY LAB` pill, and `PAYPAL ORDERS V2 RELIABILITY TEST SUITE` tag.
- **Editorial Headline:**
  `Payment lifecycle testing & idempotency verification.`
  `Intercepts duplicate captures, unsafe retries, and state drift before settlement.`
- **Central Visual Story:** A horizontal rail connecting the 4 sequential stations:
  1. `STAGE 01: ORDER` — Payload validated · Idempotent intent tokenized
  2. `STAGE 02: BUYER APPROVAL` — PayPal Sandbox authorization · PayerID token issued
  3. `STAGE 03: CAPTURE` — Concurrency mutex gate · Atomic server execution
  4. `STAGE 04: RECONCILIATION` — Monotonic state locked · Immutable audit ledger (`VERIFIED`)
- **Divergence & Interception:** Between Stage 03 and Stage 04, a duplicate capture trajectory branches downward toward an unauthorized second charge, but is intercepted by the solid **Interception Barrier** (`INTERCEPTED // DUPLICATE DETECTED · Concurrent capture arrested · Zero double-charge`).
- **Footer Datum Bar:**
  `LIFECYCLE: 4/4 STAGES DETERMINISTIC` · `RACE CONDITIONS: INTERCEPTED` · `DOUBLE-CAPTURE RISK: 0.00%` · `MONOTONIC SETTLEMENT GUARANTEED`

### B. Social Preview / Open Graph Banner (1200×630, 1.91:1 Landscape)
A dedicated wide-format composition tailored for social cards (not a crop):
- Proportions calibrated to 1.91:1 for crisp presentation on Twitter/X, LinkedIn, Discord, and Slack.
- Widened horizontal rail with balanced vertical margins and generous negative space.

---

## 4. Multi-Scale Inspection Results

The identity was inspected across all critical viewports:
- **16×16 Browser Tab:** The bifurcated route and barrier maintain clear optical separation; the air gap prevents pixel bleed.
- **32×32 Desktop Favicon:** The fork and barrier geometry are razor-sharp.
- **64×64 App Tile & 180×180 Apple Touch Icon:** Clean corner radii and titanium silver border provide a modern aesthetic.
- **300×200 Devpost Gallery Card:** The 4 stages, the divergence, the barrier, and the headline are legible at a glance.

---

## 5. Master Asset Catalog

All production assets are housed in `public/brand/` with required Next.js App Router root mirrors in `public/` and `src/app/`:

| Asset File | Path | Dimensions | Aspect Ratio | Format | Size | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Devpost Project Thumbnail** | `public/brand/paypath-devpost-thumbnail.png` | 1200×800 px | 3:2 | PNG | ~97 KB | Devpost Hackathon Gallery submission card |
| **Social Preview / Open Graph** | `public/brand/paypath-social-preview.png` | 1200×630 px | 1.91:1 | PNG | ~96 KB | Twitter/X Card & Open Graph link previews |
| **Multi-Resolution Favicon** | `public/favicon.ico`<br>`src/app/favicon.ico`<br>`public/brand/favicon.ico` | 16×16, 32×32, 48×48 px | 1:1 | ICO | 3.5 KB | Browser tab icon across all viewports |
| **Adaptive Favicon SVG** | `public/favicon.svg`<br>`public/brand/favicon.svg`<br>`src/app/favicon.svg` | Scalable Vector | 1:1 | SVG | 798 B | Theme-adaptive SVG favicon (`prefers-color-scheme`) |
| **High-Res App Icon** | `public/icon.png`<br>`src/app/icon.png`<br>`public/brand/paypath-icon-512.png` | 512×512 px | 1:1 | PNG | 16.2 KB | High-DPI screens, PWA manifest |
| **Standard App Icon** | `public/icon-192.png`<br>`public/brand/paypath-icon-192.png` | 192×192 px | 1:1 | PNG | 6.2 KB | Standard mobile bookmark icon |
| **Apple Touch Icon** | `public/apple-touch-icon.png`<br>`src/app/apple-icon.png`<br>`public/brand/apple-touch-icon.png` | 180×180 px | 1:1 | PNG | 5.7 KB | iOS Safari Home Screen icon |
| **Favicon PNG (32×32)** | `public/icon-32.png` | 32×32 px | 1:1 | PNG | 1.2 KB | Desktop browser tab fallback |
| **Favicon PNG (16×16)** | `public/icon-16.png` | 16×16 px | 1:1 | PNG | 590 B | Compact bookmark list fallback |
| **Master Mark SVG (Adaptive)** | `public/brand/paypath-mark.svg` | Scalable Vector | 1:1 | SVG | 472 B | Embeddable vector mark (`currentColor`) |
| **Master Mark (Dark Canvas)** | `public/brand/paypath-mark-dark.svg` | Scalable Vector | 1:1 | SVG | 560 B | White mark on `#0A0A0A` container |
| **Master Mark (Light Canvas)**| `public/brand/paypath-mark-light.svg` | Scalable Vector | 1:1 | SVG | 560 B | Black mark on `#FFFFFF` container |
| **Master Logo Lockup** | `public/brand/paypath-logo.svg` | Scalable Vector | 5.2:1 | SVG | 828 B | Full horizontal mark + wordmark lockup |
| **Master Wordmark SVG** | `public/brand/paypath-wordmark.svg` | Scalable Vector | 4.1:1 | SVG | 308 B | Standalone typography treatment |

---

## 6. Devpost Manual Submission Guide

1. In your Devpost project editor under **Project Thumbnail**, click **Add Image**.
2. Select the final hero artwork:
   `public/brand/paypath-devpost-thumbnail.png`
3. The thumbnail is formatted at 1200×800 (exact 3:2 landscape) and optimized at ~97 KB (well below the 5 MB limit), ensuring crisp presentation without cropping, distortion, or blurriness in the hackathon project gallery.

---

## 7. System Integrity & Non-Disruption Guarantee

- **Payment Logic Untouched:** Zero changes to `src/lib/paypal-client.ts`, `/api/paypal/create-order`, `/api/paypal/capture-order`, `/api/paypal/auth`, `/api/scenarios/run`, or `/checkout/success`.
- **Database & Storage Preserved:** All persistent records in `data/payments.json` and `data/runs.json` remain pristine.
- **Tests Passing:** Vitest test suite runs with 13/13 passing tests.
- **Design System Fidelity:** Next.js application strictly complies with Vercel `DESIGN.md` monochrome tokens.
