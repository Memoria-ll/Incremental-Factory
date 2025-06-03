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
