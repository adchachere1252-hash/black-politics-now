# Historical Atlas Boundary Availability Finding

On August 14, 2026, the live public Atlas was reproduced at `/atlas?congress=104&overlay=member`.

The state-level Alabama boundary viewer loaded its repository-backed 103rd–107th Congress file, while the national `/api/atlas/bundle/104` request failed and triggered the public temporary-unavailable fallback. The repair must make the national bundle independent of a transient upstream fetch failure and preserve the existing repository-backed provenance.

After the first production repair, the compressed national bundle still returned HTTP 500 through the public proxy. The all-state client fallback also reached its error path, so at least one of the 50 individual historical boundary requests cannot be relied upon as a public runtime dependency. The final repair therefore needs durable, platform-hosted historical boundary assets rather than live aggregation of upstream raw files.
