<template>
  <div class="map-container">
    <div id="map" ref="mapElement"></div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import L from 'leaflet'

export default {
  name: 'MapView',
  props: {
    location: {
      type: Object,
      default: null
    },
    geojson: {
      type: Object,
      default: null
    }
  },
  setup(props) {
    const mapElement = ref(null)
    let map = null
    let markers = []
    let geoJsonLayer = null

    onMounted(() => {
      // Initialize map
      map = L.map('map').setView([52.3676, 4.9041], 7) // Netherlands center

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map)

      // Add scale
      L.control.scale().addTo(map)
    })

    // Watch for location changes
    watch(() => props.location, (newLocation) => {
      if (newLocation && map) {
        updateMapLocation(newLocation)
      }
    })

    // Watch for GeoJSON changes
    watch(() => props.geojson, (newGeoJson) => {
      if (newGeoJson && map) {
        updateGeoJsonLayer(newGeoJson)
      }
    })

    /**
     * Update map location and add marker
     */
    function updateMapLocation(location) {
      // Clear existing markers
      markers.forEach(marker => map.removeLayer(marker))
      markers = []

      // Add new marker
      const marker = L.marker([location.lat, location.lon])
        .addTo(map)
        .bindPopup(`<b>${location.display_name}</b><br>${location.city}`)
        .openPopup()

      markers.push(marker)

      // Center map on location
      map.setView([location.lat, location.lon], 16)
    }

    /**
     * Update GeoJSON layer on map
     */
    function updateGeoJsonLayer(geojson) {
      // Remove existing GeoJSON layer
      if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer)
      }

      // Add new GeoJSON layer
      geoJsonLayer = L.geoJSON(geojson, {
        style: function(feature) {
          if (feature.properties.type === 'plan_area') {
            return {
              color: '#3388ff',
              weight: 2,
              opacity: 0.6,
              fillOpacity: 0.2
            }
          }
          return {
            color: '#ff7800',
            weight: 2,
            opacity: 0.8
          }
        },
        onEachFeature: function(feature, layer) {
          if (feature.properties) {
            let popupContent = '<div class="map-popup">'

            if (feature.properties.title) {
              popupContent += `<strong>${feature.properties.title}</strong><br>`
            }
            if (feature.properties.bevoegdGezag) {
              popupContent += `Bevoegd gezag: ${feature.properties.bevoegdGezag}<br>`
            }
            if (feature.properties.status) {
              popupContent += `Status: ${feature.properties.status}`
            }

            popupContent += '</div>'
            layer.bindPopup(popupContent)
          }
        }
      }).addTo(map)

      // Fit map to GeoJSON bounds if we have features
      if (geojson.features && geojson.features.length > 1) {
        const bounds = geoJsonLayer.getBounds()
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50] })
        }
      }
    }

    return {
      mapElement
    }
  }
}
</script>
