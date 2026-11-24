# Geographic-data license scope

The [MIT software license](LICENSE) does **not** relicense third-party geographic data.

| Files / contribution | Applicable terms |
| --- | --- |
| `data/raw/building*.parquet`, `land.parquet`, `water.parquet`, `land_use.parquet`, `infrastructure.parquet`, `segment.parquet`, `division*.parquet` | ODbL-1.0, as specified by the pinned Overture catalogs; retain upstream attributions |
| `data/raw/campus-boundary.geojson` | ODbL-1.0; derived from the Overture / OpenStreetMap university land-use feature |
| `data/raw/land_cover.parquet` | CC-BY-4.0, as specified by its pinned STAC catalog; ESA WorldCover / Copernicus attribution |
| `data/raw/place.parquet` | Per-record source terms: CDLA-Permissive-2.0, Apache-2.0 and CC0-1.0; original `sources` metadata retained |
| Derived geometry, coordinates and geographic indexes in `web/data/tinyhkust/` (including the native Street Walk data) | ODbL-1.0 for this project's derivative-database contribution, without replacing the independent contents' CC-BY / CDLA / Apache / CC0 terms above |
| Project-authored descriptive text in sight / quiz JSON | CC-BY-4.0; original summaries and source links, not copied Wikipedia article text |
| Raster PNG / WebP / JPEG files | See [MAPS_LICENSE.md](MAPS_LICENSE.md); source-database attribution and rights remain applicable |

The source snapshot is included so recipients can access the underlying geographic extract and modify or regenerate the map. Individual source layers remain separate in `data/raw/`; do not remove their notices or claim that this repository's MIT license covers them.

The extract uses Overture **2026-10-21.0** and the WGS84 bounding box west **114.2525**, south **22.328**, east **114.274**, north **22.3435**. Features intersecting that box may extend outside it. This is an extraction, not a clipped official cadastral dataset. The pixel renderer subsequently uses the mapped university boundary and its edge-fog settings.

Source URLs and catalog license values: [data/sources.json](data/sources.json). File integrity: [data/checksums.json](data/checksums.json). Source-specific and software notices: [ATTRIBUTION.md](ATTRIBUTION.md). Full license texts: [LICENSES/](LICENSES/).
