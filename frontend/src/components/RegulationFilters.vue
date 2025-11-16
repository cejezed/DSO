<template>
  <div class="regulation-filters">
    <h4>Filter op categorie:</h4>
    <div class="filter-buttons">
      <button
        v-for="(regs, category) in categories"
        :key="category"
        @click="toggleFilter(category)"
        :class="['filter-btn', { active: isActive(category) }]"
      >
        {{ getCategoryLabel(category) }} ({{ regs.length }})
      </button>

      <button
        v-if="activeFilters.length > 0"
        @click="clearFilters"
        class="filter-btn clear-btn"
      >
        ✕ Wis filters
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'RegulationFilters',
  props: {
    categories: {
      type: Object,
      required: true
    }
  },
  emits: ['filter-changed'],
  setup(props, { emit }) {
    const activeFilters = ref([])

    const categoryLabels = {
      bouwen: '🏗️ Bouwen',
      milieu: '🌱 Milieu',
      gebruik: '🏠 Gebruik',
      overig: '📋 Overig'
    }

    function toggleFilter(category) {
      const index = activeFilters.value.indexOf(category)
      if (index > -1) {
        activeFilters.value.splice(index, 1)
      } else {
        activeFilters.value.push(category)
      }
      emit('filter-changed', activeFilters.value)
    }

    function isActive(category) {
      return activeFilters.value.includes(category)
    }

    function clearFilters() {
      activeFilters.value = []
      emit('filter-changed', activeFilters.value)
    }

    function getCategoryLabel(category) {
      return categoryLabels[category] || category
    }

    return {
      activeFilters,
      toggleFilter,
      isActive,
      clearFilters,
      getCategoryLabel
    }
  }
}
</script>
