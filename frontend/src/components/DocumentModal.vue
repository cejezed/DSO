<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>{{ document.title }}</h2>
        <button @click="$emit('close')" class="modal-close">✕</button>
      </div>

      <div class="modal-body">
        <div class="document-details">
          <div class="detail-row">
            <strong>Type:</strong>
            <span>{{ document.type }}</span>
          </div>

          <div class="detail-row">
            <strong>Status:</strong>
            <span class="document-status" :class="getStatusClass(document.status)">
              {{ document.status }}
            </span>
          </div>

          <div v-if="document.bevoegdGezag" class="detail-row">
            <strong>Bevoegd gezag:</strong>
            <span>{{ document.bevoegdGezag }}</span>
          </div>

          <div v-if="document.geldigVanaf" class="detail-row">
            <strong>Geldig vanaf:</strong>
            <span>{{ formatDate(document.geldigVanaf) }}</span>
          </div>

          <div v-if="document.geldigTot" class="detail-row">
            <strong>Geldig tot:</strong>
            <span>{{ formatDate(document.geldigTot) }}</span>
          </div>

          <div v-if="document.citation" class="detail-row">
            <strong>Citeertitel:</strong>
            <span>{{ document.citation }}</span>
          </div>
        </div>

        <!-- Annotations -->
        <div v-if="document.annotations && document.annotations.length > 0" class="section">
          <h3>Annotaties ({{ document.annotations.length }})</h3>
          <div class="annotations-list">
            <div
              v-for="(ann, index) in document.annotations"
              :key="index"
              class="annotation-item"
            >
              <strong>{{ ann.naam }}</strong>
              <div v-if="ann.waarde">
                Waarde: {{ ann.waarde }} {{ ann.eenheid || '' }}
              </div>
              <div v-if="ann.groep">
                Groep: {{ ann.groep }}
              </div>
            </div>
          </div>
        </div>

        <!-- Regulations -->
        <div v-if="document.regulations && document.regulations.length > 0" class="section">
          <h3>Voorschriften ({{ document.regulations.length }})</h3>
          <div class="regulations-list">
            <div
              v-for="(reg, index) in document.regulations"
              :key="index"
              class="regulation-item"
            >
              <div v-if="reg.omschrijving"><strong>{{ reg.omschrijving }}</strong></div>
              <div v-if="reg.thema">Thema: {{ reg.thema }}</div>
              <div v-if="reg.inhoud" class="regulation-content">{{ reg.inhoud }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn btn-secondary">Sluiten</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DocumentModal',
  props: {
    document: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup() {
    function formatDate(dateString) {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('nl-NL')
      } catch {
        return dateString
      }
    }

    function getStatusClass(status) {
      const statusLower = status?.toLowerCase() || ''
      if (statusLower.includes('vastgesteld') || statusLower.includes('onherroepelijk')) {
        return 'status-active'
      }
      if (statusLower.includes('ontwerp')) {
        return 'status-draft'
      }
      return 'status-unknown'
    }

    return {
      formatDate,
      getStatusClass
    }
  }
}
</script>
