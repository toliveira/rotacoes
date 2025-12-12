# Testing Checklist

## Mobile
- Verify responsive layouts at common breakpoints (375, 768, 1024, 1280).
- Validate touch interactions, overlays, and scroll.
- Confirm viewport meta is present.

## Cross‑Browser
- Test latest Chrome, Firefox, Safari, Edge.
- Validate forms, file uploads, tRPC calls, and animations.

## Firebase Local
- Ensure `.env.local` contains client keys.
- Verify Admin SDK via `/api/firebase/health` and page `/system/health`.

