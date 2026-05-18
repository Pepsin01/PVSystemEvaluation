# Solar Power Plant — Data Visualization

**Course:** Data Visualization (NDBI042), Charles University  
**Lecturer:** David Hoksza

## About

This project analyzes and visualizes data from a residential photovoltaic (PV) system installed
in Čelákovice, Czech Republic. The system has been running since April 2022 and uses a virtual
battery arrangement with ČEZ to offset grid costs.

**System specs:**  
- 9.45 kWp installed power  
- 14.4 kWh physical battery  
- ~42 m² total panel area  

**Data coverage:** April 2022 – 2026

---

## Data

| File | Description | Source |
|------|-------------|--------|
| `Data/Zatez{year}.xlsx` | Household consumption, PV production, grid exchange (monthly / daily / hourly) | App export |
| `Data/dly-0-20000-0-11519-RGLB_D.csv` | Daily global solar irradiation \[kJ/m²\] | CHMI — Praha Karlov station (~20 km) |
| `Data/dly-0-203-0-11563-TPM.csv` | Daily mean temperature \[°C\] | CHMI — Brandýs nad Labem station (~7 km) |
| `prices2022-2026.csv` | Annual electricity prices for D02d tariff: full grid import price, virtual battery drawback price (regulated only), and VB monthly service fee — all in Kč/kWh or Kč/month incl. 21 % VAT | Manually compiled from ČEZ press releases, ERÚ tariff sheets, and TZB-info yearly summaries |

Energy columns in Zatez files:
- `Zátěž` — total household consumption
- `Síť` — net grid exchange (positive = imported, negative = exported to virtual battery)
- `Výkon FVE` — total PV production

---

## Visualizations

### Jupyter Notebook · `analysis.ipynb`

Exploratory analysis with Matplotlib:

1. **Monthly production vs consumption** — line chart with surplus/deficit fill, plus grid exchange bars
2. **Monthly production vs irradiation** — dual-axis chart showing how production tracks irradiation
3. **Daily efficiency timeline** — scatter plot of daily conversion efficiency (%) over all years
4. **Temperature vs efficiency** — scatter plot with linear trend line and Pearson r

Exports processed data to `d3/data/` for the D3 dashboard.

### D3.js Dashboard · `d3/index.html`

Two interactive visualizations built with D3 v7:

1. **Calendar Heatmap** — GitHub-style multi-year heatmap of daily kWh production.
   Color encodes production intensity; hover shows exact values.

2. **Sankey Diagram** — Energy flow from solar panels through self-consumption,
   virtual battery export, and grid import to the household. Values in MWh over the
   full measurement period.

---

## Setup

```bash
pip install -r requirements.txt
jupyter notebook analysis.ipynb
```

Run the notebook fully first — this generates the JSON files in `d3/data/`.

Then serve the D3 dashboard with any local HTTP server:

```bash
python -m http.server 8080 --directory d3
# open http://localhost:8080
```

> The D3 page uses `d3.json()` which requires HTTP — opening `index.html` directly
> as a file will not work due to browser CORS restrictions.
