<template>
  <div class="content-card resource-panel">
    <h3 class="card-title">リソース状況</h3>
    
    <div class="resource-categories">
      <div class="resource-category">
        <h4>原材料</h4>
        <div class="resource-grid">
          <div v-for="(amount, resource) in rawResources" :key="resource" class="resource-item">
            <span class="resource-name">{{ getResourceDisplayName(resource) }}</span>
            <span class="resource-amount">{{ formatNumber(amount) }}</span>
            <div class="resource-rate" v-if="getProductionRate(resource) !== 0">
              <span :class="{ positive: getProductionRate(resource) > 0, negative: getProductionRate(resource) < 0 }">
                {{ getProductionRate(resource) > 0 ? '+' : '' }}{{ formatNumber(getProductionRate(resource)) }}/秒
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="resource-category">
        <h4>精錬済み</h4>
        <div class="resource-grid">
          <div v-for="(amount, resource) in processedResources" :key="resource" class="resource-item">
            <span class="resource-name">{{ getResourceDisplayName(resource) }}</span>
            <span class="resource-amount">{{ formatNumber(amount) }}</span>
            <div class="resource-rate" v-if="getProductionRate(resource) !== 0">
              <span :class="{ positive: getProductionRate(resource) > 0, negative: getProductionRate(resource) < 0 }">
                {{ getProductionRate(resource) > 0 ? '+' : '' }}{{ formatNumber(getProductionRate(resource)) }}/秒
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="resource-category">
        <h4>製品</h4>
        <div class="resource-grid">
          <div v-for="(amount, resource) in manufacturedResources" :key="resource" class="resource-item">
            <span class="resource-name">{{ getResourceDisplayName(resource) }}</span>
            <span class="resource-amount">{{ formatNumber(amount) }}</span>
            <div class="resource-rate" v-if="getProductionRate(resource) !== 0">
              <span :class="{ positive: getProductionRate(resource) > 0, negative: getProductionRate(resource) < 0 }">
                {{ getProductionRate(resource) > 0 ? '+' : '' }}{{ formatNumber(getProductionRate(resource)) }}/秒
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ResourcePanel',
  props: {
    resources: { type: Object, required: true }
  },
  setup(props) {
    const resourceCategories = {
      raw: ['soil', 'rocks', 'sediment', 'iron_ore', 'copper_ore', 'rare_ore'],
      processed: ['iron', 'copper', 'steel', 'alloys'],
      manufactured: ['wire', 'circuits', 'components', 'machinery']
    }
    
    const resourceNames = {
      soil: '土壌',
      rocks: '岩石',
      sediment: '堆積物',
      iron_ore: '鉄鉱石',
      copper_ore: '銅鉱石',
      rare_ore: '希少鉱石',
      iron: '鉄',
      copper: '銅',
      steel: '鋼鉄',
      alloys: '合金',
      wire: '配線',
      circuits: '回路',
      components: '部品',
      machinery: '機械',
      energy: 'エネルギー',
      fuel: '燃料',
      coolant: '冷却材'
    }
    
    const rawResources = computed(() => {
      const result = {}
      resourceCategories.raw.forEach(resource => {
        result[resource] = props.resources[resource] || 0
      })
      return result
    })
    
    const processedResources = computed(() => {
      const result = {}
      resourceCategories.processed.forEach(resource => {
        result[resource] = props.resources[resource] || 0
      })
      return result
    })
    
    const manufacturedResources = computed(() => {
      const result = {}
      resourceCategories.manufactured.forEach(resource => {
        result[resource] = props.resources[resource] || 0
      })
      return result
    })
    
    const getResourceDisplayName = (resource) => {
      return resourceNames[resource] || resource
    }
    
    const formatNumber = (num) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
      }
      return Math.floor(num).toString()
    }
    
    const getProductionRate = (resource) => {
      // TODO: 実際の生産率計算を実装
      return 0
    }
    
    return {
      rawResources,
      processedResources,
      manufacturedResources,
      getResourceDisplayName,
      formatNumber,
      getProductionRate
    }
  }
}
</script>

<style scoped>
.resource-panel {
  margin-bottom: 20px;
}

.resource-categories {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.resource-category h4 {
  color: #00d4ff;
  margin-bottom: 10px;
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 10px;
}

.resource-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: rgba(100, 0, 100, 0.1);
  border-radius: 6px;
  border: 1px solid #440044;
}

.resource-name {
  font-size: 0.8rem;
  color: #aaa;
  margin-bottom: 5px;
}

.resource-amount {
  font-weight: bold;
  color: #fff;
  font-size: 1.1rem;
}

.resource-rate {
  margin-top: 3px;
  font-size: 0.7rem;
}

.resource-rate .positive {
  color: #00cc66;
}

.resource-rate .negative {
  color: #ff6666;
}
</style>