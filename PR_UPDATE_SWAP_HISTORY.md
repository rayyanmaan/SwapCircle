### Update: Link `Swapped` counter to Swap History

What I changed:

- Ensured the profile `Swapped` counter reflects the number of completed swaps shown in the user's swap history.
- When fetching swap history in `Profile.js` (for the owner view), we now:
  - normalize and store the history in `swapHistory` state
  - update `user.swapped` to `swapHistory.length` so the counter matches the UI
  - set `user.swapped = 0` if fetching fails
- Added a `useEffect` to keep `user.swapped` in sync whenever `swapHistory` changes while the component is mounted.

Files modified:
- `Frontend/src/components/Profile.js` — set `user.swapped` after fetching swap history and added comments explaining the behavior.

Why:

- Previously `user.swapped` was initialized to 0 and never updated even though completed swaps appeared under the Swap History tab; this made the profile stats inconsistent and confusing. This change links the visible history list to the swapped counter and keeps them consistent.

Notes:

- This only affects the owner view (your own profile) where swap history is fetched authenticated; public profile view remains unchanged because swap history is not fetched for other users in the current flow.
- If we later implement real-time swap updates, we should refetch swap history (and thus `user.swapped`) when new swaps are completed.
