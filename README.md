# 🏛️ Dutch Planning Regulations App

Een complete webapplicatie voor het raadplegen van Nederlandse omgevingsplannen via het Digitaal Stelsel Omgevingswet (DSO) API.

## 📋 Overzicht

Deze applicatie stelt gebruikers in staat om:
- **Adressen te geocoderen** via de PDOK Locatieserver
- **Omgevingsplannen op te vragen** voor een specifieke locatie
- **Voorschriften en annotaties** te bekijken (bouwhoogte, goothoogte, milieuregels, etc.)
- **Plangebieden te visualiseren** op een interactieve kaart
- **Data te filteren** op soort voorschriften
- **Rapporten te exporteren** als PDF

## 🏗️ Architectuur

### Backend (Node.js + Express)
- **Geocoding API** - PDOK Locatieserver integratie
- **DSO API Service** - HAL-links navigatie en data verwerking
- **REST API endpoints** - JSON communicatie met frontend

### Frontend (Vue.js 3 + Leaflet)
- **Vue 3 Composition API** - Moderne, reactieve componenten
- **Leaflet maps** - Interactieve kaartweergave met GeoJSON ondersteuning
- **PDF export** - jsPDF voor rapportage generatie
- **Responsive design** - Werkt op desktop en mobiel

## 🚀 Installatie & Setup

### Vereisten
- Node.js 16+ en npm
- DSO API key (optioneel, maar aanbevolen)

### Stap 1: Kloon de repository
```bash
git clone <repository-url>
cd DSO
```

### Stap 2: Installeer dependencies
```bash
# Installeer backend dependencies
npm install

# Installeer frontend dependencies
cd frontend
npm install
cd ..
```

Of gebruik het helper script:
```bash
npm run install-all
```

### Stap 3: Configureer environment variabelen
```bash
# Kopieer het voorbeeld bestand
cp .env.example .env

# Bewerk .env en voeg je DSO API key toe
nano .env
```

**.env configuratie:**
```bash
PORT=3000
DSO_API_KEY=your_dso_api_key_here
DSO_BASE_URL=https://service.omgevingswet.overheid.nl
PDOK_GEOCODE_URL=https://api.pdok.nl/bzk/locatieserver/search/v3_1/free
FRONTEND_URL=http://localhost:5173
```

### Stap 4: Start de applicatie

**Ontwikkeling (beide servers tegelijk):**
```bash
npm run dev
```

**Of start ze apart:**
```bash
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend
npm run frontend
```

**Productie build:**
```bash
npm run build
```

## 📡 API Endpoints

### Geocoding

**POST `/api/geocode`**
Geocodeer een Nederlands adres naar coördinaten.

Request:
```json
{
  "address": "Plein 1945 1, Haarlem"
}
```

Response:
```json
{
  "success": true,
  "count": 1,
  "results": [
    {
      "display_name": "Plein 1945 1, 2034KG Haarlem",
      "lat": 52.3912,
      "lon": 4.6286,
      "city": "Haarlem",
      "municipality": "Haarlem",
      "province": "Noord-Holland"
    }
  ]
}
```

**GET `/api/geocode/reverse?lat=52.xxx&lon=4.xxx`**
Reverse geocoding: coördinaten naar adres.

### DSO Data

**POST `/api/dso/planning-data`**
Haal omgevingsplannen op voor een locatie.

Request:
```json
{
  "lat": 52.3912,
  "lon": 4.6286
}
```

Response:
```json
{
  "success": true,
  "location": { "lat": 52.3912, "lon": 4.6286 },
  "data": {
    "count": 2,
    "documents": [
      {
        "id": "nl.imow-gm0392.regeltekst...",
        "title": "Omgevingsplan Haarlem",
        "type": "omgevingsplan",
        "status": "vastgesteld",
        "bevoegdGezag": "Gemeente Haarlem",
        "geldigVanaf": "2024-01-01",
        "annotations": [...],
        "regulations": [...]
      }
    ]
  }
}
```

**POST `/api/dso/regulations`**
Haal voorschriften op met optionele filters.

Request:
```json
{
  "lat": 52.3912,
  "lon": 4.6286,
  "filters": ["bouwhoogte", "goothoogte"]
}
```

**POST `/api/dso/geojson`**
Haal GeoJSON data op voor kaartweergave.

