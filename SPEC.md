# Pose Me — Product Spec (v0.1)

## 1) Summary
**Pose Me** is a mobile app that helps people take better Instagram-style photos *fast* by giving the photographer a clear reference (a curated pose/setup card) while shooting.

The app’s core idea is simple:
- Browse a library of proven pose + setup references (real photo examples).
- Open the camera.
- If a reference is selected, show it as a **Picture-in-Picture (PiP) card** while you shoot.
- Capture a quick burst, pick the best shot, and share.

**Key principle:** Start without AI. Win on UX + curated references. Add AI later only if there is traction.

---

## 2) Goals
### Primary goal
Help the photographer quickly direct and capture a photo that looks “Instagram-ready” without friction, arguments, or endless retakes.

### Secondary goals
- Reduce time-to-good-shot (fewer attempts).
- Make photo-taking feel structured and fun.
- Create a repeatable habit (use the app every time you want a good photo).

---

## 3) Non-goals (for MVP)
- Replacing the native camera’s quality (HDR/night mode/etc.).
- Generating realistic edited photos of the person (no deepfake-style edits in MVP).
- Heavy social features (following, comments, etc.).

---

## 4) Target users
- People who frequently take photos of friends/partners for Instagram.
- Travelers and content creators who want “quick wins” in composition and posing.
- Anyone who feels they "don’t know how to pose" or "don’t know how to shoot".

---

## 5) Core UX & User flows

### 5.1 Home / Library (default screen)
**Purpose:** Browse pose references and choose one fast.

**Layout concept:**
- Scroll feed/grid of **Pose Cards** (real photo examples).
- Bottom navigation:
  - **Library** (browse)
  - **Camera** (center primary button)
  - **Favorites**

**Pose Card contains:**
- Reference photo (real example; subject identity is irrelevant).
- Short title (e.g., “Casual Lean”, “Walk Candid”, “Street Portrait 2x”).
- Tags (small chips):
  - Pose style (e.g., Natural / Elegant / Playful)
  - Scenario (Street / Cafe / Travel / Couple)
  - Shot type (Full body / Half body / Portrait)
- “Setup tips” preview (1 line max, e.g., “2x • phone at chest • 45° light”).

**Actions:**
- Tap card → selects it (visual highlight) and shows a “Selected” state.
- Tap heart → add/remove favorite.
- Optional filter chips at top: Scenario, Shot type, Style.

---

### 5.2 Camera (no selection)
If the user opens the camera without selecting a card:
- The app opens a **clean camera view**.
- No PiP card.
- User can still shoot normally.

This is important: the app remains useful even if the user just wants the camera quickly.

---

### 5.3 Camera (with selection)
If a Pose Card is selected, opening the camera shows:

**A) Full camera preview**
- Minimal controls.

**B) PiP reference card (the key feature)**
- A small **floating card** showing:
  - The selected reference image
  - 1–2 short tips (super short, like a director):
    - “Weight on back leg”
    - “Chin slightly down”
- The PiP card must be:
  - **Draggable** (so it doesn’t cover the subject)
  - **Minimizable** (collapse to a tiny icon)
  - Tappable to expand again

**C) Primary capture controls**
- Big shutter button centered.
- Optional “Burst x3” mode (recommended default):
  - One tap captures 3 photos quickly.
  - The purpose is to reduce micro-blinks and increase the chance of a good frame.

**D) Quick swap (optional MVP+)**
- A small “Next” button to cycle to the next card in the current pack/filter.

---

### 5.4 After capture: Quick pick
**Goal:** Get to a shareable result immediately.

If Burst x3 is used:
- Show a simple picker screen with the 3 shots.
- User selects 1 (or 2) and taps **Share**.

If single shot:
- Show the last shot with “Share” and “Retake”.

---

### 5.5 Favorites
**Purpose:** Keep your go-to poses.

- Simple list/grid of favorited cards.
- Same behavior: select → open camera with PiP.

---

## 6) Content model (Pose Cards)
Pose Cards are curated references. The value is quality + clarity.

Each card includes:
- **Reference image** (real photo example)
- **Title**
- **Tags**
  - Scenario (Street/Cafe/Travel/etc.)
  - Shot type (Full/Half/Portrait)
  - Style (Natural/Elegant/Playful)
- **Setup recipe** (short, readable):
  - Suggested zoom (e.g., “2x if available; otherwise step back”)
  - Phone height (chest/eyes/waist)
  - Light direction (front/45°/backlight)
  - Background note (clean/lines/contrast)
- **Pose tips** (max 2–3 lines)

---

## 7) MVP feature list
### Must-have (v0.1)
- Library screen with pose cards
- Select a card
- Favorites
- Camera screen
- PiP reference card visible when selection exists
- Draggable + minimizable PiP card
- Capture photo
- Quick pick flow (especially for burst)
- Share/export photo

### Nice-to-have (v0.2)
- Packs (Street/Cafe/Travel) + filters
- “Next pose” cycling in camera
- Burst x3 as default with a toggle
- Micro copywriting improvements (tips that don’t feel cringe)

---

## 8) Success metrics (early traction)
- **Time to first photo**: how fast from open → capture
- **Burst usage rate**: % of sessions using burst
- **Share rate**: % sessions that share at least one photo
- **Return rate (D1/D7)**: do users come back to use it again
- **Favorites created**: indicates value and habit

---

## 9) Monetization (not required for MVP, but planned)
- Freemium:
  - Free: limited packs + basic camera
  - Paid: all packs + premium pose collections
- Alternative: one-time purchase (simple)

---

## 10) AI roadmap (only after traction)
The app should earn the right to use AI.

Potential AI upgrades:
1) **Smart card suggestions**: based on scenario/shot type selected by user.
2) **Pose sketch coach**: show 3 stick-figure references + tips (no identity editing).
3) **Quality checks**: horizon tilt, cut-off feet/head warnings.

Avoid for a long time:
- Realistic “generate new photos of the person” (identity risk, store policy risk, quality variability).

---

## 11) Brand & naming
Working name: **pose-me**.

Brand tone:
- Fast, practical, not cringe.
- “Photographer coaching” vibe.
- Clear, minimal UI.

---

## 12) Open questions
- Initial content: how many cards to launch with? (Suggested: 40–80)
- Do we start Android-first or cross-platform?
- Do we bundle scenario packs on day 1 or keep a single feed?
- Should burst be default?
