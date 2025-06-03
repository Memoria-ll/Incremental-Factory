<template>
  <div class="content-card smelting-section">
    <h3 class="card-title">精錬システム</h3>
    
    <div class="smelting-processes">
      <div class="process-card" v-for="process in smeltingProcesses" :key="process.id">
        <div class="process-header">
          <h4>{{ process.name }}</h4>
          <span class="process-efficiency">効率: {{ smeltingEfficiency }}%</span>
        </div>
        
        <div class="process-recipe">
          <div class="recipe-input">
            <span>{{ process.input.name }}</span>
            <span class="amount">{{ process.input.amount }}</span>
          </div>
          <div class="recipe-arrow">→</div>
          <div class="recipe-output">
            <span>{{ process.output.name }}</span>
            <span class="amount">{{ process.output.amount }}</span>
          </div>
        </div>
        
        <div class="process-controls">
          <button 
            @click="startSmelting(process)"
            :disabled="!canSmelt(process)"
            class="smelt-btn"
          >
            精錬開始
          </button>
          <div class="process-info">
            <span>所要時間: {{ process.time }}秒</span>
            <span>エネルギー: {{ process.energyCost }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="temperature-control">
      <h4>炉温制御</h4>
      <div class="temp-display">
        <span class="temp-label">現在温度:</span>
        <span class="temp-value">{{ temperature }}°C</span>
      </div>
      <input 
        type="range" 
        min="600" 
        max="1500" 
        v-model="temperature"
        class="temp-slider"
      />
      <div class="temp-effects">
        <span>燃料消費: {{ fuelConsumption }}/分</span>
        <span>効率ボーナス: +{{ temperatureBonus }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'SmeltingSection',
  props: {
    oreResources: { type: Object, required: true },
    smeltingEfficiency: { type: Number, default: 100 },
    temperature: { type: Number, default: 800 }
  },
  emits: ['smelt', 'adjust-temperature'],
  setup(props, { emit }) {
    const temperature = ref(props.temperature)
    
    const smeltingProcesses = [
      {
        id: 'iron',
        name: '鉄精錬',
        input: { name: '鉄鉱石', amount: 10 },
        output: { name: '鉄', amount: 1 },
        time: 30,
        energyCost: 5
      },
      {
        id: 'copper',
        name: '銅精錬',
        input: { name: '銅鉱石', amount: 8 },
        output: { name: '銅', amount: 1 },
        time: 25,
        energyCost: 4
      },
      {
        id: 'steel',
        name: '鋼鉄製造',
        input: { name: '鉄', amount: 2 },
        output: { name: '鋼鉄', amount: 1 },
        time: 60,
        energyCost: 10
      }
    ]
    
    const fuelConsumption = computed(() => {
      return Math.floor(temperature.value / 100)
    })
    
    const temperatureBonus = computed(() => {
      return Math.max(0, Math.floor((temperature.value - 600) / 10))
    })
    
    const canSmelt = (process) => {
      const inputResource = process.input.name.toLowerCase().replace(/[^a-z]/g, '_')
      return props.oreResources[inputResource] >= process.input.amount
    }
    
    const startSmelting = (process) => {
      if (canSmelt(process)) {
        emit('smelt', {
          input: { resource: process.input.name, amount: process.input.amount },
          output: { resource: process.output.name, amount: process.output.amount },
          energyCost: process.energyCost
        })
      }
    }
    
    return {
      temperature,
      smeltingProcesses,
      fuelConsumption,
      temperatureBonus,
      canSmelt,
      startSmelting
    }
  }
}
</script>

<style scoped>
.smelting-section {
  margin-bottom: 20px;
}

.smelting-processes {
  display: grid;
  gap: 15px;
  margin-bottom: 20px;
}

.process-card {
  padding: 15px;
  background: rgba(255, 69, 0, 0.1);
  border-radius: 8px;
  border: 1px solid #ff4500;
}

.process-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.process-header h4 {
  color: #ff6347;
  margin: 0;
}

.process-efficiency {
  color: #00cc66;
  font-size: 0.9rem;
  font-weight: bold;
}

.process-recipe {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  justify-content: center;
}

.recipe-input,
.recipe-output {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  min-width: 100px;
}

.recipe-arrow {
  color: #00d4ff;
  font-size: 1.5rem;
  font-weight: bold;
}

.amount {
  color: #ffaa00;
  font-weight: bold;
  margin-top: 5px;
}

.process-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.smelt-btn {
  padding: 8px 16px;
  background: #ff4500;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.smelt-btn:hover:not(:disabled) {
  background: #ff6347;
}

.smelt-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.process-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 0.8rem;
  color: #aaa;
}

.temperature-control {
  padding: 15px;
  background: rgba(255, 0, 0, 0.1);
  border-radius: 8px;
  border: 1px solid #cc0000;
}

.temperature-control h4 {
  color: #ff6666;
  margin-bottom: 15px;
}

.temp-display {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.temp-label {
  color: #aaa;
}

.temp-value {
  color: #ff6666;
  font-weight: bold;
  font-size: 1.2rem;
}

.temp-slider {
  width: 100%;
  margin-bottom: 10px;
}

.temp-effects {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.temp-effects span:first-child {
  color: #ffaa00;
}

.temp-effects span:last-child {
  color: #00cc66;
}
</style>
