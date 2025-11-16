# 🔧 Implementatie Gids - Technical Deep Dive

Deze gids biedt een diepgaande uitleg van de code en architectuur voor developers die de applicatie willen uitbreiden of aanpassen.

## Inhoudsopgave
1. [Architectuur Overzicht](#architectuur-overzicht)
2. [Backend Implementatie](#backend-implementatie)
3. [Frontend Implementatie](#frontend-implementatie)
4. [API Integraties](#api-integraties)
5. [Uitbreidingsmogelijkheden](#uitbreidingsmogelijkheden)
6. [Best Practices](#best-practices)

---

## Architectuur Overzicht

### High-Level Architectuur

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │────────▶│   Backend   │────────▶│  External   │
│  (Vue.js)   │◀────────│  (Express)  │◀────────│    APIs     │
└─────────────┘         └─────────────┘         └─────────────┘
     │                        │                        │
     │                        │                        ├─ PDOK
     │                        │                        └─ DSO
     │                        │
 Leaflet Map            REST Endpoints          HAL Navigation
 PDF Export             Data Processing         Geocoding
```

### Data Flow

1. **User Input** → Adres in zoekbalk
2. **Frontend** → POST request naar `/api/geocode`
3. **Backend** → Query PDOK Locatieserver
4. **PDOK** → Retourneert coördinaten
5. **Frontend** → POST coördinaten naar `/api/dso/planning-data`
6. **Backend** → Query DSO API met locatie
7. **DSO** → HAL response met links
8. **Backend** → Volgt HAL links voor details
9. **Backend** → Transformeert en categoriseert data
10. **Frontend** → Rendert resultaten en kaart

---

## Backend Implementatie

### Server Setup (`backend/server.js`)

```javascript
// Middleware stack:
// 1. CORS - Cross-origin requests van frontend
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))

// 2. JSON parsing
app.use(express.json())

// 3. Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// 4. Routes
app.use('/api/geocode', geocodeRoutes)
app.use('/api/dso', dsoRoutes)

// 5. Error handling
app.use((err, req, res, next) => {
  // Centralized error handling
})
```

**Key Points:**
- Middleware order matters!
- CORS moet voor routes
- Error handler moet laatste zijn
- Logging voor debugging

### Geocoding Routes (`backend/routes/geocode.js`)

#### POST `/api/geocode`

**Flow:**
```javascript
1. Valideer input (address required)
2. Build PDOK URL met query parameters
3. Fetch van PDOK API
4. Parse response (docs array)
5. Transform naar gebruiksvriendelijk format
6. Wissel lat/lon (PDOK geeft lon/lat!)
7. Return resultaten
```

**Data Transformatie:**
```javascript
// PDOK response format:
{
  response: {
    docs: [{
      weergavenaam: "Plein 1945 1, 2034KG Haarlem",
      centroide_ll: "POINT(4.6286 52.3912)",  // LON LAT!
      centroide_rd: "POINT(103456 498765)",   // RD coördinaten
      ...
    }]
  }
}

// Getransformeerd naar:
{
  display_name: "Plein 1945 1, 2034KG Haarlem",
  lat: 52.3912,  // GESWITCHED
  lon: 4.6286,   // GESWITCHED
  x: 103456,     // RD X
  y: 498765,     // RD Y
  ...
}
```

**Waarom lat/lon switch?**
PDOK gebruikt `centroide_ll` in format `POINT(lon lat)`, maar Leaflet verwacht `[lat, lon]`. We switchen direct bij parsing.

#### GET `/api/geocode/reverse`

Reverse geocoding is minder gebruikt maar handig voor:
- Klik op kaart → adres opzoeken
- GPS coördinaten → adres
- Import van oude datasetsmet coördinaten

### DSO Routes (`backend/routes/dso.js`)

Dunne routing laag - alle logica in `dsoService`:

```javascript
router.post('/planning-data', async (req, res) => {
  const { lat, lon } = req.body
  // Validatie
  // Call service
  const planningData = await dsoService.getPlanningDataForLocation(lat, lon)
  // Return result
})
```

**Design rationale:**
- Routes zijn "dumb" - alleen HTTP handling
- Services zijn "smart" - business logica
- Makkelijk te testen en hergebruiken

### DSO Service (`backend/services/dsoService.js`)

**Kern van de applicatie!**

#### HAL Navigation Patroon

```javascript
async function followHalLink(halData, linkName) {
  // 1. Check of _links object bestaat
  if (!halData._links || !halData._links[linkName]) {
    return null
  }

  // 2. Extract href
  const href = halData._links[linkName].href

  // 3. Recursieve DSO request
  return await dsoRequest(href)
}
```

**Voorbeeld HAL response:**
```json
{
  "identificatie": "nl.imow...",
  "officieleTitel": "Omgevingsplan Haarlem",
  "_links": {
    "self": { "href": "/omgevingsdocumenten/123" },
    "locaties": { "href": "/omgevingsdocumenten/123/locaties" },
    "regels": { "href": "/omgevingsdocumenten/123/regels" },
    "geometrie": { "href": "/omgevingsdocumenten/123/geometrie" }
  }
}
```

**Gebruik:**
```javascript
const doc = await dsoRequest('/omgevingsdocumenten/123')
const locaties = await followHalLink(doc, 'locaties')
const regels = await followHalLink(doc, 'regels')
```

#### Data Transformatie Pipeline

**Stap 1: Fetch documents**
```javascript
const endpoint = `/publiek/omgevingsdocumenten/api/opvragen/v4/omgevingsdocumenten`
const params = new URLSearchParams({
  locatie: `POINT(${lon} ${lat})`,
  pageSize: 20
})
```

**Stap 2: Parse embedded data**
```javascript
const documents = data._embedded?.omgevingsdocumenten || []
```

**Stap 3: Enrich met HAL links**
```javascript
const enrichedDocuments = await Promise.all(
  documents.map(async (doc) => {
    const annotations = await followHalLink(doc, 'locaties')
    const regels = await followHalLink(doc, 'regels')

    return {
      ...doc,
      annotations: parseAnnotations(annotations),
      regulations: parseRegulations(regels)
    }
  })
)
```

**Waarom Promise.all?**
- Parallelle requests = sneller
- Meerdere documenten tegelijk verrijken
- Let op rate limits bij veel documenten!

#### Categorisatie Algoritme

```javascript
function categorizeRegulations(regulations) {
  const categories = {
    bouwen: [],
    milieu: [],
    gebruik: [],
    overig: []
  }

  regulations.forEach(reg => {
    const text = `${reg.naam} ${reg.omschrijving} ${reg.thema}`.toLowerCase()

    if (text.includes('bouw') || text.includes('hoogte')) {
      categories.bouwen.push(reg)
    } else if (text.includes('milieu') || text.includes('geluid')) {
      categories.milieu.push(reg)
    }
    // etc...
  })

  return categories
}
```

**Verbetering mogelijkheden:**
- Machine learning voor betere categorisatie
- Configureerbare keywords via config file
- Thesaurus voor synoniemen (bouwhoogte = goothoogte)
- Multi-category toewijzing (item kan in meerdere categorieën)

#### Error Handling Strategie

```javascript
try {
  return await dsoRequest(href)
} catch (error) {
  console.warn(`Kon HAL link '${linkName}' niet volgen:`, error)
  return null  // Graceful degradation
}
```

**Philosophy:**
- **Fail gracefully** - één missing link mag systeem niet breken
- **Log warnings** - voor debugging
- **Return null** - caller kan beslissen hoe te handelen
- **Continue processing** - toon zoveel mogelijk data

---

## Frontend Implementatie

### Vue 3 Composition API Patterns

#### Reactive State Management

```javascript
setup() {
  // Reactive references
  const selectedLocation = ref(null)
  const planningData = ref(null)
  const isLoading = ref(false)

  // Computed properties
  const filteredRegulations = computed(() => {
    if (!regulations.value) return []
    // Filtering logica
  })

  // Watchers
  watch(() => props.location, (newLocation) => {
    if (newLocation) {
      updateMap(newLocation)
    }
  })

  return { selectedLocation, planningData, isLoading, filteredRegulations }
}
```

**Best practices:**
- `ref()` voor primitives en objecten
- `computed()` voor afgeleide waarden (caching!)
- `watch()` voor side-effects
- Return alles wat template nodig heeft

#### Component Communication

**Parent → Child (Props):**
```vue
<!-- App.vue -->
<MapView :location="selectedLocation" :geojson="geojsonData" />

<!-- MapView.vue -->
<script>
export default {
  props: {
    location: { type: Object, default: null },
    geojson: { type: Object, default: null }
  }
}
</script>
```

**Child → Parent (Emits):**
```vue
<!-- AddressSearch.vue -->
<script>
export default {
  emits: ['address-selected', 'error'],
  setup(props, { emit }) {
    function selectAddress(address) {
      emit('address-selected', address)
    }
  }
}
</script>

<!-- App.vue -->
<AddressSearch @address-selected="handleAddressSelected" />
```

### Leaflet Integration (`MapView.vue`)

#### Initialisatie

```javascript
onMounted(() => {
  map = L.map('map').setView([52.3676, 4.9041], 7)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '...',
    maxZoom: 19
  }).addTo(map)

  L.control.scale().addTo(map)
})
```

**Why onMounted?**
- DOM moet klaar zijn (#map element moet bestaan)
- Leaflet heeft daadwerkelijke DOM node nodig
- Vue lifecycle: created → mounted → DOM ready

#### Dynamic Marker Updates

```javascript
watch(() => props.location, (newLocation) => {
  if (newLocation && map) {
    // Clear oude markers
    markers.forEach(marker => map.removeLayer(marker))
    markers = []

    // Add nieuwe marker
    const marker = L.marker([newLocation.lat, newLocation.lon])
      .addTo(map)
      .bindPopup(...)
      .openPopup()

    markers.push(marker)
    map.setView([newLocation.lat, newLocation.lon], 16)
  }
})
```

**Pattern: Clear & Rebuild**
- Makkelijker dan update-in-place
- Voorkomt duplicate markers
- Geen complexe state tracking nodig

#### GeoJSON Layer Management

```javascript
function updateGeoJsonLayer(geojson) {
  // Remove old
  if (geoJsonLayer) {
    map.removeLayer(geoJsonLayer)
  }

  // Add new
  geoJsonLayer = L.geoJSON(geojson, {
    style: function(feature) {
      // Styling per feature type
    },
    onEachFeature: function(feature, layer) {
      // Popups
      layer.bindPopup(popupContent)
    }
  }).addTo(map)

  // Fit bounds
  const bounds = geoJsonLayer.getBounds()
  if (bounds.isValid()) {
    map.fitBounds(bounds, { padding: [50, 50] })
  }
}
```

**Feature Styling:**
```javascript
style: function(feature) {
  if (feature.properties.type === 'plan_area') {
    return {
      color: '#3388ff',      // Border color
      weight: 2,             // Border width
      opacity: 0.6,          // Border opacity
      fillOpacity: 0.2       // Fill opacity
    }
  }
}
```

### Async Data Fetching Pattern

```javascript
async function handleAddressSelected(location) {
  selectedLocation.value = location
  error.value = null
  isLoading.value = true

  try {
    // Parallel fetches voor snelheid
    await Promise.all([
      fetchPlanningData(location.lat, location.lon),
      fetchRegulations(location.lat, location.lon),
      fetchGeoJSON(location.lat, location.lon)
    ])
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
}
```

**Why Promise.all?**
- Alle requests tegelijk = sneller
- Total tijd = langzaamste request (niet som!)
- Bij fout: alle promises worden rejected

**Alternative: Sequential**
```javascript
// Als je DSO data nodig hebt voor GeoJSON:
await fetchPlanningData(...)
await fetchGeoJSON(...)  // Gebruikt planningData
```

### Filter Implementation

**State:**
```javascript
const activeFilters = ref([])

const filteredRegulations = computed(() => {
  if (activeFilters.value.length === 0) {
    return regulations.value.regulations  // Alle
  }

  let filtered = []
  activeFilters.value.forEach(category => {
    filtered = [...filtered, ...regulations.value.categories[category]]
  })
  return filtered
})
```

**UI:**
```vue
<button
  v-for="(regs, category) in categories"
  @click="toggleFilter(category)"
  :class="{ active: isActive(category) }"
>
  {{ getCategoryLabel(category) }} ({{ regs.length }})
</button>
```

**Logica:**
```javascript
function toggleFilter(category) {
  const index = activeFilters.value.indexOf(category)
  if (index > -1) {
    activeFilters.value.splice(index, 1)  // Remove
  } else {
    activeFilters.value.push(category)     // Add
  }
  emit('filter-changed', activeFilters.value)
}
```

---

## API Integraties

### PDOK Locatieserver

**Endpoint:** `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free`

**Parameters:**
- `q` - Search query (required)
- `fq` - Filter query (bijv. `type:adres`)
- `rows` - Aantal resultaten (default 10)
- `lat` / `lon` - Voor reverse geocoding

**Response Structure:**
```json
{
  "response": {
    "numFound": 1,
    "start": 0,
    "docs": [{
      "weergavenaam": "...",
      "straatnaam": "...",
      "huisnummer": "...",
      "postcode": "...",
      "woonplaatsnaam": "...",
      "gemeentenaam": "...",
      "provincienaam": "...",
      "centroide_ll": "POINT(lon lat)",
      "centroide_rd": "POINT(x y)",
      "type": "adres",
      "id": "...",
      "score": 12.34
    }]
  }
}
```

**Best Practices:**
- Filter op `type:adres` voor precisie
- Gebruik `score` voor ranking bij meerdere resultaten
- Cache populaire adressen (Redis/memory)
- Retry bij netwerk fouten (max 3x)

### DSO API

**Base URL:** `https://service.omgevingswet.overheid.nl`

**Authentication:**
```javascript
headers: {
  'X-Api-Key': process.env.DSO_API_KEY,
  'Accept': 'application/hal+json'
}
```

**Key Endpoints:**

1. **Omgevingsdocumenten zoeken:**
   ```
   GET /publiek/omgevingsdocumenten/api/opvragen/v4/omgevingsdocumenten
   ?locatie=POINT(lon lat)
   &pageSize=20
   ```

2. **Document details:**
   ```
   GET /publiek/omgevingsdocumenten/api/opvragen/v4/omgevingsdocumenten/{id}
   ```

3. **Locaties (annotaties):**
   ```
   GET /publiek/omgevingsdocumenten/api/opvragen/v4/omgevingsdocumenten/{id}/locaties
   ```

4. **Regels (voorschriften):**
   ```
   GET /publiek/omgevingsdocumenten/api/opvragen/v4/omgevingsdocumenten/{id}/regels
   ```

**HAL Response Pattern:**
```json
{
  "eigenschap": "waarde",
  "_links": {
    "self": { "href": "/current/resource" },
    "gerelateerd": { "href": "/related/resource" }
  },
  "_embedded": {
    "items": [...]
  }
}
```

**Navigatie Strategie:**
1. Fetch hoofdresource
2. Inspecteer `_links`
3. Volg relevante links (locaties, regels, geometrie)
4. Parse `_embedded` data
5. Recursief voor diepere nesting

**Rate Limiting:**
- Check DSO docs voor actuele limits
- Implement exponential backoff
- Cache responses waar mogelijk
- Batch requests indien API het toelaat

---

## Uitbreidingsmogelijkheden

### 1. Caching Laag

**Backend Redis Cache:**
```javascript
const redis = require('redis')
const client = redis.createClient()

async function getPlanningDataForLocation(lat, lon) {
  const cacheKey = `planning:${lat}:${lon}`

  // Check cache
  const cached = await client.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  // Fetch from DSO
  const data = await fetchFromDSO(lat, lon)

  // Cache voor 1 uur
  await client.setex(cacheKey, 3600, JSON.stringify(data))

  return data
}
```

**Voordelen:**
- Snellere response tijden
- Minder DSO API calls (kosten!)
- Betere UX

**Considerations:**
- Cache invalidatie bij plan updates
- Memory usage
- Cache key strategie (precision van coördinaten)

### 2. Gebruikers Authenticatie

**Backend met JWT:**
```javascript
const jwt = require('jsonwebtoken')

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body
  const user = await User.findByEmail(email)

  if (user && await user.verifyPassword(password)) {
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, user })
  } else {
    res.status(401).json({ error: 'Invalid credentials' })
  }
})

// Auth middleware
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}

// Protected route
app.get('/api/user/searches', requireAuth, async (req, res) => {
  const searches = await Search.findByUser(req.userId)
  res.json(searches)
})
```

**Frontend State Management:**
```javascript
// store/auth.js
import { ref, computed } from 'vue'

const user = ref(null)
const token = ref(localStorage.getItem('token'))

export function useAuth() {
  const isAuthenticated = computed(() => !!token.value)

  async function login(email, password) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })

    const data = await response.json()
    if (data.token) {
      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  return { user, token, isAuthenticated, login, logout }
}
```

### 3. Opgeslagen Zoekopdrachten

**Database Schema (PostgreSQL):**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE saved_searches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR(255),
  address VARCHAR(255),
  lat DECIMAL(10, 8),
  lon DECIMAL(11, 8),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE search_alerts (
  id SERIAL PRIMARY KEY,
  search_id INTEGER REFERENCES saved_searches(id),
  user_id INTEGER REFERENCES users(id),
  alert_type VARCHAR(50), -- 'email', 'webhook'
  last_checked TIMESTAMP,
  last_change_detected TIMESTAMP
);
```

**API Endpoints:**
```javascript
// Save search
app.post('/api/searches', requireAuth, async (req, res) => {
  const { name, address, lat, lon, notes } = req.body
  const search = await db.query(
    'INSERT INTO saved_searches (user_id, name, address, lat, lon, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [req.userId, name, address, lat, lon, notes]
  )
  res.json(search.rows[0])
})

// List searches
app.get('/api/searches', requireAuth, async (req, res) => {
  const searches = await db.query(
    'SELECT * FROM saved_searches WHERE user_id = $1 ORDER BY updated_at DESC',
    [req.userId]
  )
  res.json(searches.rows)
})

// Delete search
app.delete('/api/searches/:id', requireAuth, async (req, res) => {
  await db.query(
    'DELETE FROM saved_searches WHERE id = $1 AND user_id = $2',
    [req.params.id, req.userId]
  )
  res.json({ success: true })
})
```

### 4. Change Detection & Alerts

**Background Job (cron/bull):**
```javascript
const cron = require('node-cron')

// Run elke dag om 2:00 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Checking for planning changes...')

  const alerts = await db.query(`
    SELECT sa.*, ss.lat, ss.lon, u.email
    FROM search_alerts sa
    JOIN saved_searches ss ON sa.search_id = ss.id
    JOIN users u ON sa.user_id = u.id
    WHERE sa.alert_type = 'email'
  `)

  for (const alert of alerts.rows) {
    try {
      // Fetch current data
      const currentData = await getPlanningDataForLocation(alert.lat, alert.lon)

      // Compare with last known state
      const lastKnownData = await getLastKnownData(alert.search_id)

      if (hasChanges(currentData, lastKnownData)) {
        // Send email
        await sendChangeNotification(alert.email, currentData, lastKnownData)

        // Update last_change_detected
        await db.query(
          'UPDATE search_alerts SET last_change_detected = NOW() WHERE id = $1',
          [alert.id]
        )
      }

      // Update last_checked
      await db.query(
        'UPDATE search_alerts SET last_checked = NOW() WHERE id = $1',
        [alert.id]
      )

    } catch (error) {
      console.error(`Error checking alert ${alert.id}:`, error)
    }
  }
})

function hasChanges(current, previous) {
  // Compare document counts
  if (current.documents.length !== previous.documents.length) {
    return true
  }

  // Compare regulations
  if (current.regulations.count !== previous.regulations.count) {
    return true
  }

  // Deep comparison of important fields
  // ...

  return false
}
```

### 5. Excel/CSV Export

```javascript
// Backend with ExcelJS
const ExcelJS = require('exceljs')

app.post('/api/export/excel', async (req, res) => {
  const { location, planningData, regulations } = req.body

  const workbook = new ExcelJS.Workbook()

  // Metadata
  workbook.creator = 'Dutch Planning Regulations App'
  workbook.created = new Date()

  // Sheet 1: Overview
  const overview = workbook.addWorksheet('Overzicht')
  overview.columns = [
    { header: 'Veld', key: 'field', width: 20 },
    { header: 'Waarde', key: 'value', width: 50 }
  ]
  overview.addRow({ field: 'Adres', value: location.display_name })
  overview.addRow({ field: 'Latitude', value: location.lat })
  overview.addRow({ field: 'Longitude', value: location.lon })
  overview.addRow({ field: 'Datum', value: new Date().toLocaleDateString('nl-NL') })

  // Sheet 2: Documenten
  const docs = workbook.addWorksheet('Documenten')
  docs.columns = [
    { header: 'Titel', key: 'title', width: 40 },
    { header: 'Type', key: 'type', width: 20 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Bevoegd Gezag', key: 'authority', width: 25 },
    { header: 'Geldig vanaf', key: 'validFrom', width: 15 }
  ]
  planningData.documents.forEach(doc => {
    docs.addRow({
      title: doc.title,
      type: doc.type,
      status: doc.status,
      authority: doc.bevoegdGezag,
      validFrom: doc.geldigVanaf
    })
  })

  // Sheet 3: Voorschriften
  const regs = workbook.addWorksheet('Voorschriften')
  regs.columns = [
    { header: 'Type', key: 'type', width: 15 },
    { header: 'Naam', key: 'name', width: 30 },
    { header: 'Waarde', key: 'value', width: 20 },
    { header: 'Plan', key: 'plan', width: 35 }
  ]
  regulations.regulations.forEach(reg => {
    regs.addRow({
      type: reg.type === 'annotatie' ? 'Annotatie' : 'Voorschrift',
      name: reg.naam || reg.omschrijving,
      value: reg.waarde ? `${reg.waarde} ${reg.eenheid || ''}` : '-',
      plan: reg.planTitle
    })
  })

  // Styling
  overview.getRow(1).font = { bold: true }
  docs.getRow(1).font = { bold: true }
  regs.getRow(1).font = { bold: true }

  // Send file
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="omgevingsplan_${location.city}_${Date.now()}.xlsx"`)

  await workbook.xlsx.write(res)
  res.end()
})
```

**Frontend:**
```javascript
async function exportToExcel() {
  const response = await fetch('/api/export/excel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: selectedLocation.value,
      planningData: planningData.value,
      regulations: regulations.value
    })
  })

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `omgevingsplan_${selectedLocation.value.city}.xlsx`
  a.click()
  window.URL.revokeObjectURL(url)
}
```

### 6. Advanced Mapping Features

**Meerdere Base Layers:**
```javascript
// MapView.vue
const baseLayers = {
  'OpenStreetMap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'),
  'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'),
  'Topo': L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png')
}

// Add layer control
L.control.layers(baseLayers).addTo(map)
```

**Draw Tools:**
```javascript
import 'leaflet-draw'

const drawnItems = new L.FeatureGroup()
map.addLayer(drawnItems)

const drawControl = new L.Control.Draw({
  edit: {
    featureGroup: drawnItems
  },
  draw: {
    polygon: true,
    rectangle: true,
    circle: false,
    marker: false
  }
})
map.addControl(drawControl)

map.on(L.Draw.Event.CREATED, function (event) {
  const layer = event.layer
  drawnItems.addLayer(layer)

  // Get GeoJSON van getekende vorm
  const geojson = layer.toGeoJSON()

  // Query DSO voor alles binnen dit gebied
  queryAreaForPlanning(geojson)
})
```

**Heatmap voor bouwhoogtes:**
```javascript
import 'leaflet.heat'

function createHeightHeatmap(annotations) {
  const heatData = annotations
    .filter(a => a.type === 'bouwhoogte')
    .map(a => [a.lat, a.lon, parseFloat(a.waarde)])

  L.heatLayer(heatData, {
    radius: 25,
    blur: 15,
    maxZoom: 17,
  }).addTo(map)
}
```

---

## Best Practices

### Code Kwaliteit

**1. Error Boundaries**
```javascript
// Frontend error boundary component
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)

  // Log naar error tracking service (Sentry, etc.)
  // logErrorToService(err, { component: instance, info })
}
```

**2. Input Validation**
```javascript
function validateLocation(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    throw new Error('Lat/lon moeten numbers zijn')
  }

  if (lat < 50.7 || lat > 53.6) {
    throw new Error('Latitude buiten Nederland')
  }

  if (lon < 3.3 || lon > 7.2) {
    throw new Error('Longitude buiten Nederland')
  }

  return true
}
```

**3. TypeScript (optioneel maar aanbevolen)**
```typescript
// types/dso.ts
export interface OmgevingsDocument {
  id: string
  title: string
  type: string
  status: string
  bevoegdGezag: string
  geldigVanaf: string
  geldigTot?: string
  annotations: Annotation[]
  regulations: Regulation[]
}

export interface Annotation {
  type: string
  naam: string
  waarde?: string
  eenheid?: string
  groep?: string
}

// dsoService.ts
export async function getPlanningDataForLocation(
  lat: number,
  lon: number
): Promise<{ documents: OmgevingsDocument[] }> {
  // Implementation with type safety
}
```

### Performance

**1. Debouncing**
```javascript
// utils/debounce.js
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// Gebruik in search
import { debounce } from './utils/debounce'

const debouncedSearch = debounce(performSearch, 500)
```

**2. Lazy Loading Components**
```javascript
// App.vue
import { defineAsyncComponent } from 'vue'

const DocumentModal = defineAsyncComponent(() =>
  import('./components/DocumentModal.vue')
)

// Modal laadt alleen als nodig
```

**3. Virtual Scrolling voor lange lijsten**
```javascript
import { RecycleScroller } from 'vue-virtual-scroller'

<RecycleScroller
  :items="regulations"
  :item-size="100"
  key-field="id"
>
  <template #default="{ item }">
    <RegulationItem :regulation="item" />
  </template>
</RecycleScroller>
```

### Security

**1. Content Security Policy**
```javascript
// server.js
const helmet = require('helmet')

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "unpkg.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "*.tile.openstreetmap.org"],
      connectSrc: ["'self'", "api.pdok.nl", "service.omgevingswet.overheid.nl"]
    }
  }
}))
```

**2. Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit')

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuten
  max: 100, // Max 100 requests per IP
  message: 'Te veel requests, probeer later opnieuw'
})

app.use('/api/', apiLimiter)
```

**3. Input Sanitization**
```javascript
const validator = require('validator')

app.post('/api/geocode', (req, res) => {
  let { address } = req.body

  // Sanitize input
  address = validator.escape(address)
  address = validator.trim(address)

  if (!validator.isLength(address, { min: 1, max: 200 })) {
    return res.status(400).json({ error: 'Invalid address length' })
  }

  // Continue processing...
})
```

### Testing

**Backend Tests (Jest):**
```javascript
// tests/dsoService.test.js
const { getPlanningDataForLocation } = require('../backend/services/dsoService')

describe('DSO Service', () => {
  test('should fetch planning data for valid location', async () => {
    const data = await getPlanningDataForLocation(52.3912, 4.6286)

    expect(data).toHaveProperty('documents')
    expect(Array.isArray(data.documents)).toBe(true)
  })

  test('should handle invalid coordinates', async () => {
    await expect(
      getPlanningDataForLocation(999, 999)
    ).rejects.toThrow()
  })
})
```

**Frontend Tests (Vitest):**
```javascript
// tests/AddressSearch.test.js
import { mount } from '@vue/test-utils'
import AddressSearch from '../src/components/AddressSearch.vue'

describe('AddressSearch', () => {
  test('emits address-selected on result click', async () => {
    const wrapper = mount(AddressSearch)

    // Simulate search results
    wrapper.vm.searchResults = [{ id: 1, display_name: 'Test' }]
    await wrapper.vm.$nextTick()

    // Click result
    await wrapper.find('.search-result-item').trigger('click')

    // Check emit
    expect(wrapper.emitted('address-selected')).toBeTruthy()
  })
})
```

---

## Deployment Checklist

### Pre-Production

- [ ] Environment variabelen ingesteld
- [ ] DSO API key geldig voor productie
- [ ] Database migraties uitgevoerd
- [ ] Frontend production build getest
- [ ] HTTPS certificaat geconfigureerd
- [ ] CORS origins beperkt tot productie domain
- [ ] Rate limiting geactiveerd
- [ ] Error logging naar service (Sentry, etc.)
- [ ] Performance monitoring (New Relic, DataDog)
- [ ] Backup strategie bepaald
- [ ] Monitoring alerts geconfigureerd

### Production

- [ ] DNS records geconfigureerd
- [ ] CDN voor frontend assets (Cloudflare)
- [ ] Load balancer indien nodig
- [ ] PM2 of andere process manager
- [ ] Reverse proxy (Nginx/Caddy)
- [ ] Firewall regels
- [ ] SSL/TLS configuratie (A+ rating op SSL Labs)
- [ ] Database connection pooling
- [ ] Cache layer (Redis/Memcached)
- [ ] Log rotation
- [ ] Automated backups
- [ ] Health check endpoints
- [ ] Graceful shutdown handling

---

**Veel succes met bouwen! 🚀**

Voor vragen: open een GitHub issue of raadpleeg de DSO/PDOK documentatie.
