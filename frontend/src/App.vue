<template>
  <div id="app" class="app-container">
    <!-- Header -->
    <header class="app-header">
      <h1>🏛️ Nederlandse Omgevingsplannen</h1>
      <p>Raadpleeg omgevingsplan voorschriften via het Digitaal Stelsel Omgevingswet</p>
    </header>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Left Panel: Search & Results -->
      <div class="left-panel">
        <!-- Search Section -->
        <section class="search-section">
          <h2>Zoek een adres</h2>
          <AddressSearch
            @address-selected="handleAddressSelected"
            @error="handleError"
          />
        </section>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading">
          <div class="spinner"></div>
          <p>Omgevingsplan gegevens worden opgehaald...</p>
        </div>

        <!-- Error State -->
        <div v-if="error" class="error-message">
          <strong>⚠️ Fout:</strong> {{ error }}
        </div>

        <!-- Results Section -->
        <section v-if="selectedLocation && !isLoading" class="results-section">
          <!-- Location Info -->
          <div class="location-info">
            <h3>📍 Geselecteerde locatie</h3>
            <p><strong>{{ selectedLocation.display_name }}</strong></p>
            <p class="coordinates">
              Coördinaten: {{ selectedLocation.lat.toFixed(6) }}, {{ selectedLocation.lon.toFixed(6) }}
            </p>
          </div>

          <!-- Planning Documents -->
          <div v-if="planningData && planningData.documents" class="planning-documents">
            <h3>📋 Omgevingsdocumenten ({{ planningData.documents.length }})</h3>

            <div v-if="planningData.documents.length === 0" class="no-results">
              Geen omgevingsdocumenten gevonden voor deze locatie.
            </div>

            <div v-else class="documents-list">
              <DocumentCard
                v-for="doc in planningData.documents"
                :key="doc.id"
                :document="doc"
                @show-details="showDocumentDetails"
              />
            </div>
          </div>

          <!-- Regulations -->
          <div v-if="regulations" class="regulations-section">
            <h3>📖 Voorschriften & Annotaties ({{ regulations.count }})</h3>

            <!-- Filters -->
            <RegulationFilters
              :categories="regulations.categories"
              @filter-changed="handleFilterChanged"
            />

            <!-- Regulations List -->
            <RegulationsList
              :regulations="filteredRegulations"
              :categories="regulations.categories"
            />
          </div>

          <!-- Export Button -->
          <div v-if="planningData" class="export-section">
            <button @click="exportToPDF" class="btn btn-primary">
              📄 Exporteer als PDF
            </button>
          </div>
        </section>
      </div>

      <!-- Right Panel: Map -->
      <div class="right-panel">
        <MapView
          :location="selectedLocation"
          :geojson="geojsonData"
          ref="mapView"
        />
      </div>
    </div>

    <!-- Document Details Modal -->
    <DocumentModal
      v-if="selectedDocument"
      :document="selectedDocument"
      @close="selectedDocument = null"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import AddressSearch from './components/AddressSearch.vue'
import MapView from './components/MapView.vue'
import DocumentCard from './components/DocumentCard.vue'
import RegulationFilters from './components/RegulationFilters.vue'
import RegulationsList from './components/RegulationsList.vue'
import DocumentModal from './components/DocumentModal.vue'
import { exportPlanningDataToPDF } from './utils/pdfExport'

export default {
  name: 'App',
  components: {
    AddressSearch,
    MapView,
    DocumentCard,
    RegulationFilters,
    RegulationsList,
    DocumentModal
  },
  setup() {
    const selectedLocation = ref(null)
    const planningData = ref(null)
    const regulations = ref(null)
    const geojsonData = ref(null)
    const isLoading = ref(false)
    const error = ref(null)
    const selectedDocument = ref(null)
    const activeFilters = ref([])

    // Filtered regulations based on active filters
    const filteredRegulations = computed(() => {
      if (!regulations.value || !regulations.value.regulations) {
        return []
      }

      if (activeFilters.value.length === 0) {
        return regulations.value.regulations
      }

      // Filter regulations based on active category filters
      let filtered = []
      activeFilters.value.forEach(category => {
        if (regulations.value.categories[category]) {
          filtered = [...filtered, ...regulations.value.categories[category]]
        }
      })

      return filtered
    })

    /**
     * Handle address selection from search component
     */
    async function handleAddressSelected(location) {
      selectedLocation.value = location
      error.value = null
      isLoading.value = true

      try {
        // Fetch planning data
        await fetchPlanningData(location.lat, location.lon)

        // Fetch regulations
        await fetchRegulations(location.lat, location.lon)

        // Fetch GeoJSON for map
        await fetchGeoJSON(location.lat, location.lon)

      } catch (err) {
        console.error('Error fetching data:', err)
        error.value = err.message || 'Fout bij ophalen gegevens'
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Fetch planning data from backend
     */
    async function fetchPlanningData(lat, lon) {
      const response = await fetch('/api/dso/planning-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lat, lon })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fout bij ophalen planning data')
      }

      const data = await response.json()
      planningData.value = data.data
    }

    /**
     * Fetch regulations from backend
     */
    async function fetchRegulations(lat, lon, filters = []) {
      const response = await fetch('/api/dso/regulations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lat, lon, filters })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fout bij ophalen voorschriften')
      }

      const data = await response.json()
      regulations.value = data.regulations
    }

    /**
     * Fetch GeoJSON for map visualization
     */
    async function fetchGeoJSON(lat, lon) {
      const response = await fetch('/api/dso/geojson', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lat, lon })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Fout bij ophalen kaartgegevens')
      }

      const data = await response.json()
      geojsonData.value = data.geojson
    }

    /**
     * Handle errors from child components
     */
    function handleError(errorMessage) {
      error.value = errorMessage
    }

    /**
     * Show document details in modal
     */
    function showDocumentDetails(document) {
      selectedDocument.value = document
    }

    /**
     * Handle filter changes
     */
    function handleFilterChanged(filters) {
      activeFilters.value = filters
    }

    /**
     * Export data to PDF
     */
    function exportToPDF() {
      if (!selectedLocation.value || !planningData.value) {
        return
      }

      try {
        exportPlanningDataToPDF(
          selectedLocation.value,
          planningData.value,
          regulations.value
        )
      } catch (err) {
        console.error('PDF export error:', err)
        error.value = 'Fout bij exporteren naar PDF'
      }
    }

    return {
      selectedLocation,
      planningData,
      regulations,
      geojsonData,
      isLoading,
      error,
      selectedDocument,
      filteredRegulations,
      handleAddressSelected,
      handleError,
      showDocumentDetails,
      handleFilterChanged,
      exportToPDF
    }
  }
}
</script>