**GET `/api/dso/plan/:planId`**
Haal details van een specifiek plan op.

**GET `/api/health`**
Health check endpoint - controleer of de server draait.

## 🗂️ Project Structuur

```
DSO/
├── backend/
│   ├── server.js              # Express server & middleware
│   ├── routes/
│   │   ├── geocode.js         # Geocoding endpoints
│   │   └── dso.js             # DSO API endpoints
│   └── services/
│       └── dsoService.js      # DSO API logica & HAL-links
│
├── frontend/
│   ├── index.html             # HTML entry point
│   ├── vite.config.js         # Vite bundler config
│   ├── package.json           # Frontend dependencies
│   └── src/
│       ├── main.js            # Vue app initialisatie
│       ├── App.vue            # Hoofd component
│       ├── style.css          # Globale stijlen
│       ├── components/
│       │   ├── AddressSearch.vue      # Adres zoeken
│       │   ├── MapView.vue            # Leaflet kaart
│       │   ├── DocumentCard.vue       # Plan kaartje
│       │   ├── DocumentModal.vue      # Details modal
│       │   ├── RegulationFilters.vue  # Filter knoppen
│       │   └── RegulationsList.vue    # Voorschriften lijst
│       └── utils/
│           └── pdfExport.js   # PDF export functionaliteit
│
├── .env.example               # Environment variabelen sjabloon
├── .gitignore                 # Git ignore regels
├── package.json               # Root dependencies & scripts
└── README.md                  # Deze documentatie
```

## 🔧 Technische Details

### Backend Details

#### DSO Service (`backend/services/dsoService.js`)

De DSO service implementeert:
- **HAL-links navigatie** - Automatisch volgen van gerelateerde links
- **Data transformatie** - DSO responses naar gebruiksvriendelijke structuren
- **Error handling** - Robuuste foutafhandeling
- **Categorisatie** - Automatische indeling van voorschriften

Belangrijke functies:
```javascript
// Haal planning data op voor locatie
await getPlanningDataForLocation(lat, lon)

// Haal voorschriften op met filters
await getRegulationsForLocation(lat, lon, ['bouwhoogte', 'milieu'])

// Volg een HAL link
await followHalLink(halData, 'linkName')

// Haal GeoJSON op
await getGeoJsonForLocation(lat, lon)
```

#### Geocoding Service (`backend/routes/geocode.js`)

Integratie met PDOK Locatieserver:
- Fuzzy matching voor adressen
- Ondersteuning voor postcode, straatnaam, plaatsnaam
- WGS84 en Rijksdriehoek (RD) coördinaten
- Reverse geocoding (coördinaten → adres)

### Frontend Details

#### Vue 3 Composition API

Alle componenten gebruiken de moderne Composition API:
```vue
<script>
import { ref, computed, watch } from 'vue'

export default {
  setup() {
    const data = ref(null)
    const isLoading = ref(false)

    const filteredData = computed(() => {
      // Computed properties
    })

    watch(() => data.value, (newVal) => {
      // Reactieve updates
    })

    return { data, isLoading, filteredData }
  }
}
</script>
```

#### Leaflet Map Integratie

De MapView component biedt:
- OpenStreetMap tiles
- Markers voor geselecteerde locaties
- GeoJSON layer rendering voor plangebieden
- Popups met plan informatie
- Automatische bounds fitting

#### PDF Export

De PDF export functionaliteit (`frontend/src/utils/pdfExport.js`):
- Genereert professionele rapporten
- Inclusief locatie informatie
- Documenten overzicht in tabel format
- Voorschriften gegroepeerd per categorie
- Paginanummering en datum

## 🎨 Styling & UX

### Design Principes
- **Clean & Modern** - Gradient header, kaartjes met shadows
- **Responsive** - Werkt op alle schermformaten
- **Accessible** - Goede contrasten en duidelijke labels
- **Interactive** - Hover states, transitions, feedback

### Color Scheme
- Primary: `#667eea` (Paars-blauw gradient)
- Success: `#28a745` (Groen voor acties)
- Info: `#e7f3ff` (Lichtblauw voor highlights)
- Text: `#333` (Dark gray voor leesbaarheid)

## 🔐 Security & Best Practices

### Backend Security
- **CORS configuratie** - Alleen toegang vanaf frontend URL
- **Input validatie** - Alle input wordt gevalideerd
- **API key protection** - Environment variabelen, nooit in code
- **Error handling** - Geen gevoelige info in error messages

