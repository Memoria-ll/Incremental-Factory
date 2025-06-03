<template>
  <div class="efficiency-tab">
    <TaskManagementSection 
      :current-tasks="currentTasks"
      :weekly-quotas="weeklyQuotas"
      :completion-rate="completionRate"
      @complete-task="handleTaskCompletion"
    />
    
    <PerformanceAnalysisSection 
      :efficiency-metrics="efficiencyMetrics"
      :trend-data="trendData"
      :recommendations="recommendations"
    />
    
    <UpgradeManagementSection 
      :celestial-will="gameState.celestialWill"
      :available-upgrades="availableUpgrades"
      :purchased-upgrades="purchasedUpgrades"
      @purchase-upgrade="handleUpgradePurchase"
    />
  </div>
</template>

<script>
import TaskManagementSection from '../sections/TaskManagementSection.vue'
import PerformanceAnalysisSection from '../sections/PerformanceAnalysisSection.vue'
import UpgradeManagementSection from '../sections/UpgradeManagementSection.vue'

export default {
  name: 'EfficiencyTab',
  components: {
    TaskManagementSection,
    PerformanceAnalysisSection,
    UpgradeManagementSection
  },
  props: {
    resources: { type: Object, required: true },
    gameState: { type: Object, required: true }
  },
  emits: ['taskComplete', 'purchaseUpgrade'],
  computed: {
    currentTasks() {
      return this.gameState.tasks?.current || []
    },
    weeklyQuotas() {
      return this.gameState.quotas?.weekly || []
    },
    completionRate() {
      const completed = this.currentTasks.filter(t => t.completed).length
      return this.currentTasks.length > 0 ? (completed / this.currentTasks.length) * 100 : 0
    },
    efficiencyMetrics() {
      return {
        production: this.gameState.metrics?.production || 100,
        automation: this.gameState.metrics?.automation || 0,
        quality: this.gameState.metrics?.quality || 100,
        speed: this.gameState.metrics?.speed || 100
      }
    },
    trendData() {
      return this.gameState.trends || []
    },
    recommendations() {
      // AI推奨システム（後で実装）
      return []
    },
    availableUpgrades() {
      return this.gameState.upgrades?.available || []
    },
    purchasedUpgrades() {
      return this.gameState.upgrades?.purchased || []
    }
  },
  methods: {
    handleTaskCompletion(task) {
      this.$emit('taskComplete', task)
    },
    handleUpgradePurchase(upgrade) {
      this.$emit('purchaseUpgrade', upgrade)
    }
  }
}
</script>
