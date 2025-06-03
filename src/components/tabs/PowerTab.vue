<template>
  <div class="power-tab">
    <!-- 発電システム -->
    <div class="content-card power-generation">
      <h3 class="card-title">発電システム</h3>
      
      <div class="power-overview">
        <div class="power-stat">
          <span class="stat-label">総出力</span>
          <span class="stat-value">{{ totalPowerOutput }} kW</span>
        </div>
        <div class="power-stat">
          <span class="stat-label">燃料消費</span>
          <span class="stat-value">{{ fuelConsumption.toFixed(1) }}/時</span>
        </div>
      </div>
      
      <div class="generators-list">
        <div v-for="generator in generators" :key="generator.id" class="generator-card">
          <div class="generator-header">
            <h4>{{ generator.name }}</h4>
            <button 
              @click="toggleGenerator(generator.id)"
              :class="['generator-btn', generator.status]"
              :disabled="!generator.unlocked"
            >
              {{ generator.status === 'online' ? '停止' : '起動' }}
            </button>
          </div>
          
          <div class="generator-info">
            <div class="info-item">
              <span>出力: {{ generator.currentOutput }} / {{ generator.maxOutput }} kW</span>
            </div>
            <div class="info-item">
              <span>効率: {{ generator.efficiency }}%</span>
            </div>
            <div class="info-item" v-if="generator.fuelType !== 'none'">
              <span>燃料: {{ generator.fuelType }}</span>
            </div>
          </div>
          
          <div v-if="generator.status === 'online'" class="generator-controls">
            <label>出力調整:</label>
            <input 
              type="range" 
              :min="0" 
              :max="generator.maxOutput"
              v-model="generator.currentOutput"
              class="output-slider"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 冷却システム -->
    <div class="content-card cooling-system">
      <h3 class="card-title">冷却システム</h3>
      
      <div class="temperature-display">
        <div class="temp-gauge">
          <span class="temp-label">システム温度</span>
          <span class="temp-value" :class="getTempClass(systemTemperature)">
            {{ systemTemperature.toFixed(1) }}°C
          </span>
        </div>
        <div class="cooling-efficiency">
          <span>冷却効率: {{ coolingEfficiency.toFixed(1) }}%</span>
        </div>
      </div>
      
      <div class="cooling-systems">
        <div v-for="system in coolingSystems" :key="system.id" class="cooling-card">
          <div class="cooling-header">
            <h4>{{ system.name }}</h4>
            <button 
              @click="toggleCooling(system.id)"
              :class="['cooling-btn', system.status]"
              :disabled="!system.unlocked"
            >
              {{ system.status === 'online' ? '停止' : '起動' }}
            </button>
          </div>
          
          <div class="cooling-info">
            <div class="info-item">
              <span>冷却力: {{ system.currentOutput }} / {{ system.capacity }}</span>
            </div>
            <div class="info-item">
              <span>効率: {{ system.efficiency }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 電力配分 -->
    <div class="content-card power-distribution">
      <h3 class="card-title">電力配分</h3>
      
      <div class="power-balance">
        <div class="balance-item">
          <span class="balance-label">供給</span>
          <span class="balance-value">{{ totalPowerOutput }} kW</span>
        </div>
        <div class="balance-arrow">→</div>
        <div class="balance-item">
          <span class="balance-label">需要</span>
          <span class="balance-value">{{ totalPowerDemand }} kW</span>
        </div>
      </div>
      
      <div class="consumers-list">
        <div v-for="consumer in powerConsumers" :key="consumer.id" class="consumer-item">
          <span class="consumer-name">{{ consumer.name }}</span>
          <span class="consumer-demand">{{ consumer.demand }} kW</span>
          <span class="consumer-priority" :class="consumer.priority">{{ consumer.priority }}</span>
        </div>
      </div>
    </div>
    
    <!-- システム状態 -->
    <div class="content-card system-status">
      <h3 class="card-title">システム状態</h3>
      
      <div class="status-overview">
        <div class="status-indicator" :class="overallStatus">
          {{ getStatusText(overallStatus) }}
        </div>
      </div>
      
      <div class="metrics-display">
        <div class="metric-item">
          <span>電力効率: {{ powerEfficiency.toFixed(1) }}%</span>
        </div>
        <div class="metric-item">
          <span>熱効率: {{ thermalEfficiency.toFixed(1) }}%</span>
        </div>
        <div class="metric-item">
          <span>システム稼働率: {{ systemReliability.toFixed(1) }}%</span>
        </div>
      </div>
      
      <div v-if="systemAlerts.length > 0" class="alerts-section">
        <h4>アラート</h4>
        <div v-for="alert in systemAlerts" :key="alert.id" class="alert-item" :class="alert.type">
          {{ alert.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'

export default {
  name: 'PowerTab',
  props: {
    resources: { type: Object, required: true },
    gameState: { type: Object, required: true }
  },
  emits: ['updateResources'],
  setup(props, { emit }) {
    // 発電機リスト
    const generators = reactive([
      {
        id: 'hand_crank',
        name: '手動発電機',
        maxOutput: 10,
        currentOutput: 0,
        efficiency: 100,
        fuelType: 'none',
        status: 'offline',
        unlocked: true
      },
      {
        id: 'coal_generator',
        name: '石炭発電機',
        maxOutput: 50,
        currentOutput: 0,
        efficiency: 75,
        fuelType: 'coal',
        status: 'offline',
        unlocked: props.gameState.currentDepth >= 100
      },
      {
        id: 'geothermal',
        name: '地熱発電機',
        maxOutput: 100,
        currentOutput: 0,
        efficiency: 90,
        fuelType: 'none',
        status: 'offline',
        unlocked: props.gameState.currentDepth >= 1000
      }
    ])
    
    // 冷却システム
    const coolingSystems = reactive([
      {
        id: 'air_cooling',
        name: '空冷システム',
        capacity: 50,
        currentOutput: 0,
        efficiency: 60,
        status: 'offline',
        unlocked: true
      },
      {
        id: 'water_cooling',
        name: '水冷システム',
        capacity: 150,
        currentOutput: 0,
        efficiency: 85,
        status: 'offline',
        unlocked: props.gameState.currentDepth >= 500
      }
    ])
    
    // 電力消費者
    const powerConsumers = reactive([
      { id: 'mining', name: '採掘装置', demand: 25, priority: 'high' },
      { id: 'smelting', name: '精錬炉', demand: 40, priority: 'high' },
      { id: 'manufacturing', name: '製造設備', demand: 30, priority: 'medium' },
      { id: 'life_support', name: '生命維持', demand: 15, priority: 'critical' },
      { id: 'research', name: '研究施設', demand: 20, priority: 'low' }
    ])
    
    // システムアラート
    const systemAlerts = ref([])
    
    // 計算プロパティ
    const totalPowerOutput = computed(() => {
      return generators.reduce((total, gen) => {
        return total + (gen.status === 'online' ? gen.currentOutput : 0)
      }, 0)
    })
    
    const totalPowerDemand = computed(() => {
      return powerConsumers.reduce((total, consumer) => total + consumer.demand, 0)
    })
    
    const fuelConsumption = computed(() => {
      return generators.reduce((total, gen) => {
        if (gen.status === 'online' && gen.fuelType !== 'none') {
          return total + (gen.currentOutput * 0.1)
        }
        return total
      }, 0)
    })
    
    const systemTemperature = computed(() => {
      const baseTemp = props.gameState.temperature || 15
      const heatGeneration = totalPowerOutput.value * 0.5
      const cooling = coolingSystems.reduce((total, sys) => {
        return total + (sys.status === 'online' ? sys.currentOutput : 0)
      }, 0)
      return Math.max(baseTemp, baseTemp + heatGeneration - cooling)
    })
    
    const coolingEfficiency = computed(() => {
      const totalCooling = coolingSystems.reduce((total, sys) => {
        return total + (sys.status === 'online' ? sys.currentOutput : 0)
      }, 0)
      const requiredCooling = Math.max(0, systemTemperature.value - 25)
      return requiredCooling > 0 ? Math.min(100, (totalCooling / requiredCooling) * 100) : 100
    })
    
    const powerEfficiency = computed(() => {
      const supplyDemandRatio = totalPowerDemand.value > 0 ? totalPowerOutput.value / totalPowerDemand.value : 1
      return Math.min(100, supplyDemandRatio * 100)
    })
    
    const thermalEfficiency = computed(() => coolingEfficiency.value)
    
    const systemReliability = computed(() => {
      return (powerEfficiency.value + thermalEfficiency.value) / 2
    })
    
    const overallStatus = computed(() => {
      if (systemTemperature.value > 80 || powerEfficiency.value < 50) return 'critical'
      if (systemTemperature.value > 60 || powerEfficiency.value < 80) return 'warning'
      return 'normal'
    })
    
    // メソッド
    const toggleGenerator = (generatorId) => {
      const generator = generators.find(g => g.id === generatorId)
      if (generator && generator.unlocked) {
        if (generator.status === 'offline') {
          generator.status = 'online'
          generator.currentOutput = Math.floor(generator.maxOutput * 0.5)
        } else {
          generator.status = 'offline'
          generator.currentOutput = 0
        }
      }
    }
    
    const toggleCooling = (systemId) => {
      const system = coolingSystems.find(s => s.id === systemId)
      if (system && system.unlocked) {
        if (system.status === 'offline') {
          system.status = 'online'
          system.currentOutput = Math.floor(system.capacity * 0.7)
        } else {
          system.status = 'offline'
          system.currentOutput = 0
        }
      }
    }
    
    const getTempClass = (temp) => {
      if (temp > 80) return 'critical'
      if (temp > 60) return 'warning'
      if (temp > 40) return 'elevated'
      return 'normal'
    }
    
    const getStatusText = (status) => {
      const texts = {
        normal: '正常稼働',
        warning: '注意が必要',
        critical: '緊急対応必要'
      }
      return texts[status] || '不明'
    }
    
    return {
      generators,
      coolingSystems,
      powerConsumers,
      systemAlerts,
      totalPowerOutput,
      totalPowerDemand,
      fuelConsumption,
      systemTemperature,
      coolingEfficiency,
      powerEfficiency,
      thermalEfficiency,
      systemReliability,
      overallStatus,
      toggleGenerator,
      toggleCooling,
      getTempClass,
      getStatusText
    }
  }
}
</script>

<style scoped>
.power-tab {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 20px;
  height: 100%;
}

.power-generation {
  grid-column: 1;
  grid-row: 1;
}

.cooling-system {
  grid-column: 2;
  grid-row: 1;
}

.power-distribution {
  grid-column: 1;
  grid-row: 2;
}

.system-status {
  grid-column: 2;
  grid-row: 2;
}

/* 発電システム */
.power-overview {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 100, 0, 0.1);
  border-radius: 8px;
  border: 1px solid #004400;
}

.power-stat {
  text-align: center;
}

.stat-label {
  display: block;
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.stat-value {
  color: #00cc66;
  font-weight: bold;
  font-size: 1.2rem;
}

.generators-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.generator-card {
  padding: 15px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 8px;
  border: 1px solid #ffd700;
}

.generator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.generator-header h4 {
  color: #ffd700;
  margin: 0;
}

.generator-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.generator-btn.online {
  background: #ff6666;
  color: white;
}

.generator-btn.offline {
  background: #00cc66;
  color: white;
}

.generator-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.generator-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 10px;
}

.info-item {
  color: #ccc;
  font-size: 0.9rem;
}

.generator-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.generator-controls label {
  color: #aaa;
  font-size: 0.9rem;
}

.output-slider {
  flex: 1;
  height: 6px;
  background: #333;
  outline: none;
  cursor: pointer;
}

/* 冷却システム */
.temperature-display {
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 100, 200, 0.1);
  border-radius: 8px;
  border: 1px solid #006699;
}

.temp-gauge {
  text-align: center;
  margin-bottom: 10px;
}

.temp-label {
  display: block;
  color: #66aaff;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.temp-value {
  font-size: 2rem;
  font-weight: bold;
}

.temp-value.normal { color: #00cc66; }
.temp-value.elevated { color: #ffaa00; }
.temp-value.warning { color: #ff6600; }
.temp-value.critical { color: #ff0000; }

.cooling-efficiency {
  text-align: center;
  color: #66aaff;
  font-weight: bold;
}

.cooling-systems {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cooling-card {
  padding: 15px;
  background: rgba(0, 150, 255, 0.1);
  border-radius: 8px;
  border: 1px solid #0096ff;
}

.cooling-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.cooling-header h4 {
  color: #66aaff;
  margin: 0;
}

.cooling-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.cooling-btn.online {
  background: #ff6666;
  color: white;
}

.cooling-btn.offline {
  background: #0096ff;
  color: white;
}

.cooling-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.cooling-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

/* 電力配分 */
.power-balance {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 8px;
  border: 1px solid #ffd700;
}

.balance-item {
  text-align: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  min-width: 100px;
}

.balance-label {
  display: block;
  color: #aaa;
  font-size: 0.8rem;
  margin-bottom: 5px;
}

.balance-value {
  color: #fff;
  font-weight: bold;
  font-size: 1.2rem;
}

.balance-arrow {
  color: #00d4ff;
  font-size: 1.5rem;
  font-weight: bold;
}

.consumers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.consumer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.consumer-name {
  color: #ccc;
}

.consumer-demand {
  color: #fff;
  font-weight: bold;
}

.consumer-priority {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.8rem;
  font-weight: bold;
}

.consumer-priority.critical {
  background: #ff6600;
  color: white;
}

.consumer-priority.high {
  background: #ffaa00;
  color: white;
}

.consumer-priority.medium {
  background: #66cc00;
  color: white;
}

.consumer-priority.low {
  background: #0066cc;
  color: white;
}

/* システム状態 */
.status-overview {
  margin-bottom: 20px;
  text-align: center;
}

.status-indicator {
  padding: 15px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.1rem;
}

.status-indicator.normal {
  background: rgba(0, 204, 102, 0.2);
  border: 1px solid #00cc66;
  color: #00cc66;
}

.status-indicator.warning {
  background: rgba(255, 170, 0, 0.2);
  border: 1px solid #ffaa00;
  color: #ffaa00;
}

.status-indicator.critical {
  background: rgba(255, 102, 0, 0.2);
  border: 1px solid #ff6600;
  color: #ff6600;
}

.metrics-display {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  border: 1px solid #333;
  color: #ccc;
}

.alerts-section h4 {
  color: #ff6600;
  margin-bottom: 10px;
}

.alert-item {
  padding: 8px 12px;
  margin-bottom: 5px;
  border-radius: 4px;
  border-left: 4px solid;
}

.alert-item.warning {
  background: rgba(255, 170, 0, 0.1);
  border-left-color: #ffaa00;
  color: #ffaa00;
}

.alert-item.critical {
  background: rgba(255, 102, 0, 0.1);
  border-left-color: #ff6600;
  color: #ff6600;
}

/* レスポンシブ対応 */
@media (max-width: 1200px) {
  .power-tab {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, auto);
  }
  
  .power-generation,
  .cooling-system,
  .power-distribution,
  .system-status {
    grid-column: 1;
  }
  
  .power-generation { grid-row: 1; }
  .cooling-system { grid-row: 2; }
  .power-distribution { grid-row: 3; }
  .system-status { grid-row: 4; }
}
</style>