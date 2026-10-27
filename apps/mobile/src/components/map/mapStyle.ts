/**
 * Mapbox Style Spec JSONs built on free Gaode (AMap) raster tiles — no Mapbox
 * account, no token, and fast inside mainland China where Mapbox tiles crawl.
 * Passed to MapView via `styleJSON` (the native impl stays "mapbox"; the SDK
 * never contacts Mapbox servers with a raster-only style, so the empty token
 * is fine).
 *
 * Gaode tiles are GCJ-02: every WGS-84 coordinate must go through
 * `wgs84ToGcj02` before being handed to the map (see utils/gcj02.ts).
 *
 * Tile URL notes (undocumented Gaode endpoints, stable for years):
 * - webrd0{1-4}.is.autonavi.com …style=8  street map (labels baked in)
 * - webst0{1-4}.is.autonavi.com …style=6  satellite imagery
 * - webst0{1-4}.is.autonavi.com …style=8  transparent road/label overlay,
 *   drawn on top of the satellite layer so imagery stays readable
 */

type RasterStyle = {
  version: 8;
  sources: Record<string, { type: 'raster'; tiles: string[]; tileSize: 256; minzoom: number; maxzoom: number }>;
  layers: Array<{ id: string; type: 'background' | 'raster'; source?: string; paint?: object }>;
};

const streetTiles = [1, 2, 3, 4].map(
  (n) => `https://webrd0${n}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}`,
);

const satelliteTiles = [1, 2, 3, 4].map(
  (n) => `https://webst0${n}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}`,
);

const satelliteRoadTiles = [1, 2, 3, 4].map(
  (n) => `https://webst0${n}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}`,
);

export const STREET_STYLE: RasterStyle = {
  version: 8,
  sources: {
    amapStreet: { type: 'raster', tiles: streetTiles, tileSize: 256, minzoom: 3, maxzoom: 18 },
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#e8ecef' } },
    { id: 'amapStreet', type: 'raster', source: 'amapStreet' },
  ],
};

export const SATELLITE_STYLE: RasterStyle = {
  version: 8,
  sources: {
    amapSat: { type: 'raster', tiles: satelliteTiles, tileSize: 256, minzoom: 3, maxzoom: 18 },
    amapSatRoad: { type: 'raster', tiles: satelliteRoadTiles, tileSize: 256, minzoom: 3, maxzoom: 18 },
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#1c2126' } },
    { id: 'amapSat', type: 'raster', source: 'amapSat' },
    { id: 'amapSatRoad', type: 'raster', source: 'amapSatRoad' },
  ],
};
