# AsafOS TODO

This file is the operating checklist for the new `AsafOS - Codex` workspace.

## Purpose

This rebuild is meant to become the clean source of truth for AsafOS going forward.

The project now has two responsibilities:

1. Present Asaf Axelrod as a serious software candidate.
2. Stay simple enough to update quickly before applications.

## Current Structure

```text
frontend/
  Static portfolio site
  Content-driven via JSON in frontend/data/

backend/
  Optional Spotify proxy
  Only needed for live music data
```

## To Do List

### High Priority

- Replace placeholder/general phrasing in `frontend/data/site-content.json` with final resume-grade wording.
- Decide which 2-4 real projects should appear on the site.
- Add a dedicated projects section once the project list is finalized.
- Verify all dates, role names, and education wording against your real resume.
- Rotate Spotify credentials if any old secrets were ever committed or deployed.

### Medium Priority

- Decide whether music widgets help or distract from the hiring narrative.
- Replace `frontend/data/updates.json` with real career/project updates over time.
- Add a downloadable PDF resume link.
- Add deployment config for the new folder so hosting does not point at stale files.
- Add analytics only if you have a concrete reason to track visits.

### Low Priority

- Add favicon/app icon variants.
- Add OG/social metadata image for link previews.
- Add a contact section with email or a controlled outreach channel.
- Add automated JSON refresh scripts if you want this site to stay dynamic.

## Explanations

### Why the frontend is static

The portfolio does not need a frontend build system unless you want one. Static files are easier to host, debug, and update quickly before sending applications.

### Why the backend is optional

Live Spotify data is not core to the hiring story. It can be kept as an enhancement without becoming a dependency for the whole site.

### Why content lives in JSON

Resume updates usually mean content changes, not code changes. Keeping the profile data centralized makes edits faster and safer.

## Suggested Workflow

1. Update `frontend/data/site-content.json`.
2. Preview the site locally.
3. Make any layout/copy adjustments.
4. Deploy only the `frontend/` directory.
5. Treat the backend as an optional separate deploy if live Spotify is still wanted.

## Open Questions To Decide Later

- Keep or remove the Spotify section?
- Keep or remove the gallery?
- Add project cards or a case-study section?
- Should the site feel more like a resume, a personal dashboard, or a portfolio?
