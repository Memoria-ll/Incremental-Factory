// src/components/tabs/DrillingTab.vue
<template>
  <div class="drilling-tab">
    <MiningSection 
      :resources="resources"
      :current-depth="gameState.currentDepth"
      :efficiency="miningEfficiency"
      @mine="handleMining"
    />
    
    <SeparationSection 
      :raw-materials="rawMaterials"
      :separation-efficiency="separationEfficiency"
      @separate="handleSeparation"
    />
    
    <DepthInfoPanel 
      :current-depth="gameState.currentDepth"
      :depth-characteristics="depthCharacteristics"
    />
  </div>
</template>

<script>
import MiningSection from '../sections/MiningSection.vue'
import SeparationSection from '../sections/SeparationSection.vue'
import DepthInfoPanel from '../panels/DepthInfoPanel.vue'

export default {
  name: 'DrillingTab',
  components: {
    MiningSection,
    SeparationSection,
    DepthInfoPanel
  },
  props: {
    resources: { type: Object, required: true },
    gameState: { type: Object, required: true }
  },
  emits: ['updateResources'],
  computed: {
    rawMaterials() {
      return {
        soil: this.resources.soil || 0,
        rocks: this.resources.rocks || 0,
        sediment: this.resources.sediment || 0
      }
    },
    miningEfficiency() {
      const depth = this.gameState.currentDepth || 50
      const baseEfficiency = 100
      const depthBonus = Math.floor(depth / 100) * 10
      return baseEfficiency + depthBonus
    },
    separationEfficiency() {
      return this.gameState.upgrades?.separation || 100
    },
    depthCharacteristics() {
      const depth = this.gameState.currentDepth || 50
      return {
        temperature: 15 + (depth * 0.025),
        pressure: depth * 0.01,
        hardness: Math.min(100, depth / 50),
        oreConcentration: Math.max(1, depth / 200)
      }
    }
  },
  methods: {
    handleMining(data) {
      this.$emit('updateResources', {
        type: 'mine',
        resource: data.resource,
        amount: data.amount
      })
    },
    handleSeparation(data) {
      this.$emit('updateResources', {
        type: 'separate',
        input: data.input,
        output: data.output
      })
    }
  }
}
</script>

// src/components/tabs/SmeltingTab.vue
<template>
  <div class="smelting-tab">
    <SmeltingSection 
      :ore-resources="oreResources"
      :smelting-efficiency="smeltingEfficiency"
      :temperature="furnaceTemperature"
      @smelt="handleSmelting"
    />
    
    <FurnaceControlSection 
      :temperature="furnaceTemperature"
      :fuel-consumption="fuelConsumption"
      :cooling-rate="coolingRate"
      @adjust-temperature="adjustTemperature"
    />
    
    <MetalQualitySection 
      :metals="processedMetals"
      :quality-ratings="metalQuality"
    />
  </div>
</template>

<script>
import SmeltingSection from '../sections/SmeltingSection.vue'
import FurnaceControlSection from '../sections/FurnaceControlSection.vue'
import MetalQualitySection from '../sections/MetalQualitySection.vue'

export default {
  name: 'SmeltingTab',
  components: {
    SmeltingSection,
    FurnaceControlSection,
    MetalQualitySection
  },
  props: {
    resources: { type: Object, required: true },
    gameState: { type: Object, required: true }
  },
  emits: ['updateResources'],
  data() {
    return {
      furnaceTemperature: 800
    }
  },
  computed: {
    oreResources() {
      return {
        iron_ore: this.resources.iron_ore || 0,
        copper_ore: this.resources.copper_ore || 0,
        rare_ore: this.resources.rare_ore || 0
      }
    },
    processedMetals() {
      return {
        iron: this.resources.iron || 0,
        copper: this.resources.copper || 0,
        alloys: this.resources.alloys || 0
      }
    },
    smeltingEfficiency() {
      const baseEfficiency = 100
      const temperatureBonus = Math.max(0, (this.furnaceTemperature - 600) / 10)
      return baseEfficiency + temperatureBonus
    },
    fuelConsumption() {
      return this.furnaceTemperature / 100
    },
    coolingRate() {
      return this.gameState.cooling?.rate || 50
    },
    metalQuality() {
      return {
        iron: Math.min(100, this.smeltingEfficiency),
        copper: Math.min(100, this.smeltingEfficiency * 0.9),
        alloys: Math.min(100, this.smeltingEfficiency * 1.2)
      }
    }
  },
  methods: {
    handleSmelting(data) {
      this.$emit('updateResources', {
        type: 'smelt',
        input: data.input,
        output: data.output,
        efficiency: this.smeltingEfficiency
      })
    },
    adjustTemperature(newTemp) {
      this.furnaceTemperature = Math.max(200, Math.min(1500, newTemp))
    }
  }
}
</script>

// src/components/tabs/ManufacturingTab.vue
<template>
  <div class="manufacturing-tab">
    <ProductionLineSection 
      :metals="availableMetals"
      :production-recipes="recipes"
      :efficiency="productionEfficiency"
      @manufacture="handleManufacturing"
    />
    
    <QualityControlSection 
      :products="manufacturedProducts"
      :quality-standards="qualityStandards"
      @quality-check="handleQualityControl"
    />
    
    <AutomationSection 
      :automation-level="automationLevel"
      :available-upgrades="automationUpgrades"
      @upgrade-automation="handleAutomationUpgrade"
    />
  </div>
</template>

<script>
import ProductionLineSection from '../sections/ProductionLineSection.vue'
import QualityControlSection from '../sections/QualityControlSection.vue'
import AutomationSection from '../sections/AutomationSection.vue'

export default {
  name: 'ManufacturingTab',
  components: {
    ProductionLineSection,
    QualityControlSection,
    AutomationSection
  },
  props: {
    resources: { type: Object, required: true },
    gameState: { type: Object, required: true }
  },
  emits: ['updateResources'],
  computed: {
    availableMetals() {
      return {
        iron: this.resources.iron || 0,
        copper: this.resources.copper || 0,
        steel: this.resources.steel || 0
      }
    },
    manufacturedProducts() {
      return {
        components: this.resources.components || 0,
        circuits: this.resources.circuits || 0,
        machinery: this.resources.machinery || 0
      }
    },
    recipes() {
      return [
        {
          id: 'wire',
          name: '配線',
          inputs: { copper: 5 },
          outputs: { wire: 1 },
          time: 2
        },
        {
          id: 'circuit',
          name: '回路',
          inputs: { copper: 10, wire: 5 },
          outputs: { circuit: 1 },
          time: 5
        }
      ]
    },
    productionEfficiency() {
      return this.gameState.manufacturing?.efficiency || 100
    },
    automationLevel() {
      return this.gameState.automation?.level || 0
    },
    qualityStandards() {
      return this.gameState.quality?.standards || {}
    },
    automationUpgrades() {
      return [
        { id: 'conveyor', name: 'コンベアシステム', cost: 500 },
        { id: 'robotics', name: 'ロボット工学', cost: 1500 }
      ]
    }
  },
  methods: {
    handleManufacturing(data) {
      this.$emit('updateResources', {
        type: 'manufacture',
        recipe: data.recipe,
        quantity: data.quantity
      })
    },
    handleQualityControl(data) {
      // 品質管理処理
    },
    handleAutomationUpgrade(upgrade) {
      // 自動化アップグレード処理
    }
  }
}
</script>

// src/components/tabs/EfficiencyTab.vue
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