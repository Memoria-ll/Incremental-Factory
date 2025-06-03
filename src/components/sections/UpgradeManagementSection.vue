<template>
  <div class="content-card upgrade-management-section">
    <h3 class="card-title">アップグレード管理</h3>
    
    <!-- セレスの意思表示 -->
    <div class="celestial-will-display">
      <div class="cw-info">
        <span class="cw-label">セレスの意思</span>
        <span class="cw-amount">{{ formatNumber(celestialWill) }}</span>
      </div>
      <div class="cw-gain-rate">
        <span class="gain-label">獲得レート:</span>
        <span class="gain-value">+{{ formatNumber(gainRate) }}/週</span>
      </div>
    </div>
    
    <!-- アップグレードカテゴリ -->
    <div class="upgrade-categories">
      <div class="category-tabs">
        <button 
          v-for="category in categories" 
          :key="category.id"
          @click="selectedCategory = category.id"
          :class="['category-tab', { active: selectedCategory === category.id }]"
        >
          {{ category.name }}
        </button>
      </div>
      
      <!-- 選択されたカテゴリのアップグレード -->
      <div class="upgrades-container">
        <div class="upgrades-grid">
          <div 
            v-for="upgrade in currentCategoryUpgrades" 
            :key="upgrade.id"
            class="upgrade-card"
            :class="{ 
              affordable: canAfford(upgrade), 
              purchased: upgrade.purchased,
              locked: !upgrade.unlocked
            }"
          >
            <div class="upgrade-header">
              <h4 class="upgrade-name">{{ upgrade.name }}</h4>
              <div class="upgrade-cost">
                <span v-if="!upgrade.purchased">{{ formatNumber(upgrade.cost) }}</span>
                <span v-else class="purchased-text">購入済み</span>
              </div>
            </div>
            
            <p class="upgrade-description">{{ upgrade.description }}</p>
            
            <div class="upgrade-effects">
              <div v-for="effect in upgrade.effects" :key="effect.type" class="effect-item">
                <span class="effect-label">{{ getEffectLabel(effect.type) }}:</span>
                <span class="effect-value">{{ formatEffect(effect) }}</span>
              </div>
            </div>
            
            <div class="upgrade-requirements" v-if="upgrade.requirements">
              <h5>必要条件:</h5>
              <div v-for="req in upgrade.requirements" :key="req.type" class="requirement-item">
                <span class="req-text">{{ getRequirementText(req) }}</span>
                <span class="req-status" :class="{ met: checkRequirement(req) }">
                  {{ checkRequirement(req) ? '✓' : '✗' }}
                </span>
              </div>
            </div>
            
            <div class="upgrade-actions">
              <button 
                @click="purchaseUpgrade(upgrade)"
                :disabled="!canPurchase(upgrade)"
                class="purchase-btn"
              >
                {{ getPurchaseButtonText(upgrade) }}
              </button>
              
              <div v-if="upgrade.level > 0" class="upgrade-level">
                Lv.{{ upgrade.level }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 購入済みアップグレード概要 -->
    <div class="purchased-summary">
      <h4>購入済みアップグレード効果</h4>
      <div class="summary-stats">
        <div class="summary-item">
          <span class="summary-label">採掘効率:</span>
          <span class="summary-value">+{{ getMiningEfficiencyBonus() }}%</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">精錬効率:</span>
          <span class="summary-value">+{{ getSmeltingEfficiencyBonus() }}%</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">製造効率:</span>
          <span class="summary-value">+{{ getManufacturingEfficiencyBonus() }}%</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">自動化レベル:</span>
          <span class="summary-value">{{ getAutomationLevel() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'

export default {
  name: 'UpgradeManagementSection',
  props: {
    celestialWill: { type: Number, required: true },
    availableUpgrades: { type: Array, default: () => [] },
    purchasedUpgrades: { type: Array, default: () => [] }
  },
  emits: ['purchaseUpgrade'],
  setup(props, { emit }) {
    const selectedCategory = ref('mining')
    const gainRate = ref(120) // 週あたりのセレスの意思獲得率
    
    // アップグレードカテゴリ
    const categories = [
      { id: 'mining', name: '採掘' },
      { id: 'smelting', name: '精錬' },
      { id: 'manufacturing', name: '製造' },
      { id: 'automation', name: '自動化' },
      { id: 'efficiency', name: '効率化' },
      { id: 'advanced', name: '高級技術' }
    ]
    
    // 全アップグレードデータ
    const allUpgrades = reactive([
      // 採掘系
      {
        id: 'mining_speed_1',
        name: '採掘速度向上 I',
        description: '採掘機械の処理速度が25%向上します',
        category: 'mining',
        cost: 250,
        effects: [{ type: 'mining_speed', value: 25, unit: '%' }],
        unlocked: true,
        purchased: false,
        level: 0
      },
      {
        id: 'mining_speed_2',
        name: '採掘速度向上 II',
        description: '採掘機械の処理速度がさらに50%向上します',
        category: 'mining',
        cost: 750,
        effects: [{ type: 'mining_speed', value: 50, unit: '%' }],
        requirements: [{ type: 'upgrade', id: 'mining_speed_1' }],
        unlocked: false,
        purchased: false,
        level: 0
      },
      {
        id: 'drill_depth',
        name: '深度拡張技術',
        description: '最大掘削深度を500m拡張します',
        category: 'mining',
        cost: 500,
        effects: [{ type: 'max_depth', value: 500, unit: 'm' }],
        unlocked: true,
        purchased: false,
        level: 0
      },
      {
        id: 'auto_mining',
        name: '自動採掘システム',
        description: '基本的な自動採掘を開始します',
        category: 'mining',
        cost: 1000,
        effects: [{ type: 'auto_mining', value: 1, unit: 'レベル' }],
        requirements: [{ type: 'depth', value: 200 }],
        unlocked: false,
        purchased: false,
        level: 0
      },
      
      // 精錬系
      {
        id: 'smelting_efficiency',
        name: '精錬効率改善',
        description: '精錬時の材料効率が20%向上します',
        category: 'smelting',
        cost: 400,
        effects: [{ type: 'smelting_efficiency', value: 20, unit: '%' }],
        unlocked: true,
        purchased: false,
        level: 0
      },
      {
        id: 'heat_recovery',
        name: '廃熱回収システム',
        description: 'エネルギー効率が30%向上します',
        category: 'smelting',
        cost: 800,
        effects: [{ type: 'energy_efficiency', value: 30, unit: '%' }],
        requirements: [{ type: 'temperature', value: 100 }],
        unlocked: false,
        purchased: false,
        level: 0
      },
      
      // 製造系
      {
        id: 'assembly_speed',
        name: '組立速度向上',
        description: '製造ラインの処理速度が40%向上します',
        category: 'manufacturing',
        cost: 600,
        effects: [{ type: 'manufacturing_speed', value: 40, unit: '%' }],
        unlocked: true,
        purchased: false,
        level: 0
      },
      {
        id: 'quality_control',
        name: '品質管理システム',
        description: '製品の品質が向上し、不良率が50%減少します',
        category: 'manufacturing',
        cost: 1200,
        effects: [{ type: 'quality_improvement', value: 50, unit: '%' }],
        requirements: [{ type: 'week', value: 10 }],
        unlocked: false,
        purchased: false,
        level: 0
      },
      
      // 自動化系
      {
        id: 'basic_automation',
        name: '基本自動化',
        description: '基本的な作業プロセスを自動化します',
        category: 'automation',
        cost: 1500,
        effects: [{ type: 'automation_level', value: 1, unit: 'レベル' }],
        requirements: [{ type: 'celestial_will_total', value: 2000 }],
        unlocked: false,
        purchased: false,
        level: 0
      },
      {
        id: 'smart_scheduling',
        name: 'スマート スケジューリング',
        description: 'AIによる最適なタスク配分を行います',
        category: 'automation',
        cost: 2500,
        effects: [{ type: 'task_efficiency', value: 35, unit: '%' }],
        requirements: [{ type: 'upgrade', id: 'basic_automation' }],
        unlocked: false,
        purchased: false,
        level: 0
      },
      
      // 効率化系
      {
        id: 'waste_reduction',
        name: '廃棄物削減',
        description: 'セレスの意思による最適化頻度が減少します',
        category: 'efficiency',
        cost: 800,
        effects: [{ type: 'waste_reduction', value: 40, unit: '%' }],
        unlocked: true,
        purchased: false,
        level: 0
      },
      {
        id: 'predictive_analysis',
        name: '予測分析システム',
        description: '将来の需要を予測し、生産計画を最適化します',
        category: 'efficiency',
        cost: 2000,
        effects: [{ type: 'prediction_accuracy', value: 75, unit: '%' }],
        requirements: [{ type: 'upgrade', id: 'waste_reduction' }],
        unlocked: false,
        purchased: false,
        level: 0
      },
      
      // 高級技術系
      {
        id: 'quantum_computing',
        name: '量子コンピューティング',
        description: '全システムの計算能力が飛躍的に向上します',
        category: 'advanced',
        cost: 5000,
        effects: [
          { type: 'all_efficiency', value: 100, unit: '%' },
          { type: 'celestial_will_gain', value: 50, unit: '%' }
        ],
        requirements: [
          { type: 'depth', value: 2000 },
          { type: 'week', value: 20 }
        ],
        unlocked: false,
        purchased: false,
        level: 0
      }
    ])
    
    // 計算プロパティ
    const currentCategoryUpgrades = computed(() => {
      return allUpgrades.filter(upgrade => 
        upgrade.category === selectedCategory.value && upgrade.unlocked
      )
    })
    
    // メソッド
    const formatNumber = (num) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
      return Math.floor(num).toString()
    }
    
    const canAfford = (upgrade) => {
      return props.celestialWill >= upgrade.cost && !upgrade.purchased
    }
    
    const canPurchase = (upgrade) => {
      if (upgrade.purchased) return false
      if (!canAfford(upgrade)) return false
      if (upgrade.requirements) {
        return upgrade.requirements.every(req => checkRequirement(req))
      }
      return true
    }
    
    const checkRequirement = (requirement) => {
      switch (requirement.type) {
        case 'upgrade':
          return allUpgrades.find(u => u.id === requirement.id)?.purchased || false
        case 'depth':
          return (props.gameState?.currentDepth || 0) >= requirement.value
        case 'week':
          return (props.gameState?.currentWeek || 0) >= requirement.value
        case 'temperature':
          return (props.gameState?.temperature || 0) >= requirement.value
        case 'celestial_will_total':
          return props.celestialWill >= requirement.value
        default:
          return true
      }
    }
    
    const getRequirementText = (requirement) => {
      switch (requirement.type) {
        case 'upgrade':
          const upgrade = allUpgrades.find(u => u.id === requirement.id)
          return `アップグレード: ${upgrade?.name || 'Unknown'}`
        case 'depth':
          return `深度 ${requirement.value}m 到達`
        case 'week':
          return `週 ${requirement.value} 到達`
        case 'temperature':
          return `温度 ${requirement.value}°C 到達`
        case 'celestial_will_total':
          return `セレスの意思 ${formatNumber(requirement.value)} 累計獲得`
        default:
          return '不明な条件'
      }
    }
    
    const getEffectLabel = (effectType) => {
      const labels = {
        mining_speed: '採掘速度',
        max_depth: '最大深度',
        auto_mining: '自動採掘',
        smelting_efficiency: '精錬効率',
        energy_efficiency: 'エネルギー効率',
        manufacturing_speed: '製造速度',
        quality_improvement: '品質向上',
        automation_level: '自動化レベル',
        task_efficiency: 'タスク効率',
        waste_reduction: '廃棄物削減',
        prediction_accuracy: '予測精度',
        all_efficiency: '全体効率',
        celestial_will_gain: 'セレスの意思獲得'
      }
      return labels[effectType] || effectType
    }
    
    const formatEffect = (effect) => {
      if (effect.unit === '%') {
        return `+${effect.value}%`
      } else if (effect.unit === 'm') {
        return `+${formatNumber(effect.value)}m`
      } else if (effect.unit === 'レベル') {
        return `レベル${effect.value}`
      }
      return effect.value.toString()
    }
    
    const getPurchaseButtonText = (upgrade) => {
      if (upgrade.purchased) return '購入済み'
      if (!canAfford(upgrade)) return '資金不足'
      if (upgrade.requirements && !upgrade.requirements.every(req => checkRequirement(req))) {
        return '条件未達'
      }
      return '購入'
    }
    
    const purchaseUpgrade = (upgrade) => {
      if (canPurchase(upgrade)) {
        emit('purchaseUpgrade', upgrade)
        upgrade.purchased = true
        upgrade.level = (upgrade.level || 0) + 1
        
        // 依存アップグレードのロック解除
        allUpgrades.forEach(u => {
          if (u.requirements) {
            const hasUpgradeReq = u.requirements.find(req => 
              req.type === 'upgrade' && req.id === upgrade.id
            )
            if (hasUpgradeReq) {
              u.unlocked = u.requirements.every(req => checkRequirement(req))
            }
          }
        })
      }
    }
    
    // 購入済みアップグレード効果の計算
    const getMiningEfficiencyBonus = () => {
      let bonus = 0
      allUpgrades.forEach(upgrade => {
        if (upgrade.purchased) {
          upgrade.effects.forEach(effect => {
            if (effect.type === 'mining_speed') {
              bonus += effect.value
            }
          })
        }
      })
      return bonus
    }
    
    const getSmeltingEfficiencyBonus = () => {
      let bonus = 0
      allUpgrades.forEach(upgrade => {
        if (upgrade.purchased) {
          upgrade.effects.forEach(effect => {
            if (effect.type === 'smelting_efficiency') {
              bonus += effect.value
            }
          })
        }
      })
      return bonus
    }
    
    const getManufacturingEfficiencyBonus = () => {
      let bonus = 0
      allUpgrades.forEach(upgrade => {
        if (upgrade.purchased) {
          upgrade.effects.forEach(effect => {
            if (effect.type === 'manufacturing_speed') {
              bonus += effect.value
            }
          })
        }
      })
      return bonus
    }
    
    const getAutomationLevel = () => {
      let level = 0
      allUpgrades.forEach(upgrade => {
        if (upgrade.purchased) {
          upgrade.effects.forEach(effect => {
            if (effect.type === 'automation_level') {
              level += effect.value
            }
          })
        }
      })
      return level
    }
    
    return {
      selectedCategory,
      gainRate,
      categories,
      allUpgrades,
      currentCategoryUpgrades,
      formatNumber,
      canAfford,
      canPurchase,
      checkRequirement,
      getRequirementText,
      getEffectLabel,
      formatEffect,
      getPurchaseButtonText,
      purchaseUpgrade,
      getMiningEfficiencyBonus,
      getSmeltingEfficiencyBonus,
      getManufacturingEfficiencyBonus,
      getAutomationLevel
    }
  }
}
</script>

<style scoped>
.upgrade-management-section {
  margin-bottom: 20px;
}

.celestial-will-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 15px;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 8px;
  border: 1px solid #00d4ff;
}

.cw-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.cw-label {
  color: #00d4ff;
  font-size: 0.9rem;
  margin-bottom: 3px;
}

.cw-amount {
  color: #00d4ff;
  font-size: 1.8rem;
  font-weight: bold;
}

.cw-gain-rate {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.gain-label {
  color: #aaa;
  font-size: 0.8rem;
  margin-bottom: 3px;
}

.gain-value {
  color: #00cc66;
  font-weight: bold;
}

.upgrade-categories {
  margin-bottom: 25px;
}

.category-tabs {
  display: flex;
  gap: 5px;
  margin-bottom: 20px;
  border-bottom: 1px solid #333;
  padding-bottom: 10px;
}

.category-tab {
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #333;
  border-radius: 6px 6px 0 0;
  color: #aaa;
  cursor: pointer;
  transition: all 0.3s;
}

.category-tab:hover {
  background: rgba(0, 0, 0, 0.5);
  color: #ccc;
}

.category-tab.active {
  background: rgba(0, 212, 255, 0.2);
  border-color: #00d4ff;
  color: #00d4ff;
}

.upgrades-container {
  min-height: 400px;
}

.upgrades-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.upgrade-card {
  padding: 20px;
  background: rgba(0, 100, 0, 0.1);
  border-radius: 8px;
  border: 1px solid #004400;
  transition: all 0.3s;
  position: relative;
}

.upgrade-card.affordable {
  border-color: #00cc66;
  background: rgba(0, 204, 102, 0.15);
  box-shadow: 0 0 10px rgba(0, 204, 102, 0.2);
}

.upgrade-card.purchased {
  background: rgba(100, 100, 100, 0.1);
  border-color: #666;
  opacity: 0.8;
}

.upgrade-card.locked {
  background: rgba(100, 100, 100, 0.05);
  border-color: #444;
  opacity: 0.6;
}

.upgrade-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.upgrade-name {
  color: #00cc66;
  font-size: 1.1rem;
  margin: 0;
  flex: 1;
}

.upgrade-cost {
  color: #00d4ff;
  font-weight: bold;
  margin-left: 10px;
}

.purchased-text {
  color: #888;
  font-style: italic;
}

.upgrade-description {
  color: #ccc;
  margin-bottom: 15px;
  line-height: 1.4;
}

.upgrade-effects {
  margin-bottom: 15px;
}

.effect-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  padding: 3px 0;
  border-bottom: 1px dotted #333;
}

.effect-label {
  color: #aaa;
  font-size: 0.9rem;
}

.effect-value {
  color: #00cc66;
  font-weight: bold;
  font-size: 0.9rem;
}

.upgrade-requirements {
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.upgrade-requirements h5 {
  color: #ffaa00;
  margin: 0 0 8px 0;
  font-size: 0.9rem;
}

.requirement-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
}

.req-text {
  color: #ccc;
  font-size: 0.8rem;
}

.req-status {
  color: #ff6666;
  font-weight: bold;
}

.req-status.met {
  color: #00cc66;
}

.upgrade-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.purchase-btn {
  flex: 1;
  padding: 10px 16px;
  background: #00cc66;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
  font-weight: bold;
}

.purchase-btn:hover:not(:disabled) {
  background: #00aa55;
}

.purchase-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.upgrade-level {
  margin-left: 10px;
  padding: 4px 8px;
  background: rgba(0, 212, 255, 0.2);
  border: 1px solid #00d4ff;
  border-radius: 4px;
  color: #00d4ff;
  font-size: 0.8rem;
  font-weight: bold;
}

.purchased-summary {
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid #333;
}

.purchased-summary h4 {
  color: #00d4ff;
  margin-bottom: 15px;
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(0, 100, 0, 0.1);
  border-radius: 4px;
  border: 1px solid #004400;
}

.summary-label {
  color: #aaa;
}

.summary-value {
  color: #00cc66;
  font-weight: bold;
}
</style>
