<template>
  <div class="content-card furnace-control-section">
    <h3 class="card-title">炉温制御</h3>
    
    <div class="temperature-display">
      <div class="temp-gauge">
        <div class="gauge-container">
          <div class="gauge-arc">
            <div 
              class="gauge-fill" 
              :style="{ 
                transform: `rotate(${getGaugeRotation()}deg)`,
                background: getTempGradient()
              }"
            ></div>
          </div>
          <div class="gauge-center">
            <span class="temp-value" :class="getTempClass()">{{ temperature }}°C</span>
            <span class="temp-label">炉温</span>
          </div>
        </div>
      </div>
      
      <div class="temp-controls">
        <div class="control-row">
          <label>目標温度:</label>
          <input 
            type="range" 
            min="200" 
            max="1500" 
            v-model="targetTemperature"
            @input="adjustTemperature"
            class="temp-slider"
          />
          <span class="temp-input-display">{{ targetTemperature }}°C</span>
        </div>
        
        <div class="preset-buttons">
          <button 
            v-for="preset in temperaturePresets" 
            :key="preset.name"
            @click="setPresetTemperature(preset.temp)"
            :class="['preset-btn', { active: targetTemperature == preset.temp }]"
          >
            {{ preset.name }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="furnace-status">
      <div class="status-grid">
        <div class="status-item">
          <span class="status-label">燃料消費:</span>
          <span class="status-value">{{ fuelConsumption.toFixed(1) }}/分</span>
        </div>
        <div class="status-item">
          <span class="status-label">冷却必要:</span>
          <span class="status-value">{{ coolingRate.toFixed(1) }}/分</span>
        </div>
        <div class="status-item">
          <span class="status-label">効率ボーナス:</span>
          <span class="status-value">+{{ temperatureBonus }}%</span>
        </div>
        <div class="status-item">
          <span class="status-label">炉圧:</span>
          <span class="status-value">{{ furnacePressure.toFixed(2) }} atm</span>
        </div>
      </div>
    </div>
    
    <div class="atmosphere-control">
      <h4>炉内雰囲気制御</h4>
      <div class="atmosphere-options">
        <div 
          v-for="atmosphere in atmosphereTypes" 
          :key="atmosphere.id"
          class="atmosphere-option"
          :class="{ selected: selectedAtmosphere === atmosphere.id }"
          @click="selectAtmosphere(atmosphere.id)"
        >
          <div class="atmosphere-name">{{ atmosphere.name }}</div>
          <div class="atmosphere-effect">{{ atmosphere.effect }}</div>
          <div class="atmosphere-cost">{{ atmosphere.cost }}/分</div>
        </div>
      </div>
    </div>
    
    <div class="safety-controls">
      <h4>安全制御</h4>
      <div class="safety-grid">
        <div class="safety-item">
          <label class="safety-label">
            <input 
              type="checkbox" 
              v-model="safetySettings.autoShutdown"
              class="safety-checkbox"
            />
            緊急自動停止 ({{ maxSafeTemperature }}°C)
          </label>
        </div>
        <div class="safety-item">
          <label class="safety-label">
            <input 
              type="checkbox" 
              v-model="safetySettings.pressureRelief"
              class="safety-checkbox"
            />
            圧力リリーフバルブ
          </label>
        </div>
        <div class="safety-item">
          <label class="safety-label">
            <input 
              type="checkbox" 
              v-model="safetySettings.coolingBackup"
              class="safety-checkbox"
            />
            緊急冷却システム
          </label>
        </div>
      </div>
      
      <div class="emergency-controls">
        <button @click="emergencyStop" class="emergency-btn stop">緊急停止</button>
        <button @click="emergencyCooling" class="emergency-btn cooling">緊急冷却</button>
        <button @click="ventAtmosphere" class="emergency-btn vent">大気放出</button>
      </div>
    </div>
    
    <div class="furnace-maintenance">
      <h4>メンテナンス</h4>
      <div class="maintenance-status">
        <div class="maintenance-item">
          <span>耐火レンガ劣化:</span>
          <div class="wear-bar">
            <div 
              class="wear-fill" 
              :style="{ 
                width: (100 - refractoryWear) + '%',
                background: getWearColor(refractoryWear)
              }"
            ></div>
          </div>
          <span>{{ (100 - refractoryWear).toFixed(1) }}%</span>
        </div>
        
        <div class="maintenance-item">
          <span>断熱材効率:</span>
          <div class="wear-bar">
            <div 
              class="wear-fill" 
              :style="{ 
                width: insulationEfficiency + '%',
                background: getEfficiencyColor(insulationEfficiency)
              }"
            ></div>
          </div>
          <span>{{ insulationEfficiency.toFixed(1) }}%</span>
        </div>
      </div>
      
      <div class="maintenance-actions">
        <button 
          @click="performMaintenance('refractory')"
          :disabled="refractoryWear < 20"
          class="maintenance-btn"
        >
          耐火レンガ交換
        </button>
        <button 
          @click="performMaintenance('insulation')"
          :disabled="insulationEfficiency > 80"
          class="maintenance-btn"
        >
          断熱材補修
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue'

