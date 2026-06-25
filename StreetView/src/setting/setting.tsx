/** @jsx jsx */
import {
  React,
  jsx,
  type AllWidgetSettingProps
} from 'jimu-core'
import {
  MapWidgetSelector,
  SettingSection,
  SettingRow
} from 'jimu-ui/advanced/setting-components'
import { TextInput, NumericInput, Switch, Label } from 'jimu-ui'
import { type IMConfig } from '../config'
import defaultMessages from './translations/default'
import { hooks } from 'jimu-core'

export default function Setting (props: AllWidgetSettingProps<IMConfig>): React.ReactElement {
  const translate = hooks.useTranslation(defaultMessages)
  const { config, id, onSettingChange, useMapWidgetIds } = props

  const onMapSelected = (ids: string[]) => {
    onSettingChange({ id, useMapWidgetIds: ids })
  }

  const setField = (field: string, value: any) => {
    onSettingChange({ id, config: config.set(field, value) })
  }

  return (
    <div className="widget-setting-street-view">
      <SettingSection title={translate('settingMapSource')}>
        <SettingRow>
          <MapWidgetSelector
            useMapWidgetIds={useMapWidgetIds}
            onSelect={onMapSelected}
          />
        </SettingRow>
      </SettingSection>

      <SettingSection title={translate('settingStreetView')}>
        <SettingRow label={translate('settingSnap')}>
          <Switch
            checked={config.snapToNearest}
            onChange={(e) => { setField('snapToNearest', e.target.checked) }}
          />
        </SettingRow>

        {config.snapToNearest && (
          <SettingRow label={translate('settingSnapRadius')}>
            <NumericInput
              min={10}
              max={1000}
              step={10}
              value={config.snapRadius}
              onChange={(v) => { setField('snapRadius', v ?? 200) }}
            />
          </SettingRow>
        )}

        <SettingRow label={translate('settingCenter')}>
          <Switch
            checked={config.centerMapOnClick}
            onChange={(e) => { setField('centerMapOnClick', e.target.checked) }}
          />
        </SettingRow>
      </SettingSection>

      <SettingSection title={translate('settingGoogle')}>
        <SettingRow>
          <Label style={{ fontSize: 12, opacity: 0.85 }}>
            {translate('settingApiKeyHint')}
          </Label>
        </SettingRow>
        <SettingRow label={translate('settingApiKey')}>
          <TextInput
            type="password"
            value={config.googleApiKey}
            onChange={(e) => { setField('googleApiKey', e.target.value) }}
            style={{ width: '100%' }}
          />
        </SettingRow>
      </SettingSection>
    </div>
  )
}
