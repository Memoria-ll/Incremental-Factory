<template>
  <div class="content-card mining-section">
    <h3 class="card-title">採掘システム</h3>
    
    <div class="mining-controls">
      <div class="depth-info">
        <span class="depth-label">現在深度: {{ currentDepth }}m</span>
        <span class="efficiency-label">採掘効率: {{ efficiency }}%</span>
      </div>
      
      <div class="mining-buttons">
        <button @click="mine('iron_ore')" class="mining-btn iron-btn">
          <div class="btn-content">
            <span class="btn-text">鉄鉱石採掘</span>
            <span class="btn-info">+{{ calculateMiningAmount('iron_ore') }}</span>
          </div>
        </button>
        
        <button @click="mine('copper_ore')" class="mining-btn copper-btn">
          <div class="btn-content">
            <span class="btn-text">銅鉱石採掘</span>
            <span class="btn-info">+{{ calculateMiningAmount('copper_ore') }}</span>
          </div>
        </button>
        
        <button @click="mine('rare_ore')" class="mining-btn rare-btn" :disabled="currentDepth < 300">
          <div class="btn-content">
            <span class="btn-text">希少鉱石採掘</span>
            <span class="btn-info">+{{ calculateMiningAmount('rare_ore') }}</span>
          </div>
        </button>
      </div>
      
      <div class="auto-mining" v-if="autoMiningAvailable">
        <button @click="toggleAutoMining" :class="['auto-btn', { active: autoMiningActive }]">
          {{ autoMiningActive ? '自動採掘停止' : '自動採掘開始' }}
        </button>
      </div>
    </div>
    
    <div class="mining-rates">
      <h4>採掘レート (1分間)</h4>
      <div class="rate-display">
        <div class="rate-item">
          <span>鉄鉱石:</span>
          <span>{{ formatNumber(miningRates.iron_ore) }}/分</span>
        </div>
        <div class="rate-item">
          <span>銅鉱石:</span>
          <span>{{ formatNumber(miningRates.copper_ore) }}/分</span>
        </div>
        <div class="rate-item" v-if="currentDepth >= 300">
          <span>希少鉱石:</span>
          <span>{{ formatNumber(miningRates.rare_ore) }}/分</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'MiningSection',
  props: {
    resources: { type: Object, required: true },
    currentDepth: { type: Number, default: 50 },
    efficiency: { type: Number, default: 100 }
  },
  emits: ['mine'],
  setup(props, { emit }) {
    const autoMiningActive = ref(false)
    const autoMiningAvailable = computed(() => props.currentDepth >= 100)
    
    const miningRates = computed(() => ({
      iron_ore: props.efficiency / 10,
      copper_ore: props.efficiency / 12,
      rare_ore: props.currentDepth >= 300 ? props.efficiency / 20 : 0
    }))
    
    const calculateMiningAmount = (resource) => {
      const baseAmount = Math.floor(Math.random() * 5) + 1
      const efficiencyMultiplier = props.efficiency / 100
      const depthMultiplier = Math.max(1, props.currentDepth / 100)
      
      return Math.floor(baseAmount * efficiencyMultiplier * depthMultiplier)
    }
    
    const mine = (resource) => {
      const amount = calculateMiningAmount(resource)
      emit('mine', { resource, amount })
    }
    
    const toggleAutoMining = () => {
      autoMiningActive.value = !autoMiningActive.value
      // TODO: 自動採掘ロジックの実装
    }
    
    const formatNumber = (num) => {
      return Math.floor(num).toString()
    }
    
    return {
      autoMiningActive,
      autoMiningAvailable,
      miningRates,
      calculateMiningAmount,
      mine,
      toggleAutoMining,
      formatNumber
    }
  }
}
</script>

<style scoped>
.mining-section {
  margin-bottom: 20px;
}

.mining-controls {
  margin-bottom: 20px;
}

.depth-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(0, 100, 200, 0.1);
  border-radius: 6px;
  border: 1px solid #006699;
}

.depth-label, .efficiency-label {
  color: #66aaff;
  font-weight: bold;
}

.mining-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.mining-btn {
  padding: 15px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
  font-weight: bold;
}

.iron-btn {
  background: linear-gradient(45deg, #8B4513, #A0522D);
}

.copper-btn {
  background: linear-gradient(45deg, #B87333, #CD853F);
}

.rare-btn {
  background: linear-gradient(45deg, #9932CC, #BA55D3);
}

.mining-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.mining-btn:disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.btn-text {
  font-size: 1rem;
}

.btn-info {
  font-size: 0.8rem;
  opacity: 0.8;
}

.auto-mining {
  text-align: center;
}

.auto-btn {
  padding: 12px 24px;
  background: #666;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.auto-btn.active {
  background: #00cc66;
}

.auto-btn:hover {
  background: #555;
}

.auto-btn.active:hover {
  background: #00aa55;
}

.mining-rates h4 {
  color: #00d4ff;
  margin-bottom: 10px;
}

.rate-display {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.rate-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(0, 100, 0, 0.1);
  border-radius: 4px;
  border: 1px solid #004400;
}

.rate-item span:first-child {
  color: #aaa;
}

.rate-item span:last-child {
  color: #00cc66;
  font-weight: bold;
}
</style>