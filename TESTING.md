# 🧪 Testing Guide - Dutch Planning Regulations App

## Mock Data Mode 🎭

De applicatie heeft een **mock data mode** waarmee je de volledige applicatie kunt testen **zonder DSO API key** en **zonder PDOK afhankelijkheid**.

### Hoe werkt het?

Zet `USE_MOCK_DATA=true` in je `.env` file:

```bash
# .env
USE_MOCK_DATA=true
```

De applicatie gebruikt dan voorgedefinieerde test data in plaats van echte API calls.

---

## Quick Test - Start in 1 minuut ⚡

```powershell
# 1. Setup (als je dit nog niet hebt gedaan)
.\setup.bat

# 2. Mock mode is standaard enabled in .env.example
# Niets te doen!

# 3. Start de app
.\start.bat

# 4. Test in browser
# Open http://localhost:5173
# Zoek: "Haarlem" of "Utrecht" of "Amsterdam"
```

**Dat is alles!** Je ziet nu mock data.

---

## Beschikbare Mock Locaties

De volgende test locaties zijn beschikbaar:

### 1. Haarlem (Standaard)
```
Adres: Plein 1945 1, 2034KG Haarlem
Coördinaten: 52.391265, 4.628633

Test met: "Haarlem" of "Plein 1945"
```

**Mock Data:**
- 2 omgevingsdocumenten (gemeente + provincie)
- 8 voorschriften/annotaties
- Bouwhoogte: 12 meter
- Goothoogte: 9 meter
- Bebouwingspercentage: 60%
- Geluidzone: 50 dB

### 2. Utrecht
```
Adres: Oudegracht 1, 3511AA Utrecht
Coördinaten: 52.091904, 5.119158

Test met: "Utrecht" of "Oudegracht"
```

### 3. Amsterdam
```
Adres: Dam 1, 1012JS Amsterdam
Coördinaten: 52.373169, 4.891030

Test met: "Amsterdam" of "Dam"
```

---

## Test Scenario's

### ✅ Basis functionaliteit

```
1. Adres zoeken
   → Zoek: "Haarlem"
   → Verwacht: 1 resultaat (Plein 1945 1, Haarlem)

2. Planning data ophalen
   → Klik op adres
   → Verwacht: 2 documenten verschijnen

3. Kaart visualisatie
   → Rechter panel toont kaart
   → Verwacht: Marker op Haarlem + blauw plangebied

4. Voorschriften bekijken
   → Scroll naar voorschriften
   → Verwacht: 8 items (bouwen, milieu, gebruik)

5. Filters toepassen
   → Klik "🏗️ Bouwen"
   → Verwacht: Alleen bouw-gerelateerde items (5)

6. PDF Export
   → Klik "📄 Exporteer als PDF"
   → Verwacht: Download start
```

### ✅ Edge Cases

```
1. Willekeurig adres (niet in mock data)
   → Zoek: "xyz123"
   → Verwacht: Alle 3 mock locaties tonen

2. Lege zoekopdracht
   → Laat veld leeg, klik Zoek
   → Verwacht: Error "Voer een adres in"

3. Meerdere filters
   → Klik "Bouwen" + "Milieu"
   → Verwacht: Items uit beide categorieën (7)

4. Wis filters
   → Klik "✕ Wis filters"
   → Verwacht: Alle 8 items weer zichtbaar
```

### ✅ UI/UX

```
1. Responsive design
   → Resize browser
   → Verwacht: Layout past zich aan

2. Loading states
   → Let op spinners tijdens laden
   → Verwacht: "Omgevingsplan gegevens worden opgehaald..."

3. Error states
   → Simuleer door backend te stoppen
   → Verwacht: Duidelijke foutmelding

4. Modal interactie
   → Klik "Details bekijken →" bij document
   → Verwacht: Modal opent met volledige info
   → Klik buiten modal of op ✕
   → Verwacht: Modal sluit
```

---

## Backend API Tests

Test de backend direct met curl of Postman:

### Health Check
```bash
curl http://localhost:3000/api/health
```

Verwacht response:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "environment": {
    "hasDsoApiKey": false,
    "pdokUrl": "https://api.pdok.nl/..."
  }
}
```

### Geocoding (Mock)
```bash
curl -X POST http://localhost:3000/api/geocode \
  -H "Content-Type: application/json" \
  -d '{"address": "Haarlem"}'
```

Verwacht response:
```json
{
  "success": true,
  "count": 1,
  "results": [
    {
      "display_name": "Plein 1945 1, 2034KG Haarlem",
      "lat": 52.391265,
      "lon": 4.628633,
      ...
    }
  ],
  "mock": true  // ← Indicator dat dit mock data is
}
```

### Planning Data (Mock)
```bash
curl -X POST http://localhost:3000/api/dso/planning-data \
  -H "Content-Type: application/json" \
  -d '{"lat": 52.391265, "lon": 4.628633}'
```

### Regulations (Mock)
```bash
curl -X POST http://localhost:3000/api/dso/regulations \
  -H "Content-Type: application/json" \
  -d '{"lat": 52.391265, "lon": 4.628633, "filters": ["bouwen"]}'
```

### GeoJSON (Mock)
```bash
curl -X POST http://localhost:3000/api/dso/geojson \
  -H "Content-Type: application/json" \
  -d '{"lat": 52.391265, "lon": 4.628633}'
