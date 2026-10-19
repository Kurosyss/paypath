# PayPath — Product Launch Video Brief & Storyboard (v2.2 Final Accuracy Fix)

**Project:** PayPath — PayPal Payment Reliability Lab & Diagnostic Studio  
**Deliverable Video:** `media/paypath-product-launch.mp4` (verified candidate promoted)  
**Candidate Video:** `media/paypath-product-launch-final-candidate.mp4`  
**Duration:** 23.0 seconds (690 frames @ 30 fps)  
**Format:** 1920×1080 (16:9 landscape)  
**Visual Style:** Premium Monochrome Engineering Aesthetic (Vercel Geist design system)  
**Audio Track:** "Business Moves Vol. 12" by ende.app (Licensed tech groove) + Kenney CC0 Interface SFX  

---

## 🎯 Strategic Objective & Narrative Arc

PayPath is an engineering developer tool that hardens PayPal checkout integrations against edge-case failures before production. The launch video demonstrates a single, coherent, factually verified end-to-end narrative:
1. **The Core Dilemma (Scene 1, 0.0s - 3.8s):** Standard happy-path PayPal checkouts work, until production chaos strikes: 504 timeouts, swallowed card declines, duplicate webhooks.
2. **Authoritative Ground Truth (Scene 2, 3.8s - 7.8s):** Real PayPal Sandbox API operations settle payments (`$10.00 USD`), demonstrating authoritative state progression. Hero headline and description accurately state *Automated Invariants* and *Deterministic Diagnostic Rule Engine*, with Sandbox order and capture IDs masked (`3JL9••••••••362V` and `1TU9••••••••614Y`).
3. **Scenario Lab & Chaos Testing (Scene 3, 7.8s - 11.8s):** Complete consistency across all UI elements. Top active banner, left scenario list card, and right execution panel all display `SCENARIO-C — Uncertain Capture Outcome & State Reconciliation` with `Fault Injection` mode selected, `Unfixed Baseline` resilience state, and actual failure result (`Execution Outcome: FAILED`).
4. **Failure Detection & Invariant INV-002 (Scene 4, 11.8s - 15.6s):** Shows `Diagnostic Analysis & Fix Studio`, attributed to `PayPath Deterministic Payment Rule Engine v1.0 (No AI Key Configured)` with `Verification: Deterministic Rules`. Synthetic `Confidence: 96%` and unsupported Gemini claims have been completely removed.
5. **Diagnostic Engine & Code Diff (Scene 5, 15.6s - 19.4s):** The Diagnostic Engine synthesizes root causes from sanitized traces and generates a drop-in safe reconciliation patch (`src/services/paypal-reconciliation.ts`).
6. **Engineered Closure (Scene 6, 19.4s - 23.0s):** Branded outro with core technical capabilities (`PayPal Orders v2 REST`, `10 Safety Invariants`, `Diagnostic Rule Engine`, `MIT Open Source`).

---

## 🎬 Beat-by-Beat Storyboard & Frame Audit

### Beat 1: The Problem Hook (0.0s – 3.8s | Frame at 1.8s)
- **Framing:** Dark minimalist canvas (`#060606`) with animated subtle engineering hairline grid and PayPath brand mark.
- **Eyebrow:** `PAYPAL AI HACKATHON 2026 · PAYMENT RELIABILITY LAB`
- **Headline (Split reveal):**  
  `"Happy-path checkouts work."`  
  `"Until production chaos strikes."`
- **Vulnerability Indicators:**
  - `01 504 Timeouts & Blind Double Debits`
  - `02 Swallowed Card Declines`
  - `03 Duplicate Webhook Replays`
- **Audio:** Intro beat drop + soft impact chime (`impactSoft_medium_001.ogg`).

