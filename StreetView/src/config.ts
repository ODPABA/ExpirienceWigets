import { type ImmutableObject } from 'jimu-core'

/**
 * Konfigurácia widgetu. Hodnoty sa nastavujú v settings paneli
 * a ukladajú do config.json danej aplikácie.
 */
export interface Config {
  /** Google Maps API kľúč s povoleným Street View Static API (pre snap). */
  googleApiKey: string
  /** Či sa má snapovať na najbližšiu dostupnú panorámu. */
  snapToNearest: boolean
  /** Hľadací okruh pre snap v metroch. */
  snapRadius: number
  /** Či sa má mapa po kliknutí vycentrovať na kliknutý bod. */
  centerMapOnClick: boolean
  /** Rezerva pre budúce rozšírenie režimu tlačidla. */
  buttonLabelMode: 'click'
}

export type IMConfig = ImmutableObject<Config>
