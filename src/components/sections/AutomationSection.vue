<template>
  <div class="content-card automation-section">
    <h3 class="card-title">自動化システム</h3>
    
    <div class="automation-overview">
      <div class="automation-stats">
        <div class="stat-item">
          <div class="stat-label">自動化レベル</div>
          <div class="stat-value level">Lv.{{ automationLevel }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">自動化率</div>
          <div class="stat-value percentage">{{ automationPercentage }}%</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">効率向上</div>
          <div class="stat-value bonus">+{{ efficiencyBonus }}%</div>
        </div>
      </div>
    </div>

    <div class="automation-progress">
      <h4>自動化進捗</h4>
      <div class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: (automationLevel / 10) * 100 + '%' }"
          ></div>
        </div>
        <span class="progress-text">{{ automationLevel }}/10</span>
      </div>
      
      <div class="level-benefits">
        <div class="benefit-item" v-for="level in 10" :key="level">
          <div 
            class="level-indicator" 
            :class="{ 'unlocked': automationLevel >= level, 'current': automationLevel === level }"
          >
            {{ level }}
          </div>
          <div class="benefit-text" :class="{ 'unlocked': automationLevel >= level }">
            {{ getLevelBenefit(level) }}
          </div>
        </div>
      </div>
    </div>

    <div class="automation-modules">
      <h4>自動化モジュール</h4>
      <div class="modules-grid">
        <div 
          v-for="module in automationModules" 
          :key="module.id"
          class="module-card"
          :class="{ 'active': module.active, 'available': module.available }"
        >
          <div class="module-header">
            <span class="module-name">{{ module.name }}</span>
            <span class="module-status" :class="module.active ? 'active' : 'inactive'">
              {{ module.active ? '稼働中' : '停止中' }}
            </span>
          </div>
          
          <div class="module-description">{{ module.description }}</div>
          
          <div class="module-stats">
            <div class="stat">効率: +{{ module.efficiency }}%</div>
            <div class="stat">消費電力: {{ module.powerCost }}MW</div>
            <div class="stat">維持コスト: {{ module.maintenanceCost }}/h</div>
          </div>
          
          <div class="module-controls">
            <button 
              @click="toggleModule(module)"
              :disabled="!module.available"
              class="toggle-btn"
              :class="module.active ? 'stop' : 'start'"
            >
              {{ module.active ? '停止' : '開始' }}
            </button>
            <button 
              @click="upgradeModule(module)"
              :disabled="!canUpgradeModule(module)"
              class="upgrade-btn"
            >
              改良 (Lv.{{ module.level }})
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="automation-upgrades">
      <h4>自動化アップグレード</h4>
      <div class="upgrades-grid">
        <div 
          v-for="upgrade in availableUpgrades" 
          :key="upgrade.id"
          class="upgrade-card"
          :class="{ 'purchased': upgrade.purchased }"
        >
          <div class="upgrade-icon">🔧</div>
          <div class="upgrade-info">
            <div class="upgrade-name">{{ upgrade.name }}</div>
            <div class="upgrade-description">{{ upgrade.description }}</div>
            <div class="upgrade-effect">{{ upgrade.effect }}</div>
          </div>
          <div class="upgrade-cost">
            <div class="cost-amount">{{ upgrade.cost }} SP</div>
            <button 
              @click="purchaseUpgrade(upgrade)"
              :disabled="upgrade.purchased || !canPurchaseUpgrade(upgrade)"
              class="purchase-btn"
            >
              {{ upgrade.purchased ? '購入済み' : '購入' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="automation-ai" v-if="automationLevel >= 8">
      <h4>AI制御システム</h4>
      <div class="ai-control-panel">
        <div class="ai-status">
          <div class="ai-indicator" :class="{ 'online': aiSystemActive }"></div>
          <span>AI制御システム: {{ aiSystemActive ? 'オンライン' : 'オフライン' }}</span>
        </div>
        
        <div class="ai-settings" v-if="aiSystemActive">
          <div class="setting-group">
            <label>生産優先度:</label>
            <select v-model="aiSettings.productionPriority" class="ai-select">
              <option value="speed">速度優先</option>
              <option value="quality">品質優先</option>
              <option value="efficiency">効率優先</option>
              <option value="balanced">バランス</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label>リソース管理:</label>
            <select v-model="aiSettings.resourceManagement" class="ai-select">
              <option value="conservative">保守的</option>
              <option value="moderate">標準</option>
              <option value="aggressive">積極的</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label class="checkbox-label">
              <input 
                type="checkbox" 
                v-model="aiSettings.autoOptimize"
                class="ai-checkbox"
              >
              自動最適化
            </label>
          </div>
        </div>
        
        <button 
          @click="toggleAI"
          class="ai-toggle-btn"
          :class="aiSystemActive ? 'shutdown' : 'activate'"
        >
          {{ aiSystemActive ? 'AI停止' : 'AI起動' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'AutomationSection',
  props: {
    automationLevel: { type: Number, default: 0 },
    availableUpgrades: { type: Array, default: () => [] }
  },
  emits: ['upgrade-automation'],
  setup(props, { emit }) {
    const aiSystemActive = ref(false)
    const aiSettings = ref({
      productionPriority: 'balanced',
      resourceManagement: 'moderate',
      autoOptimize: false
    })
    
    const automationModules = ref([
      {
        id: 'conveyor',
        name: 'コンベアシステム',
        description: '自動運搬システム',
        efficiency: 15,
        powerCost: 50,
        maintenanceCost: 10,
        level: 1,
        active: false,
        available: true
      },
      {
        id: 'robotic_arm',
        name: 'ロボットアーム',
        description: '精密組立用ロボット',
        efficiency: 25,
        powerCost: 120,
        maintenanceCost: 25,
        level: 1,
        active: false,
        available: true
      },
      {
        id: 'quality_scanner',
        name: '品質スキャナー',
        description: '自動品質検査装置',
        efficiency: 10,
        powerCost: 80,
        maintenanceCost: 15,
        level: 1,
        active: false,
        available: false
      },
      {
        id: 'smart_factory',
        name: 'スマートファクトリー',
        description: 'AI統合生産システム',
        efficiency: 50,
        powerCost: 300,
        maintenanceCost: 100,
        level: 1,
        active: false,
        available: false
      }
    ])

    const automationPercentage = computed(() => {
      return Math.min(props.automationLevel * 10, 100)
    })
    
    const efficiencyBonus = computed(() => {
      let bonus = props.automationLevel * 5
      
      // アクティブなモジュールのボーナス
      automationModules.value.forEach(module => {
        if (module.active) {
          bonus += module.efficiency
        }
      })
      
      // AI制御システムのボーナス
      if (aiSystemActive.value) {
        bonus += 20
      }
      
      return bonus
    })

    // レベルに応じてモジュールを解禁
    watch(() => props.automationLevel, (newLevel) => {
      if (newLevel >= 3) {
        const scanner = automationModules.value.find(m => m.id === 'quality_scanner')
        if (scanner) scanner.available = true
      }
      if (newLevel >= 7) {
        const smartFactory = automationModules.value.find(m => m.id === 'smart_factory')
        if (smartFactory) smartFactory.available = true
      }
    })

    const getLevelBenefit = (level) => {
      const benefits = {
        1: '基本自動化 +5%',
        2: '搬送自動化 +10%',
        3: '品質管理自動化',
        4: '生産計画最適化 +20%',
        5: '予測メンテナンス',
        6: 'エネルギー効率化 +30%',
        7: '高度AI制御',
        8: 'AI制御システム解禁',
        9: '完全自律生産 +45%',
        10: '超効率化システム +50%'
      }
      return benefits[level] || ''
    }
    
    const toggleModule = (module) => {
      if (!module.available) return
      
      module.active = !module.active
      
      if (module.active) {
        console.log(`${module.name} を起動しました`)
      } else {
        console.log(`${module.name} を停止しました`)
      }
    }
    
    const upgradeModule = (module) => {
      if (!canUpgradeModule(module)) return
      
      module.level += 1
      module.efficiency = Math.floor(module.efficiency * 1.2)
      module.powerCost = Math.floor(module.powerCost * 1.1)
      module.maintenanceCost = Math.floor(module.maintenanceCost * 1.1)
      
      console.log(`${module.name} をレベル${module.level}に改良しました`)
    }
    
    const canUpgradeModule = (module) => {
      return module.level < 5 && module.available
    }
    
    const purchaseUpgrade = (upgrade) => {
      if (upgrade.purchased || !canPurchaseUpgrade(upgrade)) return
      
      upgrade.purchased = true
      
      emit('upgrade-automation', {
        upgrade: upgrade,
        cost: upgrade.cost
      })
      
      console.log(`${upgrade.name} を購入しました`)
    }
    
    const canPurchaseUpgrade = (upgrade) => {
      // セレスの意思ポイントの判定は親コンポーネントで行う
      return true
    }
    
    const toggleAI = () => {
      aiSystemActive.value = !aiSystemActive.value
      
      if (aiSystemActive.value) {
        console.log('AI制御システムを起動しました')
        optimizeProduction()
      } else {
        console.log('AI制御システムを停止しました')
      }
    }
    
    const optimizeProduction = () => {
      if (!aiSystemActive.value) return
      
      console.log(`AI最適化実行: ${aiSettings.value.productionPriority}優先`)
      
      if (aiSettings.value.autoOptimize) {
        automationModules.value.forEach(module => {
          if (module.available && !module.active) {
            if (module.efficiency > 20) {
              module.active = true
            }
          }
        })
      }
    }

    return {
      aiSystemActive,
      aiSettings,
      automationModules,
      automationPercentage,
      efficiencyBonus,
      getLevelBenefit,
      toggleModule,
      upgradeModule,
      canUpgradeModule,
      purchaseUpgrade,
      canPurchaseUpgrade,
      toggleAI,
      optimizeProduction
    }
  }
}
</script>

<style scoped>
.automation-section {
  margin-bottom: 20px;
}

.automation-overview {
  margin-bottom: 20px;
}

.automation-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.stat-item {
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.stat-label {
  color: #aaa;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.stat-value.level { color: #00d4ff; }
.stat-value.percentage { color: #00cc66; }
.stat-value.bonus { color: #ffaa00; }

.automation-progress,
.automation-modules,
.automation-upgrades,
.automation-ai {
  margin-bottom: 25px;
}

.automation-progress h4,
.automation-modules h4,
.automation-upgrades h4,
.automation-ai h4 {
  color: #00d4ff;
  margin-bottom: 15px;
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.progress-bar {
  flex: 1;
  height: 12px;
  background: #333;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00cc66, #00d4ff);
  transition: width 0.5s ease;
}

.progress-text {
  color: #fff;
  font-weight: bold;
  min-width: 40px;
}

.level-benefits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 10px;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 8px;
  border-radius: 4px;
  background: rgba(255,255,255,0.02);
}

.level-indicator {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  background: #333;
  color: #666;
  border: 2px solid #666;
}

.level-indicator.unlocked {
  background: #00cc66;
  color: #000;
  border-color: #00cc66;
}

.level-indicator.current {
  background: #00d4ff;
  border-color: #00d4ff;
  animation: pulse 2s infinite;
}

.benefit-text {
  color: #666;
  transition: color 0.3s ease;
}

.benefit-text.unlocked {
  color: #fff;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.module-card {
  background: rgba(100,0,100,0.1);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #440044;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.module-card.available {
  opacity: 1;
  border-color: #666;
}

.module-card.active {
  border-color: #00d4ff;
  background: rgba(0,212,255,0.1);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.module-name {
  font-weight: bold;
  color: #fff;
}

.module-status {
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: 4px;
}

.module-status.active {
  background: rgba(0,204,102,0.2);
  color: #00cc66;
}

.module-status.inactive {
  background: rgba(102,102,102,0.2);
  color: #aaa;
}

.module-description {
  color: #ccc;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.module-stats {
  margin-bottom: 15px;
}

.stat {
  color: #aaa;
  font-size: 0.8rem;
  margin: 2px 0;
}

.module-controls {
  display: flex;
  gap: 10px;
}

.toggle-btn, .upgrade-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn.start {
  background: #00cc66;
  color: #000;
}

.toggle-btn.stop {
  background: #ff6666;
  color: #fff;
}

.upgrade-btn {
  background: #0066cc;
  color: #fff;
}

.toggle-btn:disabled, .upgrade-btn:disabled {
  background: #666;
  color: #999;
  cursor: not-allowed;
}

.upgrades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.upgrade-card {
  background: rgba(0,100,200,0.1);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #006699;
  display: flex;
  align-items: center;
  gap: 15px;
}

.upgrade-card.purchased {
  opacity: 0.6;
  background: rgba(102,102,102,0.1);
  border-color: #666;
}

.upgrade-icon {
  font-size: 2rem;
  text-align: center;
  min-width: 50px;
}

.upgrade-info {
  flex: 1;
}

.upgrade-name {
  font-weight: bold;
  color: #66aaff;
  margin-bottom: 5px;
}

.upgrade-description, .upgrade-effect {
  color: #ccc;
  font-size: 0.9rem;
  margin: 2px 0;
}

.upgrade-cost {
  text-align: center;
  min-width: 100px;
}

.cost-amount {
  color: #ffaa00;
  font-weight: bold;
  margin-bottom: 8px;
}

.purchase-btn {
  width: 100%;
  padding: 6px;
  background: #00d4ff;
  color: #000;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.purchase-btn:disabled {
  background: #666;
  color: #999;
  cursor: not-allowed;
}

.ai-control-panel {
  background: rgba(0,50,100,0.2);
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #003366;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  font-weight: bold;
}

.ai-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #666;
  transition: all 0.3s ease;
}

.ai-indicator.online {
  background: #00ff88;
  box-shadow: 0 0 10px #00ff88;
  animation: pulse 2s infinite;
}

.ai-settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.setting-group label {
  color: #aaa;
  font-size: 0.9rem;
}

.ai-select {
  padding: 6px;
  background: #333;
  color: #fff;
  border: 1px solid #666;
  border-radius: 4px;
}

.checkbox-label {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  gap: 8px;
}

.ai-checkbox {
  width: 16px;
  height: 16px;
}

.ai-toggle-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ai-toggle-btn.activate {
  background: #00ff88;
  color: #000;
}

.ai-toggle-btn.shutdown {
  background: #ff6666;
  color: #fff;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