### Beat 2: Dashboard & Authoritative Settlement (3.8s – 7.8s | Frame at 5.5s)
- **Framing:** Floating desktop browser frame (`localhost:3000`) with refined 1px border and Vercel dark window chrome.
- **Visual Asset:** `media/paypath-video-source/assets/screens/01-dashboard.png` (genuine running application).
- **Factual Corrections Verified:**
  - **Hero Title:** `Test real PayPal flows. Expose failure weaknesses with Automated Invariants.`
  - **Hero Body:** Accurately refers to `deterministic diagnostic rule engine` (no claim that Gemini is generating diagnostics).
  - **Top Navigation Bar:** Displays `* DETERMINISTIC ENGINE` status badge and `Diagnostic Studio` tab pill.
  - **Privacy Masking:** Persisted Payment card displays masked identifiers (`Order: 3JL9••••••••362V`, `Capture: 1TU9••••••••614Y`).
- **Key Callouts:**
  - Focus Tag: `Verified Authoritative Settlement · $10.00 USD`
  - Window Pill: `PayPal Sandbox Connected`
  - Callout Badge: `Authoritative State Progression · PayPal Orders v2 REST`
- **Audio:** Soft interface tick (`click1.ogg`).

### Beat 3: Scenario Lab & Chaos Testing Controls (7.8s – 11.8s | Frame at 9.5s)
- **Framing:** Browser transitions seamlessly to `media/paypath-video-source/assets/screens/02-scenario-lab.png`.
- **Factual Corrections Verified:**
  - **Full Scenario C Consistency:**
    - Active Pill: `Active: Uncertain Capture Outcome & State Reconciliation [FAILED]`
    - Left Card: `SCENARIO-C` is selected with active border.
    - Right Panel Header: `SCENARIO-C` · `Category: Fault Injection & Recovery` · `CHAOS`
    - Right Panel Title: `Uncertain Capture Outcome & State Reconciliation`
    - Execution Mode: `Fault Injection` is actively highlighted (not Real Sandbox API).
    - Resilience Patch State: `Unfixed Baseline`
    - Result Snapshot: `Execution Outcome: FAILED (1ms)` · `UNFIXED BASELINE` · `Initial State: APPROVED` · `Final State: FAILED` · `Invariants: 1 / 2`
  - **Privacy Masking:** Order ID in card is masked as `3JL9••••••••362V`.
- **Key Callouts:**
  - Focus Tag: `Fault Injection · Unfixed Baseline State`
  - Window Pill: `Execution Mode: Fault Injection`
  - Callout Badge: `Scenario Lab · Injected 504 Timeout & Chaos Controls`
- **Audio:** Interface toggle (`switch_001.ogg`).

### Beat 4: Failure Detection & Invariant INV-002 (11.8s – 15.6s | Frame at 13.5s)
- **Framing:** Browser transitions to `media/paypath-video-source/assets/screens/03-failure-detection.png`.
- **Factual Corrections Verified:**
  - **Terminology:** Header displays `Diagnostic Analysis & Fix Studio` (AI removed from claim).
  - **Engine Attribution:** Badge reads `PayPath Deterministic Payment Rule Engine v1.0 (No AI Key Configured)`.
  - **Confidence Claim:** `Confidence: 96%` is removed. Replaced with `Verification: Deterministic Rules`.
  - **Violation Details:** `INV-002: CRITICAL` violation detected on 504 capture drop.
- **Key Callouts:**
  - Focus Tag: `Deterministic Invariant INV-002 Violated · Critical Severity`
  - Window Pill: `Outcome: FAILED`
  - Callout Badge: `Deterministic Invariants Catch Blind Secondary Capture & Double Debits`
- **Audio:** Alert chime (`bong_001.ogg`).

### Beat 5: Diagnostic Engine & Proposed Code Diff (15.6s – 19.4s | Frame at 17.5s)
- **Framing:** Browser reveals `media/paypath-video-source/assets/screens/04-ai-diagnostics.png`.
- **Code Diff Highlighted:**
  - Drop-in safe reconciliation patch for `src/services/paypal-reconciliation.ts`:
  - Suppresses blind retry; queries `GET /v2/checkout/orders/{id}` before determining recovery.