### Frontend Security
- **Proxy setup** - API calls via Vite proxy (development)
- **Input sanitization** - XSS preventie
- **HTTPS aanbevolen** - Voor productie omgevingen

## 🧪 Testing & Debugging

### Backend Testing
```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test geocoding
curl -X POST http://localhost:3000/api/geocode \
  -H "Content-Type: application/json" \
  -d '{"address": "Plein 1945 1, Haarlem"}'
```

### Frontend Development
```bash
# Start met hot reload
cd frontend
npm run dev

# Build voor productie
npm run build

# Preview productie build
npm run preview
```

### Common Issues

**Issue: DSO API geeft geen resultaten**
- Controleer of de DSO API key correct is ingesteld in `.env`
- Controleer of de coördinaten binnen Nederland liggen
- Check de DSO API status op https://service.omgevingswet.overheid.nl

**Issue: Geocoding werkt niet**
- PDOK Locatieserver vereist geen API key
- Controleer internetverbinding
- Gebruik volledige adressen (straat + nummer + plaats)

**Issue: Kaart laadt niet**
- Controleer browser console voor errors
- Zorg dat Leaflet CSS correct wordt geladen
- Check OpenStreetMap tile server status

## 📝 DSO API Informatie

### API Key Aanvragen
1. Ga naar https://aandeslagmetdeomgevingswet.nl/
2. Registreer voor DSO toegang
3. Vraag een API key aan via het developer portaal

### API Documentatie
- DSO Developer Portal: https://developer.overheid.nl/
- DSO API Specificatie: https://service.omgevingswet.overheid.nl/
- HAL specificatie: https://stateless.group/hal_specification.html

### Rate Limits
- Check de DSO documentatie voor actuele rate limits
- Implementeer caching voor veelgevraagde data indien nodig

## 🚀 Deployment

### Productie Deployment

**Backend:**
```bash
# Set NODE_ENV
export NODE_ENV=production

# Start server (gebruik process manager zoals PM2)
pm2 start backend/server.js --name dso-backend
```

**Frontend:**
```bash
# Build
cd frontend
npm run build

# Deploy de dist/ folder naar je webserver
# Of gebruik een platform zoals Vercel, Netlify
```

### Environment Variables (Productie)
Zorg ervoor dat deze zijn ingesteld:
- `PORT` - Backend poort
- `DSO_API_KEY` - Je productie DSO API key
- `FRONTEND_URL` - Je productie frontend URL (voor CORS)
- `NODE_ENV=production`

## 📄 Licentie

MIT License - Vrij te gebruiken voor persoonlijke en commerciële projecten.

## 🤝 Contributie

Verbeteringen en pull requests zijn welkom!

Voor grote wijzigingen, open eerst een issue om te discussiëren wat je zou willen veranderen.

## 📞 Support & Contact

Voor vragen over de DSO API:
- DSO Support: https://aandeslagmetdeomgevingswet.nl/
- Developer Docs: https://developer.overheid.nl/

Voor vragen over PDOK:
- PDOK Forum: https://www.pdok.nl/

## 🎯 Roadmap & Toekomstige Features

- [ ] Gebruikers authenticatie en opgeslagen zoekopdrachten
- [ ] Vergelijken van meerdere locaties
- [ ] Email notificaties voor planwijzigingen
- [ ] Export naar Excel/CSV
- [ ] Geavanceerde filtering en zoekopties
- [ ] Historische plan versies bekijken
- [ ] Integratie met andere open data bronnen (BAG, BGT)

## 🙏 Credits

Gebouwd met:
- [Vue.js](https://vuejs.org/) - Progressive JavaScript Framework
- [Express](https://expressjs.com/) - Node.js web framework
- [Leaflet](https://leafletjs.com/) - Open-source JavaScript library voor mobiele-vriendelijke interactieve kaarten
- [PDOK](https://www.pdok.nl/) - Publieke Dienstverlening Op de Kaart
- [DSO](https://www.digitaalstelselomgevingswet.nl/) - Digitaal Stelsel Omgevingswet
- [jsPDF](https://github.com/parallax/jsPDF) - PDF generatie in JavaScript

---

**Made with ❤️ for the Dutch Planning & Development Community**
