# Relationship to tinyworlds

Upstream: https://github.com/nihey/tinyworlds

Author: Nihey Takizawa. License: MIT. Pinned source commit: `0d48a72688875b9642dca48ea63405f0704e40de`.

`vendor/tinyworlds-pipeline/` contains the TypeScript generation pipeline from that commit, including its existing tests and city definitions. The original `LICENSE` is preserved. The upstream frontend, API, donation infrastructure, deployment configuration and videos are not vendored; this project uses a small standalone viewer instead.

## Changes in the vendored directory

- Added `src/cities/tinyhkust.ts` and `tinyhkust.places.ts` and registered the city in `src/cities/index.ts`.
- Added `src/sources/overture-stac.ts`, which reads only the official spatial partitions selected for the campus. Provider metadata is retained in new downloads.
- Added the HKUST inspection, preparation, export and localized-index scripts at the pipeline root.
- Made paths in those HKUST scripts point to this repository's `web/` directory.

The shared projection, geometry processing, scene builder, palette, rasterizer, tile renderer and Street Walk generator are inherited from upstream. No independent authorship of those algorithms is claimed. The existing upstream city definitions remain available to the pipeline, but this repository only bundles map data for HKUST.

`scripts/serve.mjs`, `scripts/generate.mjs`, `scripts/check.mjs`, the static viewer and project documentation are project-specific additions. [UPSTREAM.json](../UPSTREAM.json) records the source version and changes in machine-readable form.

When updating upstream, preserve its copyright and license, review any source changes, run the asset/server checks and rebuild the HKUST map before replacing the pinned provenance entry. Review upstream data-schema changes separately from rendering-code changes.
