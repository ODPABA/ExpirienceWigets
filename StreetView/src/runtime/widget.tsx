/** @jsx jsx */
import {
  React,
  jsx,
  type AllWidgetProps,
  hooks
} from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import { Button, Alert } from 'jimu-ui'
import defaultMessages from './translations/default'
import { openStreetViewForPoint } from './streetViewUtils'

const { useState, useRef, useCallback } = React

function Widget (props: AllWidgetProps<unknown>): React.ReactElement {
  const translate = hooks.useTranslation(defaultMessages)

  const [jimuMapView, setJimuMapView] = useState<JimuMapView>(null)
  const [active, setActive] = useState(false)
  const [status, setStatus] = useState<'idle' | 'working' | 'error'>('idle')
  const [hasMarker, setHasMarker] = useState(false)

  const clickHandle = useRef<__esri.Handle>(null)
  const graphicRef = useRef<__esri.Graphic>(null)

  // Dočasný marker na kliknutom bode.
  const showMarker = useCallback(async (point: __esri.Point) => {
    if (!jimuMapView?.view) return
    const { loadArcGISJSAPIModules } = await import('jimu-arcgis')
    const [GraphicCtor] = await loadArcGISJSAPIModules(['esri/Graphic'])
    if (graphicRef.current) {
      jimuMapView.view.graphics.remove(graphicRef.current)
    }
    const g = new GraphicCtor({
      geometry: point,
      symbol: {
        type: 'simple-marker',
        style: 'circle',
        size: 10,
        color: [0, 121, 193, 0.9],
        outline: { color: [255, 255, 255, 1], width: 1.5 }
      } as any
    })
    jimuMapView.view.graphics.add(g)
    graphicRef.current = g
    setHasMarker(true)
  }, [jimuMapView])

  const clearMarker = useCallback(() => {
    if (jimuMapView?.view && graphicRef.current) {
      jimuMapView.view.graphics.remove(graphicRef.current)
      graphicRef.current = null
      setHasMarker(false)
    }
  }, [jimuMapView])

  const handleMapClick = useCallback(async (event: __esri.ViewClickEvent) => {
    const point = event.mapPoint
    if (!point || !jimuMapView?.view) return

    setStatus('working')
    try {
      await showMarker(point)
      await openStreetViewForPoint(point)
      setStatus('idle')
    } catch (e) {
      console.error('Street View widget:', e)
      setStatus('error')
    }
  }, [jimuMapView, showMarker])

  const toggleActive = useCallback(() => {
    if (!jimuMapView?.view) return
    if (active) {
      clickHandle.current?.remove()
      clickHandle.current = null
      setActive(false)
      setStatus('idle')
    } else {
      clickHandle.current = jimuMapView.view.on('click', handleMapClick)
      setActive(true)
      setStatus('idle')
    }
  }, [active, jimuMapView, handleMapClick])

  hooks.useUnmount(() => {
    clickHandle.current?.remove()
  })

  const onActiveViewChange = useCallback((jmv: JimuMapView) => {
    clickHandle.current?.remove()
    clickHandle.current = null
    setActive(false)
    setJimuMapView(jmv)
  }, [])

  const useMapWidgetId = props.useMapWidgetIds?.[0]

  return (
    <div className="widget-street-view jimu-widget" style={{ padding: 10 }}>
      <JimuMapViewComponent
        useMapWidgetId={useMapWidgetId}
        onActiveViewChange={onActiveViewChange}
      />

      {!useMapWidgetId && (
        <Alert type="warning" open text={translate('noMapHint')} withIcon />
      )}

      {useMapWidgetId && (
        <React.Fragment>
          <Button
            type={active ? 'primary' : 'default'}
            onClick={toggleActive}
            disabled={!jimuMapView}
            style={{ width: '100%', marginBottom: 8 }}
          >
            {active ? translate('stopPicking') : translate('startPicking')}
          </Button>

          {active && (
            <div style={{ fontSize: 12, marginBottom: 8, opacity: 0.85 }}>
              {translate('clickHint')}
            </div>
          )}

          {hasMarker && (
            <Button
              type="tertiary"
              size="sm"
              onClick={clearMarker}
              style={{ width: '100%', marginBottom: 8 }}
            >
              {translate('clearMarker')}
            </Button>
          )}

          {status === 'working' && (
            <div style={{ fontSize: 12 }}>{translate('working')}</div>
          )}
          {status === 'error' && (
            <Alert type="error" open text={translate('error')} withIcon />
          )}
        </React.Fragment>
      )}
    </div>
  )
}

export default Widget