export default {
  name: 'FurnaceControlSection',
  props: {
    temperature: { type: Number, default: 800 },
    fuelConsumption: { type: Number, default: 10 },
    coolingRate: { type: Number, default: 15 }
  },
  emits: ['adjustTemperature', 'atmosphereChange', 'emergencyAction'],
  setup(props, { emit }) {
    const targetTemperature = ref(props.temperature)
    const selectedAtmosphere = ref('air')
    const maxSafeTemperature = ref(1200)
    const refractoryWear = ref(15)
    const insulationEfficiency = ref(85)
    
    const safetySettings = reactive({
      autoShutdown: true,
      pressureRelief: true,
      coolingBackup: false
    })
    
    const temperaturePresets = [
      { name: '低温', temp: 600 },
      { name: '標準', temp: 800 },
      { name: '高温', temp: 1000 },
      { name: '極高温', temp: 1200 }
    ]
    
    const atmosphereTypes = [
      {
        id: 'air',
        name: '大気',
        effect: '標準精錬',
        cost: 0
      },
      {
        id: 'reducing',
        name: '還元性',
        effect: '金属精錬効率+20%',
        cost: 2.5
      },
      {
        id: 'oxidizing',
        name: '酸化性',
        effect: '酸化物生成+15%',
        cost: 1.8
      },
      {
        id: 'inert',
        name: '不活性',
        effect: '高純度精錬+30%',
        cost: 4.2
      }
    ]
    
    const temperatureBonus = computed(() => {
      const baseTemp = 600
      if (props.temperature < baseTemp) return 0
      return Math.floor((props.temperature - baseTemp) / 10)
    })
    
    const furnacePressure = computed(() => {
      const basePressure = 1.0
      const tempFactor = (props.temperature - 20) / 1000
      const atmosphereFactor = selectedAtmosphere.value === 'inert' ? 0.2 : 0
      return basePressure + tempFactor + atmosphereFactor
    })
    
    const getGaugeRotation = () => {
      const minTemp = 200
      const maxTemp = 1500
      const normalized = (props.temperature - minTemp) / (maxTemp - minTemp)
      return Math.max(0, Math.min(180, normalized * 180))
    }
    
    const getTempGradient = () => {
      if (props.temperature < 400) return 'linear-gradient(90deg, #0066cc, #0088ff)'
      if (props.temperature < 700) return 'linear-gradient(90deg, #00cc66, #66ff00)'
      if (props.temperature < 1000) return 'linear-gradient(90deg, #ffaa00, #ff6600)'
      return 'linear-gradient(90deg, #ff0000, #ff6666)'
    }
    
    const getTempClass = () => {
      if (props.temperature < 400) return 'cold'
      if (props.temperature < 700) return 'warm'
      if (props.temperature < 1000) return 'hot'
      return 'extreme'
    }
    
    const getWearColor = (wear) => {
      if (wear < 20) return 'linear-gradient(90deg, #00cc66, #66ff00)'
      if (wear < 50) return 'linear-gradient(90deg, #ffaa00, #ff6600)'
      return 'linear-gradient(90deg, #ff0000, #ff6666)'
    }
    
    const getEfficiencyColor = (efficiency) => {
      if (efficiency > 80) return 'linear-gradient(90deg, #00cc66, #66ff00)'
      if (efficiency > 60) return 'linear-gradient(90deg, #ffaa00, #ff6600)'
      return 'linear-gradient(90deg, #ff0000, #ff6666)'
    }
    
    const adjustTemperature = () => {
      emit('adjustTemperature', targetTemperature.value)
    }
    
    const setPresetTemperature = (temp) => {
      targetTemperature.value = temp
      adjustTemperature()
    }
    
    const selectAtmosphere = (atmosphereId) => {
      selectedAtmosphere.value = atmosphereId
      emit('atmosphereChange', atmosphereId)
    }
    
    const emergencyStop = () => {
      targetTemperature.value = 200
      emit('emergencyAction', 'stop')
      adjustTemperature()
    }
    
    const emergencyCooling = () => {
      emit('emergencyAction', 'cooling')
    }
    
    const ventAtmosphere = () => {
      selectedAtmosphere.value = 'air'
      emit('emergencyAction', 'vent')
    }
    
    const performMaintenance = (type) => {
      if (type === 'refractory') {
        refractoryWear.value = 0
      } else if (type === 'insulation') {
        insulationEfficiency.value = 100
      }
      emit('emergencyAction', `maintenance_${type}`)
    }
    
    // 時間経過による劣化シミュレーション
    onMounted(() => {
      setInterval(() => {
        if (props.temperature > 1000) {
          refractoryWear.value = Math.min(100, refractoryWear.value + 0.1)
          insulationEfficiency.value = Math.max(0, insulationEfficiency.value - 0.05)
        }
      }, 10000) // 10秒ごと
    })
    
    return {
      targetTemperature,
      selectedAtmosphere,
      maxSafeTemperature,
      refractoryWear,
      insulationEfficiency,
      safetySettings,
      temperaturePresets,
      atmosphereTypes,
      temperatureBonus,
      furnacePressure,
      getGaugeRotation,
      getTempGradient,
      getTempClass,
      getWearColor,
      getEfficiencyColor,
      adjustTemperature,
      setPresetTemperature,
      selectAtmosphere,
      emergencyStop,
      emergencyCooling,
      ventAtmosphere,
      performMaintenance
    }
  }
}
</script>

