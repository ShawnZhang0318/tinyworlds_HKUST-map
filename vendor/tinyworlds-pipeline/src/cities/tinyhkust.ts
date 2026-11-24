import { SOCAL } from "../scene/styles.js";
import { R } from "../render/palette.js";
import { Pattern } from "../scene/kinds.js";
import { overtureStac } from "../sources/overture-stac.js";
import { CURATED } from "./tinyhkust.places.js";
import type { City, Polygons } from "./types.js";

// Clear Water Bay campus and its immediate coast; coordinates are WGS84.
const bbox = { west: 114.2525, south: 22.328, east: 114.274, north: 22.3435 };
const polygons: Polygons = [[[[bbox.west, bbox.south], [bbox.east, bbox.south],
  [bbox.east, bbox.north], [bbox.west, bbox.north], [bbox.west, bbox.south]]]];

export const tinyhkust: City = {
  id: "tinyhkust",
  title: "HKUST · Clear Water Bay",
  origin: { lon: 114.2635, lat: 22.3364 },
  // Main academic-building edges are aligned with the cardinal directions (measured from its footprint).
  gridDeg: 0,
  k: 3,
  bbox,
  start: { lon: 114.2635, lat: 22.3364, scale: 0.5 },
  maxScale: 4,
  attribution: ["© OpenStreetMap contributors", "Overture Maps Foundation", "tinyworlds · MIT"],
  sources: [overtureStac],
  accent: "#e77b47",
  card: { lon: 114.2635, lat: 22.3364, shrink: 4 },
  limits: { kind: "geojson", file: "campus-boundary.geojson" },
  fog: { start: 45, end: 180 },
  areas: () => ({ districts: [{ name: "HKUST · 清水湾", polygons }], hoods: [] }),
  heights: { storey: 3.5, raster: false, floorsFirst: true },
  style: { ...SOCAL, civicWalls: [R.whiteBrick, R.cream], midWalls: [R.whiteBrick, R.cream, R.limestone], flatRoofs: [R.roofWhite, R.roofGravel], lowPitched: 0 },
  landmarks: {
    "學術大樓 academic building": { wall: R.cream, roof: R.roofWhite, glass: R.glassBlue, pattern: Pattern.Ribbon },
    "逸夫演藝中心 shaw auditorium": { wall: R.whiteBrick, roof: R.roofWhite, glass: R.glassTeal },
  },
  // Schematic pixel sculpture at its mapped artwork point, not a surveyed sculptural model.
  statues: [{ lon: 114.2629606, lat: 22.3374255, base: 0, pieces: [
    { dp: 0, dq: 0, from: 0, to: 0.5, hp: 4, hq: 4, ramp: "white" },
    { dp: 0, dq: 0, from: 0.5, to: 5, hp: 0.6, hq: 0.7, ramp: "body" },
    { dp: -1.5, dq: 0, from: 3.5, to: 4.3, hp: 2.4, hq: 0.45, ramp: "body" },
    { dp: 1.2, dq: 0, from: 4, to: 5.3, hp: 1.8, hq: 0.45, ramp: "body" },
  ] }],
  colors: { libertyGreen: "#c54e3e" },
  roofs: { waterTanks: false },
  trees: { street: { spacing: 12, chance: 0.35 } },
  flora: "subtropical",
  ground: {},
  walk: true,
  curated: CURATED,
  sights: { placeWords: ["HKUST", "Hong Kong", "Clear Water Bay"] },
  flights: [],
  search: {
    districtOnly: false,
    bridge: /bridge|連廊|天橋/i,
    stationSuffix: null,
    namedBuildings: { minHeight: 4, classes: ["university", "college", "library", "school", "civic", "public"] },
  },
};
