<template>
  <footer class="bottom-bar">
    <div class="date-display">
      {{ currentDate }}
    </div>
    
    <div class="quota-progress">
      <div v-for="quota in weeklyQuotas" :key="quota.name" class="quota-item">
        <span>{{ quota.name }}</span>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: Math.min(100, (quota.current / quota.target) * 100) + '%' }"
          ></div>
        </div>
        <span>{{ quota.current }}/{{ quota.target }}</span>
      </div>
    </div>
    
    <div class="status-display">
      <div class="status-item">
        <div class="status-label">効率</div>
        <div class="status-value">{{ efficiency }}%</div>
      </div>
      <div class="status-item">
        <div class="status-label">電力</div>
        <div class="status-value">{{ power }}/{{ maxPower }}</div>
      </div>
      <div class="status-item">
        <div class="status-label">冷却</div>
        <div class="status-value">{{ cooling }}%</div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'GameFooter',
  props: {
    currentWeek: { type: Number, required: true },
    weeklyQuotas: { type: Array, default: () => [] },
    efficiency: { type: Number, default: 100 },
    power: { type: Number, default: 0 },
    maxPower: { type: Number, default: 100 },
    cooling: { type: Number, default: 100 }
  },
  computed: {
    currentDate() {
      const days = ['月', '火', '水', '木', '金']
      const dayIndex = (this.currentWeek - 1) % 5
      return `Week ${this.currentWeek} - ${days[dayIndex]}曜日`
    }
  }
}
</script>
