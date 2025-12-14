Summary of UI changes (Requested by Aiman)

Branch: feat/ui/swap-history-tabs-24h-availability

TL;DR
- Badges for item states now behave as follows:
  - "Unavailable" is shown for items with status `swapped` or `locked` (accepted/unavailable).
  - "Pending" is shown for items with status `pending` (requested but unresolved).
- The badge labels are centered over the item image and stacked vertically when more than one applies.
- A dark overlay (rgba(0,0,0,0.6)) is rendered under the badges for `pending`/`unavailable` items so the items beneath appear darker while the badges remain fully opaque on top.
- Pending and unavailable items are visually de-emphasised (darker overlay) and hover-scale is disabled for them.
- Tests added: `Frontend/src/components/ListingCard.test.js` verifies pending/swapped badge rendering and overlay presence.

Files changed (high-level)
- Frontend/src/components/ListingCard.js — status logic, overlay + centered badges, disable hover-scale for faded items
- Frontend/src/app/globals.css — stronger/darker overlay styling (`.unavailable-overlay`), adjust `.listing-unavailable`
- Frontend/swapcircle-app-current.html — demo markup updated to include overlay and centered badges
- Frontend/src/components/ListingCard.test.js — tests for updated behavior

Why
- Previously `pending` was considered part of `unavailable` which greyed-out pending items and showed the wrong visual state.
- The new overlay approach keeps badges readable and provides stronger contrast between available and non-available items, per Aiman's design request.

How to verify locally
1. git fetch origin && git checkout feat/ui/swap-history-tabs-24h-availability
2. Start the frontend dev server and navigate to the browse/listing views
3. Check:
   - Items with status `pending` show the centered "Pending" badge and have the dark overlay under the badge
   - Items with status `swapped` or `locked` show the centered "Unavailable" badge and same overlay
   - Badges are fully opaque (not faded) while items below are darkened
4. Unit tests (if frontend test scripts are set up) include `ListingCard` tests that assert badge + overlay presence

Notes
- If you'd like the overlay alpha tuned (lighter/darker) or the badge size/spacing changed, I can quickly iterate.
- I also added a few tests; consider adding a visual regression snapshot (Storybook/Chromatic or jest-image-snapshot) in a follow-up to prevent style regressions.

Committed for Aiman's review.