<style scoped>
.furnace-control-section {
  margin-bottom: 20px;
}

.temperature-display {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
  margin-bottom: 25px;
  padding: 20px;
  background: rgba(255, 69, 0, 0.1);
  border-radius: 8px;
  border: 1px solid #ff4500;
}

.temp-gauge {
  display: flex;
  justify-content: center;
  align-items: center;
}

.gauge-container {
  position: relative;
  width: 160px;
  height: 160px;
}

.gauge-arc {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #333 0deg 180deg, transparent 180deg);
  overflow: hidden;
}

.gauge-fill {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  transform-origin: center;
  transition: transform 0.3s ease;
}

.gauge-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 50%;
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.temp-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.temp-value.cold { color: #0088ff; }
.temp-value.warm { color: #66ff00; }
.temp-value.hot { color: #ff6600; }
.temp-value.extreme { color: #ff0000; }

.temp-label {
  font-size: 0.8rem;
  color: #aaa;
}

.temp-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.control-row {
  display: flex;
  align-items: center;
  gap: 15px;
}

.control-row label {
  color: #aaa;
  min-width: 80px;
}

.temp-slider {
  flex: 1;
  height: 8px;
  background: #333;
  outline: none;
  cursor: pointer;
  border-radius: 4px;
}

.temp-input-display {
  color: #ff6347;
  font-weight: bold;
  min-width: 60px;
  text-align: right;
}

.preset-buttons {
  display: flex;
  gap: 8px;
}

.preset-btn {
  padding: 6px 12px;
  background: rgba(255, 69, 0, 0.2);
  border: 1px solid #ff4500;
  border-radius: 4px;
  color: #ff6347;
  cursor: pointer;
  transition: all 0.3s;
}

.preset-btn:hover {
  background: rgba(255, 69, 0, 0.3);
}

.preset-btn.active {
  background: rgba(255, 69, 0, 0.5);
  border-color: #ff6347;
  color: #fff;
}

.furnace-status {
  margin-bottom: 25px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.status-label {
  color: #aaa;
  font-size: 0.8rem;
  margin-bottom: 5px;
}

.status-value {
  color: #ff6347;
  font-weight: bold;
  font-size: 1.1rem;
}

.atmosphere-control {
  margin-bottom: 25px;
}

.atmosphere-control h4 {
  color: #ff6347;
  margin-bottom: 15px;
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
}

.atmosphere-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.atmosphere-option {
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid #333;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.atmosphere-option:hover {
  background: rgba(0, 0, 0, 0.3);
  border-color: #666;
}

.atmosphere-option.selected {
  background: rgba(255, 69, 0, 0.2);
  border-color: #ff4500;
}

.atmosphere-name {
  color: #fff;
  font-weight: bold;
  margin-bottom: 5px;
}

.atmosphere-effect {
  color: #aaa;
  font-size: 0.8rem;
  margin-bottom: 5px;
}

.atmosphere-cost {
  color: #ff6347;
  font-size: 0.8rem;
  font-weight: bold;
}

.safety-controls {
  margin-bottom: 25px;
}

.safety-controls h4 {
  color: #ff6600;
  margin-bottom: 15px;
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
}

.safety-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.safety-item {
  padding: 8px 12px;
  background: rgba(255, 102, 0, 0.1);
  border-radius: 4px;
  border: 1px solid #ff6600;
}

.safety-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
  cursor: pointer;
}

.safety-checkbox {
  width: 16px;
  height: 16px;
}

.emergency-controls {
  display: flex;
  gap: 10px;
}

.emergency-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: background 0.3s;
}

.emergency-btn.stop {
  background: #ff0000;
  color: white;
}

.emergency-btn.cooling {
  background: #0066cc;
  color: white;
}

.emergency-btn.vent {
  background: #ffaa00;
  color: white;
}

.emergency-btn:hover {
  opacity: 0.8;
}

.furnace-maintenance h4 {
  color: #ff6347;
  margin-bottom: 15px;
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
}

.maintenance-status {
  margin-bottom: 15px;
}

.maintenance-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.maintenance-item span:first-child {
  color: #aaa;
  min-width: 120px;
}

.maintenance-item span:last-child {
  color: #fff;
  font-weight: bold;
  min-width: 50px;
  text-align: right;
}

.wear-bar {
  flex: 1;
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
}

.wear-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.maintenance-actions {
  display: flex;
  gap: 10px;
}

.maintenance-btn {
  flex: 1;
  padding: 8px 16px;
  background: #666;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.maintenance-btn:hover:not(:disabled) {
  background: #777;
}

.maintenance-btn:disabled {
  background: #444;
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
