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
