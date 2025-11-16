<template>
  <div class="address-search">
    <div class="search-input-group">
      <input
        v-model="searchQuery"
        @keyup.enter="performSearch"
        type="text"
        placeholder="Bijv: Plein 1945 1, Haarlem"
        class="search-input"
      />
      <button @click="performSearch" :disabled="isSearching" class="btn btn-search">
        {{ isSearching ? 'Zoeken...' : 'Zoek' }}
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isSearching" class="searching">
      Adres wordt gezocht...
    </div>

    <!-- Search Results -->
    <div v-if="searchResults.length > 0" class="search-results">
      <h4>Resultaten ({{ searchResults.length }})</h4>
      <div
        v-for="result in searchResults"
        :key="result.id"
        @click="selectAddress(result)"
        class="search-result-item"
      >
        <div class="result-name">{{ result.display_name }}</div>
        <div class="result-details">
          {{ result.city }}, {{ result.municipality }}
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="searchPerformed && searchResults.length === 0 && !isSearching" class="no-results">
      Geen adressen gevonden. Probeer een ander adres.
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'AddressSearch',
  emits: ['address-selected', 'error'],
  setup(props, { emit }) {
    const searchQuery = ref('')
    const searchResults = ref([])
    const isSearching = ref(false)
    const searchPerformed = ref(false)

    /**
     * Perform geocoding search
     */
    async function performSearch() {
      if (!searchQuery.value || searchQuery.value.trim() === '') {
        emit('error', 'Voer een adres in')
        return
      }

      isSearching.value = true
      searchPerformed.value = false
      searchResults.value = []

      try {
        const response = await fetch('/api/geocode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            address: searchQuery.value
          })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Fout bij zoeken')
        }

        const data = await response.json()
        searchResults.value = data.results || []
        searchPerformed.value = true

        // Auto-select if only one result
        if (searchResults.value.length === 1) {
          selectAddress(searchResults.value[0])
        }

      } catch (error) {
        console.error('Search error:', error)
        emit('error', error.message)
      } finally {
        isSearching.value = false
      }
    }

    /**
     * Select an address from search results
     */
    function selectAddress(address) {
      emit('address-selected', address)
      searchResults.value = []
      searchPerformed.value = false
    }

    return {
      searchQuery,
      searchResults,
      isSearching,
      searchPerformed,
      performSearch,
      selectAddress
    }
  }
}
</script>
