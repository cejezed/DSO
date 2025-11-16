<template>
  <div class="document-card" @click="$emit('show-details', document)">
    <div class="document-header">
      <h4>{{ document.title }}</h4>
      <span class="document-status" :class="statusClass">{{ document.status }}</span>
    </div>

    <div class="document-body">
      <div class="document-info">
        <span class="info-label">Type:</span>
        <span>{{ document.type }}</span>
      </div>

      <div class="document-info" v-if="document.bevoegdGezag">
        <span class="info-label">Bevoegd gezag:</span>
        <span>{{ document.bevoegdGezag }}</span>
      </div>

      <div class="document-info" v-if="document.geldigVanaf">
        <span class="info-label">Geldig vanaf:</span>
        <span>{{ formatDate(document.geldigVanaf) }}</span>
      </div>

      <div v-if="document.annotations && document.annotations.length > 0" class="document-stats">
        📝 {{ document.annotations.length }} annotaties
      </div>

      <div v-if="document.regulations && document.regulations.length > 0" class="document-stats">
        📖 {{ document.regulations.length }} voorschriften
      </div>
    </div>

    <div class="document-footer">
      <button class="btn-link">Details bekijken →</button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'DocumentCard',
  props: {
    document: {
      type: Object,
      required: true
    }
  },
  emits: ['show-details'],
  setup(props) {
    const statusClass = computed(() => {
      const status = props.document.status?.toLowerCase() || ''
      if (status.includes('vastgesteld') || status.includes('onherroepelijk')) {
        return 'status-active'
      }
      if (status.includes('ontwerp')) {
        return 'status-draft'
      }
      return 'status-unknown'
    })

    function formatDate(dateString) {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('nl-NL')
      } catch {
        return dateString
      }
    }

    return {
      statusClass,
      formatDate
    }
  }
}
</script>
