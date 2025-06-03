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
