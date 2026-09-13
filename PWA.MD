# PWA Implementation Plan — Chee Time Tracker

## Overview

Enable installability for the Next.js 15 Time Tracker app using Next.js's built-in PWA support — no third-party plugins required.

Reference: [Next.js 15 PWA Guide](https://nextjs.org/docs/15/app/guides/progressive-web-apps)

---

## Step 1 — Create the Web App Manifest

Create `src/app/manifest.ts` using Next.js's native `MetadataRoute.Manifest` support.

## Step 2 — Generate Icon Assets

Create `public/icons/` with 192px and 512px PNG icons derived from the existing `logo.svg`.

## Step 3 — Update `layout.tsx`

Add `viewport` export with `themeColor` and Apple-specific meta tags for iOS install support.

## Step 4 — Add Security Headers to `next.config.js`

Configure service worker headers and general security headers.

## Step 5 — Create Minimal Service Worker

Create `public/sw.js` as a no-op file — required by some browsers for installability.

---

## Files Modified / Created

| Action | File |
|--------|------|
| **Create** | `src/app/manifest.ts` |
| **Create** | `public/icons/icon-192.png` |
| **Create** | `public/icons/icon-512.png` |
| **Create** | `public/sw.js` |
| **Modify** | `src/app/layout.tsx` (add `viewport` export, Apple meta tags) |
| **Modify** | `next.config.js` (add security headers) |

---

## Validation

1. `npm run build` — confirm no errors.
2. Open Chrome DevTools → Application tab — verify manifest detected.
3. Run Lighthouse audit (PWA category) — target passing installability score.
