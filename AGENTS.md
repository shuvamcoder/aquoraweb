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
- Keep kit imagery and descriptions aligned across the product and home pages; concept images must be identified and cannot establish sourcing cost or hardware specifications.
