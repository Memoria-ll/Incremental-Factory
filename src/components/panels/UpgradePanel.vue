<template>
  <div class="content-card upgrade-panel">
    <h3 class="card-title">アップグレード</h3>
    
    <div class="celestial-will-display">
      <span class="cw-label">セレスの意思:</span>
      <span class="cw-amount">{{ formatNumber(celestialWill) }}</span>
    </div>
    
    <div class="upgrade-categories">
      <div v-for="category in upgradeCategories" :key="category.name" class="upgrade-category">
        <h4>{{ category.name }}</h4>
        <div class="upgrades-list">
          <div 
            v-for="upgrade in category.upgrades" 
            :key="upgrade.id"
            class="upgrade-item"
            :class="{ purchased: upgrade.purchased, affordable: canAfford(upgrade) }"
          >
            <div class="upgrade-header">
              <span class="upgrade-name">{{ upgrade.name }}</span>
              <span class="upgrade-cost">{{ formatNumber(upgrade.cost) }}</span>
            </div>
            <p class="upgrade-description">{{ upgrade.description }}</p>
            <button 
              @click="purchaseUpgrade(upgrade)"
              :disabled="!canAfford(upgrade) || upgrade.purchased"
              class="upgrade-btn"
            >
              {{ upgrade.purchased ? '購入済み' : '購入' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'UpgradePanel',
  props: {
    celestialWill: { type: Number, required: true },
    availableUpgrades: { type: Array, default: () => [] }
  },
  emits: ['purchase'],
  setup(props, { emit }) {
    const upgradeCategories = computed(() => {
      const categories = [
        {
          name: '採掘システム',
          upgrades: props.availableUpgrades.filter(u => u.category === 'mining')
        },
        {
          name: '精錬システム',
          upgrades: props.availableUpgrades.filter(u => u.category === 'smelting')
        },
        {
          name: '製造システム',
          upgrades: props.availableUpgrades.filter(u => u.category === 'manufacturing')
        },
        {
          name: '管理システム',
          upgrades: props.availableUpgrades.filter(u => u.category === 'management')
        }
      ]
      
      // カテゴリが指定されていないアップグレードは「一般」に分類
      const uncategorized = props.availableUpgrades.filter(u => !u.category)
      if (uncategorized.length > 0) {
        categories.push({
          name: '一般',
          upgrades: uncategorized
        })
      }
      
      return categories.filter(cat => cat.upgrades.length > 0)
    })
    
    const canAfford = (upgrade) => {
      return props.celestialWill >= upgrade.cost && !upgrade.purchased
    }
    
    const purchaseUpgrade = (upgrade) => {
      if (canAfford(upgrade)) {
        emit('purchase', upgrade)
      }
    }
    
    const formatNumber = (num) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return Math.floor(num).toString()
    }
    
    return {
      upgradeCategories,
      canAfford,
      purchaseUpgrade,
      formatNumber
    }
  }
}
</script>

<style scoped>
.upgrade-panel {
  margin-bottom: 20px;
}

.celestial-will-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  margin-bottom: 20px;
  background: rgba(0, 212, 255, 0.1);
  border-radius: 8px;
  border: 1px solid #00d4ff;
}

.cw-label {
  color: #00d4ff;
  font-weight: bold;
}

.cw-amount {
  color: #00d4ff;
  font-size: 1.3rem;
  font-weight: bold;
}

.upgrade-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upgrade-category h4 {
  color: #00cc66;
  margin-bottom: 10px;
  border-bottom: 1px solid #004400;
  padding-bottom: 5px;
}

.upgrades-list {
  display: grid;
  gap: 10px;
}

.upgrade-item {
  padding: 15px;
  background: rgba(0, 100, 0, 0.1);
  border-radius: 8px;
  border: 1px solid #004400;
  transition: all 0.3s;
}

.upgrade-item.affordable {
  border-color: #00cc66;
  background: rgba(0, 204, 102, 0.15);
}

.upgrade-item.purchased {
  background: rgba(100, 100, 100, 0.1);
  border-color: #666;
  opacity: 0.7;
}

.upgrade-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.upgrade-name {
  color: #00cc66;
  font-weight: bold;
}

.upgrade-cost {
  color: #00d4ff;
  font-weight: bold;
}

.upgrade-description {
  color: #ccc;
  font-size: 0.9rem;
  margin-bottom: 10px;
  line-height: 1.4;
}

.upgrade-btn {
  width: 100%;
  padding: 8px;
  background: #00cc66;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  font-weight: bold;
}

.upgrade-btn:hover:not(:disabled) {
  background: #00aa55;
}

.upgrade-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.purchased .upgrade-btn {
  background: #888;
}
</style>