- **Key Callouts:**
  - Focus Tag: `Drop-In Resilient Patch · Safe State Reconciliation`
  - Window Pill: `Diagnostic Engine · Safe State Reconciliation`
  - Callout Badge: `Diagnostic Engine · Generates Resilient Diffs & Automated Regression Tests`
- **Audio:** Soft typing click (`mouseclick1.ogg`).

### Beat 6: Branded Outro & Call to Action (19.4s – 23.0s | Frame at 20.5s)
- **Framing:** Minimalist brand closure card.
- **Elements:**
  - PayPath geometric monogram + wordmark.
  - Subtitle: *"Harden your PayPal integration before going to production."*
  - Capability Badges: `PayPal Orders v2 REST` · `10 Safety Invariants` · `Diagnostic Rule Engine` · `MIT Open Source`
- **Audio:** Resonant final chime (`impactBell_heavy_000.ogg`) with smooth audio fade-out to 23.0s.

---

## ⚖️ Claims & Verification Ledger

| Feature Shown in Video | Runtime Evidence Status | Verification Method |
| :--- | :--- | :--- |
| **Real PayPal Sandbox Order** | `[VERIFIED]` | Persisted real Sandbox order settled at `$10.00 USD` via PayPal Sandbox Orders v2 API. |
| **Scenario C Chaos Setup** | `[VERIFIED]` | Screen `02-scenario-lab.png` captured directly from running app showing Scenario C with `Fault Injection` mode and `Unfixed Baseline` selected. |
| **Invariant Violation** | `[VERIFIED]` | Scenario C fault run evaluated invariant `INV-002` to `false` with severity `CRITICAL`. |
| **Diagnostic Code Diff** | `[VERIFIED]` | Unified Git diff generated for `src/services/paypal-reconciliation.ts` authoritatively reconciling order status. |
| **Diagnostic Attribution** | `[VERIFIED]` | Correctly labeled as **Diagnostic Analysis & Fix Studio** and **Deterministic Rule Engine**. No unsupported AI/Gemini 2.5 Flash claims or fabricated confidence percentages. |
| **Privacy & Security** | `[VERIFIED]` | Public video frames mask Sandbox order (`3JL9••••••••362V`) and capture IDs (`1TU9••••••••614Y`); zero credentials or tokens exposed. |

---

## 🎵 Sound & Media Attribution

- **Background Music:** "Happy Beats & Business Moves Vol. 12" by Sascha Ende  
  *Source:* [ende.app](https://ende.app)  
  *License:* [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)  
  *Permitted Use:* CC BY 4.0 permits synchronization, cutting, and public distribution in finished audiovisual deliverables (`media/paypath-product-launch.mp4`).
- **Sound Effects:** Interface & Impact Audio Library by [Kenney](https://kenney.nl)  
  *License:* [Creative Commons Zero (CC0 1.0 Universal - Public Domain Dedication)](https://creativecommons.org/publicdomain/zero/1.0/)

---

## 📦 Video Composition Source & Re-Rendering Notice

- **Pre-Rendered Deliverable:** The final 23-second launch video (`media/paypath-product-launch.mp4`) and poster (`media/paypath-product-launch.jpg`) are provided ready-to-watch and fully verified.
- **Raw Audio Exclusion:** Standalone, raw music and SFX audio files (`media/paypath-video-source/assets/music/` and `media/paypath-video-source/assets/sfx/`) are **intentionally excluded from public Git tracking** via `.gitignore` to comply with stock media redistribution hygiene.
- **Re-Rendering:** To re-render the Hyperframes composition from `media/paypath-video-source/index.html`, supply the background track from [ende.app](https://ende.app) and SFX from [kenney.nl](https://kenney.nl) into `assets/music/` and `assets/sfx/`, or point the composition to alternative local audio assets.

