# Attribution and third-party notices

## tinyworlds

This project is **based on [tinyworlds](https://github.com/nihey/tinyworlds) by Nihey Takizawa**, released under the MIT License.

> Copyright (c) 2026 Nihey Takizawa

The vendored pipeline is derived from upstream commit [`0d48a72688875b9642dca48ea63405f0704e40de`](https://github.com/nihey/tinyworlds/tree/0d48a72688875b9642dca48ea63405f0704e40de). The original license is preserved verbatim in [vendor/tinyworlds-pipeline/LICENSE](vendor/tinyworlds-pipeline/LICENSE) and [LICENSES/tinyworlds-MIT.txt](LICENSES/tinyworlds-MIT.txt).

The original scene builder, projection, software rasterizer, pixel palette, shadowing and tile-pyramid algorithms come from tinyworlds. This repository adds the HKUST city definition, campus data extraction and reproducibility scripts, mapped landmarks, a schematic Red Bird, and the standalone Chinese viewer. The core renderer was not rewritten. This is an independent derivative project, not an official tinyworlds release.

See [UPSTREAM.json](UPSTREAM.json) for machine-readable provenance and [docs/UPSTREAM.md](docs/UPSTREAM.md) for the changes to the vendored source.

## Geographic data

**© OpenStreetMap contributors, Overture Maps Foundation.**

Contains information from [OpenStreetMap](https://www.openstreetmap.org/copyright) and [Overture Maps](https://overturemaps.org), including data made available under the [Open Database License 1.0](LICENSES/ODbL-1.0.txt). The exact extracted data used for this map is available in [data/raw/](data/raw/). Source release: **2026-10-21.0**. Extraction and map generation: **2026-11-25**.

The buildings, building parts, land, water, land use, infrastructure, transportation segments and divisions retain the ODbL-1.0 terms recorded by the pinned release's STAC catalogs. Original contributors included by Overture retain their own rights. This project's MIT source-code license does not replace those data licenses.

Land cover is identified as CC-BY-4.0 in its pinned STAC catalog. Credit: **© ESA WorldCover project 2020 / Contains modified Copernicus Sentinel data (2020) processed by ESA WorldCover consortium**, as stated in [Overture's attribution documentation](https://docs.overturemaps.org/attribution/#base). The copy of CC-BY-4.0 is in [LICENSES/CC-BY-4.0.txt](LICENSES/CC-BY-4.0.txt).

The Places catalog uses the value `other` because its records have multiple licenses. This repository retains the original `sources` column in `data/raw/place.parquet`. Providers present in this extract are:

| Provider in source records | License |
| --- | --- |
| Meta (`meta`) | CDLA-Permissive-2.0 |
| Overture (confidence metadata) | CDLA-Permissive-2.0 |
| Foursquare | Apache-2.0; preserve its [NOTICE](LICENSES/Foursquare-OS-Places-NOTICE.txt) |
| AllThePlaces | CC0-1.0 |

Foursquare data was transformed to the Overture schema by its upstream providers. This project extracted records intersecting the HKUST bounding box, retained records with confidence of at least 0.6, and generated the map's search index; source names and coordinates were not manually rewritten in the raw extract. Original provider metadata and the original extract's geometries were checked when preparing this release.

The full license texts are distributed in [LICENSES/](LICENSES/). [data/sources.json](data/sources.json) records the exact catalogs, source Parquet URLs, release and bounding box. [DATA_LICENSE.md](DATA_LICENSE.md) specifies how these terms apply to source and derived data.

## Original images and viewer

The standalone viewer and project-specific generation scripts are MIT-licensed. The project's original contributions to exported raster maps, raster tiles, landmark thumbnails and screenshots are provided under CC-BY-4.0; geographic data rights and upstream notices remain applicable. See [MAPS_LICENSE.md](MAPS_LICENSE.md).

Suggested credit when sharing an image:

> HKUST pixel map — ShawnZhang0318 / tinyworlds_HKUST. Based on tinyworlds by Nihey Takizawa (MIT). Map data © OpenStreetMap contributors, Overture Maps Foundation; contains ODbL data. Land cover © ESA WorldCover / Copernicus (CC BY 4.0). Map artwork: CC BY 4.0.

Include a link to this repository and this attribution file when the format permits.

## Campus reference

The [official HKUST campus map](https://publish.ust.hk/univ/maps/campus_map_color.pdf) was consulted to cross-check landmark names and locations. Its map image, logos and photographs are **not** bundled with this project. Mapped coordinates come from the released geographic data.

This is an unofficial community project. It is not affiliated with, endorsed by, or maintained by HKUST. University names and place names identify the real geographic subject; no university brand assets are relicensed here.
