<template>
  <header class="game-header">
    <div class="header-top">
      <h1 class="header-title">セレニアンの遺産</h1>
      <div class="environmental-info">
        <div class="env-stat">
          <div class="env-label">セレスの意思</div>
          <div class="env-value">{{ formatNumber(celestialWill) }}</div>
        </div>
        <div class="env-stat">
          <div class="env-label">週</div>
          <div class="env-value">{{ currentWeek }}</div>
        </div>
        <div class="env-stat">
          <div class="env-label">深度</div>
          <div class="env-value">{{ currentDepth }}m</div>
        </div>
        <div class="env-stat">
          <div class="env-label">温度</div>
          <div class="env-value">{{ temperature }}°C</div>
        </div>
      </div>
    </div>
    
    <!-- 深度セレクター（掘削・分離タブでのみ表示） -->
    <div v-if="showDepthSelector" class="depth-selector">
      <span class="depth-label">掘削深度:</span>
      <div class="depth-options">
        <button 
          v-for="depth in availableDepths" 
          :key="depth.level"
          @click="$emit('selectDepth', depth.level)"
          :class="['depth-option', { active: currentDepth === depth.level, locked: depth.locked }]"
        >
          <div class="depth-name">{{ depth.name }}</div>
          <div class="depth-range">{{ depth.range }}</div>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'GameHeader',
  props: {
    celestialWill: { type: Number, required: true },
    currentWeek: { type: Number, required: true },
    currentDepth: { type: Number, required: true },
    temperature: { type: Number, default: 15 },
    showDepthSelector: { type: Boolean, default: false },
    availableDepths: { type: Array, default: () => [] }
  },
  emits: ['selectDepth'],
  methods: {
    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
      return Math.floor(num).toString()
    }
  }
}
</script>
