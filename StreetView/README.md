# Street View widget (bez nastavení) pre ArcGIS Experience Builder

Po zapnutí a kliknutí do mapy otvorí Google Street View **v novom okne**.
Súradnice transformuje na WGS84 automaticky podľa projekcie mapy, vrátane
**S-JTSK (EPSG:5514)** a **S-JTSK [JTSK03] (EPSG:8353)**.

**Bez settings panela, bez API kľúča, bez snapu.** Len chyť, nasaď, prepoj
s mapou a funguje.

Licencia: Apache-2.0. Vlastný kód.

---

## Ako sa používa za behu

1. Widget musí byť prepojený s mapovým widgetom (pozri „Prepojenie s mapou").
2. Klikni na tlačidlo **„Vybrať bod na mape"** — aktivuje sa odber kliknutí.
3. Klikni do mapy → zobrazí sa značka a otvorí sa Street View v novom okne.
4. Tlačidlom „Zastaviť výber" odber vypneš, „Zmazať značku" odstráni marker.

Street View odkaz mieri na presne kliknutý bod; Google pri otvorení obvykle
sám priblíži na najbližšiu dostupnú panorámu. Embed iframe sa nepoužíva →
žiadny problém s §3.2.3(e) Google Maps Platform ToS.

---

## Prepojenie s mapou (dôležité — keďže nie sú nastavenia)

Bez settings panela sa mapa priraďuje cez rozloženie stránky:

- **Najjednoduchšie:** vlož Street View widget **do Mapového widgetu** ako
  jeho vnorený obsah (drag widgetu na plochu mapy). EXB ho automaticky naviaže
  na danú mapu cez `useMapWidgetIds`.
- **Alternatíva:** ak je na stránke len jedna mapa, EXB väčšinou prepojenie
  priradí sám pri prvom načítaní.

Ak widget hlási „Prepojte tento widget s mapovým widgetom", znamená to, že
zatiaľ nemá priradenú mapu — vlož ho do mapy podľa prvého bodu.

---

## Súradnicové systémy

Projekcia sa zisťuje za behu z `mapPoint.spatialReference`:

| Vstup mapy                 | Prevod na WGS84                          |
|----------------------------|-------------------------------------------|
| 4326                       | bez konverzie                             |
| Web Mercator (3857/102100) | webMercatorUtils                          |
| S-JTSK 5514                | projection engine, transformácia 1623     |
| S-JTSK JTSK03 8353         | projection engine, transformácia 8365     |
| iné                        | projection engine, predvolená             |

Ak Enterprise nemá WKID 1623/8365, kód spadne na predvolenú transformáciu
(rozdiel rádovo decimetre — pre Street View odkaz nepodstatné).

---

## Nasadenie na ArcGIS Enterprise (bez rozbitia)

### Postup (cez portál)

1. Zazipuj **obsah** priečinka `streetView` tak, aby `manifest.json` bol
   v koreni ZIP-u:
   ```
   manifest.json
   config.json
   icon.svg
   src/...
   ```
2. Portal → Content → New item → Your device → nahraj ZIP (typ: custom widget).
3. V Experience Builder otvor svoju appku **ako Duplicate** (nie produkčnú).
4. Pretiahni Street View widget **do mapy** (kvôli prepojeniu).
5. Daj Preview, otestuj, potom Publish.

Oficiálny postup:
https://doc.arcgis.com/en/experience-builder/12.0/configure-widgets/add-custom-widgets.htm

### Zlaté pravidlá

1. **Verzia musí sedieť.** `exbVersion` v manifeste je `1.16.0`. Over si verziu
   svojho EXB (`jimuConfig.exbVersion` v konzole) a zmeň `exbVersion` aj
   `version` na rovnakú. Enterprise 11.5 ≈ EXB 1.15, 12.0 ≈ EXB 1.16.
   Nesúlad verzie je najčastejší dôvod, prečo sa widget nenačíta.
2. **`name` = názov priečinka** (`streetView`). Premenuj oboje naraz alebo nič.
3. **Testuj na kópii appky**, publikuj až po overení.
4. **Pop-upy.** Prehliadač musí mať povolené pop-up okná pre doménu appky,
   inak sa nové okno Street View nemusí otvoriť.

---

## Štruktúra

```
streetView/
├─ manifest.json                  # hasSettingPage: false → žiadne nastavenia
├─ config.json                    # prázdny {}
├─ icon.svg
└─ src/
   └─ runtime/
      ├─ widget.tsx               # UI + click handler
      ├─ streetViewUtils.ts       # transformácie + open (bez snapu/kľúča)
      └─ translations/
         ├─ default.ts            # EN
         └─ sk.ts                 # SK
```

Žiadny `src/setting/` ani `src/config.ts` — widget je zámerne bez konfigurácie.