```

**Alle responses hebben `"mock": true` als de mock mode actief is!**

---

## Switchen naar Echte APIs

### Stap 1: Verkrijg API Keys

1. **DSO API Key** (optioneel voor sommige endpoints)
   - Ga naar https://aandeslagmetdeomgevingswet.nl/
   - Registreer en vraag API key aan

2. **PDOK** (geen key nodig!)
   - Werkt out-of-the-box

### Stap 2: Update .env

```bash
# .env
USE_MOCK_DATA=false  # ← Zet op false

# Voeg je DSO key toe
DSO_API_KEY=jouw_echte_api_key_hier
```

### Stap 3: Herstart

```powershell
# Stop de servers (Ctrl+C)
# Start opnieuw
npm run dev
```

### Stap 4: Test met echt adres

```
Zoek: "Plein 1945 1, Haarlem"
```

Je ziet nu **echte** data van PDOK en DSO! (Geen `"mock": true` meer in responses)

---

## Console Output herkennen

### Mock Mode
```
🚀 Backend server draait op http://localhost:3000
📍 PDOK Geocoding: https://api.pdok.nl/...
🏛️  DSO API: https://service.omgevingswet.overheid.nl
🔑 DSO API Key: Niet geconfigureerd ✗

Geocoding adres: Haarlem
🎭 Using MOCK DATA mode          ← Mock indicator
```

### Echte API Mode
```
🚀 Backend server draait op http://localhost:3000
📍 PDOK Geocoding: https://api.pdok.nl/...
🏛️  DSO API: https://service.omgevingswet.overheid.nl
🔑 DSO API Key: Geconfigureerd ✓   ← Key aanwezig

Geocoding adres: Plein 1945 1, Haarlem
DSO Request: https://service.omgevingswet.overheid.nl/...   ← Echte call
```

---

## Mock Data Aanpassen

Wil je je eigen test data toevoegen?

### Voeg een locatie toe

Bewerk `backend/mockData.js`:

```javascript
const mockLocations = {
  // Bestaande locaties...

  // Nieuwe locatie toevoegen:
  'rotterdam': {
    display_name: 'Coolsingel 1, 3011AD Rotterdam',
    street: 'Coolsingel',
    house_number: '1',
    postcode: '3011AD',
    city: 'Rotterdam',
    municipality: 'Rotterdam',
    province: 'Zuid-Holland',
    lat: 51.9225,
    lon: 4.4792,
    x: 92123,
    y: 437890
  }
}
```

Update ook de geocoding route om Rotterdam te herkennen:

```javascript
// backend/routes/geocode.js
if (addressLower.includes('rotterdam')) {
  results.push(mockLocations.rotterdam);
}
```

### Voeg voorschriften toe

Bewerk `mockPlanningData` in `backend/mockData.js`:

```javascript
annotations: [
  // Bestaande annotaties...

  // Nieuwe annotatie:
  {
    type: 'dakhellingpercentage',
    naam: 'Minimale dakhelling',
    groep: 'Bouwen',
    waarde: '30',
    eenheid: 'graden'
  }
]
```

---

## Veelgestelde Vragen

**Q: Waarom zie ik geen data?**
A: Check of `USE_MOCK_DATA=true` in je `.env` file staat.

**Q: Hoe weet ik of ik mock data zie?**
A: Kijk in de browser console (F12) naar de API responses. Als `"mock": true` staat in de JSON, is het mock data.

**Q: Kan ik mock + echte API mixen?**
A: Nee, het is alles of niets. Zet `USE_MOCK_DATA=true` voor alles mock, of `false` voor alles echt.

**Q: Is de mock data realistisch?**
A: Ja! De data is gebaseerd op echte omgevingsplan structuren uit de DSO API documentatie.

**Q: Werkt PDF export met mock data?**
A: Ja! Alle features werken identiek met mock data.

**Q: Performance verschil?**
A: Mock data is instant (geen netwerk calls). Echte APIs kunnen 2-5 seconden duren.

---

## Automated Testing (Future)

De mock data infrastructuur maakt het mogelijk om geautomatiseerde tests toe te voegen:

```javascript
// Example met Jest
describe('Planning Data API', () => {
  beforeAll(() => {
    process.env.USE_MOCK_DATA = 'true'
  })

  test('should return Haarlem data', async () => {
    const response = await request(app)
      .post('/api/dso/planning-data')
      .send({ lat: 52.391265, lon: 4.628633 })

    expect(response.status).toBe(200)
    expect(response.body.data.documents).toHaveLength(2)
    expect(response.body.mock).toBe(true)
  })
})
```

Dit staat nog niet in de codebase, maar de infrastructuur is er klaar voor!

---

## Test Checklist voor Releases

Voordat je een nieuwe versie released:

- [ ] Test met `USE_MOCK_DATA=true` (alle features werken)
- [ ] Test met `USE_MOCK_DATA=false` (echte APIs werken)
- [ ] Test alle 3 mock locaties (Haarlem, Utrecht, Amsterdam)
- [ ] Test alle filters (Bouwen, Milieu, Gebruik)
- [ ] Test PDF export
- [ ] Test responsive design (resize browser)
- [ ] Test error states (stop backend tijdens gebruik)
- [ ] Test loading states
- [ ] Test modal interactie
- [ ] Backend health check OK
- [ ] CORS werkt (frontend kan backend bereiken)

---

**Happy Testing! 🧪✨**

Vragen? Check de andere documentatie of open een GitHub issue.
