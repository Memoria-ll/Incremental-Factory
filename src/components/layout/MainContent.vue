<template>
  <div class="content-area">
    <div class="main-content">
      <div class="content-grid">
        <div class="left-panel">
          <component 
            :is="currentTabComponent" 
            v-bind="tabProps"
            @update-resources="$emit('updateResources', $event)"
            @task-complete="$emit('taskComplete', $event)"
          />
        </div>
        <div class="right-panel">
          <ResourcePanel :resources="resources" />
          <UpgradePanel 
            :celestial-will="celestialWill"
            :available-upgrades="availableUpgrades"
            @purchase="$emit('purchaseUpgrade', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DrillingTab from '../tabs/DrillingTab.vue'
import SmeltingTab from '../tabs/SmeltingTab.vue'
import ManufacturingTab from '../tabs/ManufacturingTab.vue'
import PowerTab from '../tabs/PowerTab.vue'
import EfficiencyTab from '../tabs/EfficiencyTab.vue'
import ResourcePanel from '../panels/ResourcePanel.vue'
import UpgradePanel from '../panels/UpgradePanel.vue'

export default {
  name: 'MainContent',
  components: {
    DrillingTab,
    SmeltingTab,
    ManufacturingTab,
    PowerTab,
    EfficiencyTab,
    ResourcePanel,
    UpgradePanel
  },
  props: {
    activeTab: { type: String, required: true },
    resources: { type: Object, required: true },
    celestialWill: { type: Number, required: true },
    availableUpgrades: { type: Array, default: () => [] },
    gameState: { type: Object, required: true }
  },
  emits: ['updateResources', 'taskComplete', 'purchaseUpgrade'],
  computed: {
    currentTabComponent() {
      const tabMap = {
        drilling: 'DrillingTab',
        smelting: 'SmeltingTab',
        manufacturing: 'ManufacturingTab',
        power: 'PowerTab',
        efficiency: 'EfficiencyTab'
      }
      return tabMap[this.activeTab] || 'DrillingTab'
    },
    tabProps() {
      return {
        resources: this.resources,
        gameState: this.gameState
      }
    }
  }
}
</script>
