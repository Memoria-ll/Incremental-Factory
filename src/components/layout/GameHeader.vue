// src/components/layout/GameHeader.vue
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

// src/components/layout/GameSidebar.vue
<template>
  <aside class="sidebar">
    <div class="phase-section">
      <div class="phase-title">生産システム</div>
      <button 
        v-for="tab in productionTabs" 
        :key="tab.id"
        @click="$emit('selectTab', tab.id)"
        :class="['tab', { active: activeTab === tab.id, disabled: tab.disabled }]"
      >
        {{ tab.name }}
      </button>
    </div>
    
    <div class="phase-section">
      <div class="phase-title">管理システム</div>
      <button 
        v-for="tab in managementTabs" 
        :key="tab.id"
        @click="$emit('selectTab', tab.id)"
        :class="['tab', { active: activeTab === tab.id, disabled: tab.disabled }]"
      >
        {{ tab.name }}
      </button>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'GameSidebar',
  props: {
    activeTab: { type: String, required: true }
  },
  emits: ['selectTab'],
  data() {
    return {
      productionTabs: [
        { id: 'drilling', name: '掘削・分離', disabled: false },
        { id: 'smelting', name: '精錬', disabled: false },
        { id: 'manufacturing', name: '製造', disabled: false },
        { id: 'power', name: '電力・設備', disabled: false }
      ],
      managementTabs: [
        { id: 'efficiency', name: '効率管理', disabled: false },
        { id: 'research', name: '研究開発', disabled: true },
        { id: 'spacetime', name: '時空技術', disabled: true },
        { id: 'laws', name: '法則制御', disabled: true },
        { id: 'creation', name: '創造設計', disabled: true }
      ]
    }
  }
}
</script>

// src/components/layout/MainContent.vue
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

// src/components/layout/GameFooter.vue
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