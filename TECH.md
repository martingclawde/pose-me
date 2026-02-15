# Pose Me — Tech Notes (v0.1)

This document proposes a practical, iteration-friendly stack for **Pose Me**.

## Goals
- Fast iteration speed (UI + content changes daily)
- Native-feeling camera experience
- Simple architecture (ship MVP, avoid over-engineering)
- Easy to evolve into AI-assisted features later

---

## Recommended stack (MVP)
### App framework
- **React Native**
- **TypeScript**

Rationale: fastest cross-platform iteration while keeping a native UX.

### Camera
- **react-native-vision-camera**

Rationale: strong performance and a camera API that feels closer to native than typical wrappers.

### Navigation
- **React Navigation**

### State management
- Start simple with:
  - React state + hooks
  - (Optional) **Zustand** if the app state starts spreading (favorites, selected pose, filters).

### Persistence
- **AsyncStorage** for MVP (favorites, last selected card, onboarding flags)
- If we need structured offline content and queries later:
  - **SQLite** (e.g., `react-native-sqlite-storage`) or WatermelonDB

### Content model
- Pose cards shipped as a local JSON file for MVP (easy to iterate)
- Optionally pulled remotely later:
  - simple CDN-hosted JSON, or
  - Firebase/Firestore, or
  - a tiny backend.

### Styling / UI
- Keep it simple:
  - **StyleSheet** or **NativeWind** (Tailwind-like) if we want speed
- Minimal, Instagram-neutral design.

### Build & distribution
- Start with **EAS Build** (Expo Application Services) *if compatible* with Vision Camera.
  - If Expo Managed workflow blocks Vision Camera features, use **Expo prebuild / bare**.

---

## MVP implementation notes
### UX-critical features
- Library feed (pose cards)
- Selection state (selected card persists)
- Camera screen:
  - if no selection → normal camera
  - if selection → PiP reference card overlay (draggable + minimizable)
- Burst capture (x3) + quick pick + share

### PiP card
- A regular RN overlay on top of the camera preview.
- Must support:
  - drag (pan gesture)
  - minimize/expand
  - safe-area aware positioning

---

## AI roadmap (future)
Do not start with generative editing.

Potential next steps:
- Pose suggestion ranking (based on scenario/style)
- Quality checks:
  - horizon tilt
  - subject cropped (feet/head)
- "Pose sketch coach" (stick-figure references) using:
  - MediaPipe / MLKit Pose Detection

---

## Open questions
- Android-first validation vs iOS day-one
- Expo workflow constraints with `react-native-vision-camera`
- How we host/update the pose library (local JSON vs remote)
