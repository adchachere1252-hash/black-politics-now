# Historical Atlas Boundary Availability Finding

On August 14, 2026, the live public Atlas was reproduced at `/atlas?congress=104&overlay=member`.

The state-level Alabama boundary viewer loaded its repository-backed 103rd–107th Congress file, while the national `/api/atlas/bundle/104` request failed and triggered the public temporary-unavailable fallback. The repair must make the national bundle independent of a transient upstream fetch failure and preserve the existing repository-backed provenance.
