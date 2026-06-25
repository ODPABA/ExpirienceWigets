/**
 * streetViewUtils.ts
 * -------------------------------------------------------------------------
 * Transformácia kliknutého bodu na WGS84 (vrátane EPSG:5514 Krovak East North
 * a EPSG:8353 JTSK03) a otvorenie Google Street View v novom okne.
 *
 * Bez API kľúča a bez snapu. Street View odkaz mieri na presne kliknutý bod;
 * Google pri otvorení obvykle sám priblíži na najbližšiu dostupnú panorámu.
 * -------------------------------------------------------------------------
 */

import { loadArcGISJSAPIModules } from 'jimu-arcgis'

export interface LatLon {
  lat: number
  lon: number
}

/**
 * Geografická transformácia (WKID) na WGS84 pre slovenské/české systémy.
 *  EPSG:5514 (S-JTSK / Krovak East North)        -> 1623  (alt. presnejšia 8364)
 *  EPSG:8353 (S-JTSK [JTSK03] / Krovak East North) -> 8365
 * Pre ostatné systémy vraciame null = projection zvolí predvolenú.
 *
 * Pozn.: ArcGIS používa holé číselné WKID bez prefixu "EPSG:".
 * WKID 5514 je totožné s EPSG:5514.
 */
function pickTransformationWkid (inputWkid: number): number | null {
  switch (inputWkid) {
    case 5514: // EPSG:5514 — S-JTSK / Krovak East North
      return 1623
    case 8353: // EPSG:8353 — S-JTSK [JTSK03] / Krovak East North
      return 8365
    default:
      return null
  }
}

/** Univerzálny prevod esri Point (z mapView) na WGS84 lat/lon. */
export async function toWgs84 (point: __esri.Point): Promise<LatLon> {
  const sr = point.spatialReference

  if (sr?.wkid === 4326 || sr?.isWGS84) {
    return { lat: point.y, lon: point.x }
  }

  if (sr?.isWebMercator) {
    const [webMercatorUtils] = await loadArcGISJSAPIModules([
      'esri/geometry/support/webMercatorUtils'
    ])
    const geo = webMercatorUtils.webMercatorToGeographic(point) as __esri.Point
    return { lat: geo.y, lon: geo.x }
  }

  // Čokoľvek iné vrátane S-JTSK 5514 a JTSK03 8353.
  const [projection, SpatialReference, GeographicTransformation] =
    await loadArcGISJSAPIModules([
      'esri/geometry/projection',
      'esri/geometry/SpatialReference',
      'esri/geometry/support/GeographicTransformation'
    ])

  await projection.load()

  const wgs84 = new SpatialReference({ wkid: 4326 })

  let transformation: __esri.GeographicTransformation | undefined
  const tWkid = pickTransformationWkid(sr?.wkid)
  if (tWkid != null) {
    try {
      transformation = new GeographicTransformation({ wkid: tWkid })
    } catch {
      transformation = undefined
    }
  }

  const projected = projection.project(point, wgs84, transformation) as __esri.Point
  if (!projected) {
    throw new Error(`Nepodarilo sa transformovať bod (wkid=${sr?.wkid}) na WGS84.`)
  }
  return { lat: projected.y, lon: projected.x }
}

/** ToS-kompatibilný Street View deep-link (otvára sa v novom okne). */
export function buildStreetViewUrl (ll: LatLon): string {
  return (
    'https://www.google.com/maps/@?api=1&map_action=pano' +
    `&viewpoint=${ll.lat},${ll.lon}`
  )
}

/** Transformuj kliknutý bod a otvor Street View v novom okne. */
export async function openStreetViewForPoint (point: __esri.Point): Promise<void> {
  const wgs = await toWgs84(point)
  const url = buildStreetViewUrl(wgs)
  window.open(url, '_blank', 'noopener,noreferrer')
}
