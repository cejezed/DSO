<template>
  <div class="regulations-list">
    <div v-if="regulations.length === 0" class="no-regulations">
      Geen voorschriften gevonden.
    </div>

    <div v-else class="regulations-items">
      <div
        v-for="(reg, index) in regulations"
        :key="reg.id || index"
        class="regulation-item"
      >
        <div class="regulation-header">
          <span class="regulation-type">{{ getRegulationType(reg) }}</span>
          <span v-if="reg.planTitle" class="regulation-plan">{{ reg.planTitle }}</span>
        </div>

        <div class="regulation-content">
          <h5 v-if="reg.naam">{{ reg.naam }}</h5>
          <p v-if="reg.omschrijving">{{ reg.omschrijving }}</p>

          <!-- Annotatie specifieke velden -->
          <div v-if="reg.type === 'annotatie'" class="annotation-details">
            <div v-if="reg.waarde" class="detail-item">
              <strong>Waarde:</strong> {{ reg.waarde }} {{ reg.eenheid || '' }}
            </div>
            <div v-if="reg.groep" class="detail-item">
              <strong>Groep:</strong> {{ reg.groep }}
            </div>
          </div>

          <!-- Regel specifieke velden -->
          <div v-if="reg.thema" class="detail-item">
            <strong>Thema:</strong> {{ reg.thema }}
          </div>

          <div v-if="reg.inhoud" class="regulation-text">
            {{ truncateText(reg.inhoud, 200) }}
          </div>
        </div>

        <div v-if="reg.bevoegdGezag" class="regulation-footer">
          <small>Bevoegd gezag: {{ reg.bevoegdGezag }}</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegulationsList',
  props: {
    regulations: {
      type: Array,
      required: true
    },
    categories: {
      type: Object,
      default: () => ({})
    }
  },
  setup() {
    function getRegulationType(regulation) {
      if (regulation.type === 'annotatie') {
        return '📝 Annotatie'
      }
      if (regulation.thema) {
        return `📖 ${regulation.thema}`
      }
      return '📄 Voorschrift'
    }

    function truncateText(text, maxLength) {
      if (!text) return ''
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }

    return {
      getRegulationType,
      truncateText
    }
  }
}
</script>
