<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Normalize catalog, agency and manually entered measurements through `Observation` before rendering `WaterProfile`, so source, missing values and comparison eligibility remain consistent.
- Saved-place bookmarks are explicitly session-only in-memory snapshots until persistent accounts are connected; do not imply storage across reloads or automatic alerts.
- Source shared product images, component lists and displayed prices from the product catalog to keep home and collection views consistent.
- Keep kit selection hash-addressable on `/product` and show one selected kit at a time, so homepage links and browser history retain the chosen kit without repeating long sections.
- Treat catalog waterways as location references only; public measurements and history must originate from agency responses or explicitly user-entered observations.
- Request public USGS history directly from its unauthenticated OGC endpoint; normalize finite observations by sensor series and disclose response limits rather than fabricate gaps.
- Recover stale lazy-loaded assets with a rate-limited browser reload and a full-reload retry button so old open tabs can reach the current deployment.

- Normalize USGS station records by parameter code with per-metric timestamps and newest finite values; this prevents incomplete profiles and mixed sensor ages.
- Bound public USGS pagination and disclose partial responses; nearby station observations stay separate from catalog locations to avoid false attribution.
- Use shared aquatic-life screening rules for measurement tags; never apply universal good/bad labels to context-dependent measurements.
- Keep the Atlas catalog selection independent of geocoded search, with stale-response guards so list clicks cannot be overwritten by pending searches.
- Load the enlarged station map through a dedicated browser-initialized Leaflet component; it shows the exact station coordinates without duplicating the Atlas data controls.
