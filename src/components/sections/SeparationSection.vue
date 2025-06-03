<template>
  <div class="content-card separation-section">
    <h3 class="card-title">分離システム</h3>
    
    <div class="separation-processes">
      <div class="process-item">
        <h4>土壌分離</h4>
        <div class="process-info">
          <span>土壌 → 鉄鉱石 + 銅鉱石</span>
          <span class="efficiency">効率: {{ separationEfficiency }}%</span>
        </div>
        <button 
          @click="separate('soil')" 
          :disabled="rawMaterials.soil < 10"
          class="process-btn"
        >
          分離実行 (土壌 10 必要)
        </button>
      </div>
      
      <div class="process-item">
        <h4>岩石分離</h4>
        <div class="process-info">
          <span>岩石 → 鉄鉱石 + 希少鉱石</span>
          <span class="efficiency">効率: {{ separationEfficiency }}%</span>
        </div>
        <button 
          @click="separate('rocks')" 
          :disabled="rawMaterials.rocks < 10"
          class="process-btn"
        >
          分離実行 (岩石 10 必要)
        </button>
      </div>
      
      <div class="process-item">
        <h4>堆積物分離</h4>
        <div class="process-info">
          <span>堆積物 → 銅鉱石 + 希少鉱石</span>
          <span class="efficiency">効率: {{ separationEfficiency }}%</span>
        </div>
        <button 
          @click="separate('sediment')" 
          :disabled="rawMaterials.sediment < 10"
          class="process-btn"
        >
          分離実行 (堆積物 10 必要)
        </button>
      </div>
    </div>
    
    <div class="separation-stats">
      <h4>分離統計</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">総分離回数:</span>
          <span class="stat-value">{{ separationStats.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">成功率:</span>
          <span class="stat-value">{{ separationStats.successRate }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均効率:</span>
          <span class="stat-value">{{ separationStats.averageEfficiency }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'SeparationSection',
  props: {
    rawMaterials: { type: Object, required: true },
    separationEfficiency: { type: Number, default: 100 }
  },
  emits: ['separate'],
  setup(props, { emit }) {
    const separationStats = ref({
      total: 0,
      successful: 0,
      totalEfficiency: 0
    })
    
    const separationRecipes = {
      soil: {
        input: { soil: 10 },
        outputs: [
          { resource: 'iron_ore', amount: 3, chance: 0.8 },
          { resource: 'copper_ore', amount: 2, chance: 0.6 }
        ]
      },
      rocks: {
        input: { rocks: 10 },
        outputs: [
          { resource: 'iron_ore', amount: 5, chance: 0.9 },
          { resource: 'rare_ore', amount: 1, chance: 0.3 }
        ]
      },
      sediment: {
        input: { sediment: 10 },
        outputs: [
          { resource: 'copper_ore', amount: 4, chance: 0.85 },
          { resource: 'rare_ore', amount: 1, chance: 0.25 }
        ]
      }
    }
    
    const separate = (materialType) => {
      const recipe = separationRecipes[materialType]
      if (!recipe) return
      
      const input = recipe.input
      const inputResource = Object.keys(input)[0]
      const inputAmount = input[inputResource]
      
      if (props.rawMaterials[inputResource] >= inputAmount) {
        const outputs = {}
        let successful = false
        
        recipe.outputs.forEach(output => {
          const chance = Math.random()
          const efficiencyBonus = (props.separationEfficiency - 100) / 100
          const adjustedChance = output.chance + (efficiencyBonus * 0.1)
          
          if (chance <= adjustedChance) {
            const amount = Math.floor(output.amount * (props.separationEfficiency / 100))
            outputs[output.resource] = (outputs[output.resource] || 0) + amount
            successful = true
          }
        })
        
        // 統計更新
        separationStats.value.total++
        if (successful) {
          separationStats.value.successful++
        }
        separationStats.value.totalEfficiency += props.separationEfficiency
        
        emit('separate', {
          input: { [inputResource]: inputAmount },
          output: outputs,
          successful
        })
      }
    }
    
    const computedStats = computed(() => ({
      total: separationStats.value.total,
      successRate: separationStats.value.total > 0 
        ? Math.floor((separationStats.value.successful / separationStats.value.total) * 100)
        : 0,
      averageEfficiency: separationStats.value.total > 0
        ? Math.floor(separationStats.value.totalEfficiency / separationStats.value.total)
        : 0
    }))
    
    return {
      separationStats: computedStats,
      separate
    }
  }
}
</script>

<style scoped>
.separation-section {
  margin-bottom: 20px;
}

.separation-processes {
  display: grid;
  gap: 15px;
  margin-bottom: 20px;
}

.process-item {
  padding: 15px;
  background: rgba(100, 0, 100, 0.1);
  border-radius: 8px;
  border: 1px solid #440044;
}

.process-item h4 {
  color: #ff66ff;
  margin-bottom: 10px;
}

.process-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.process-info span:first-child {
  color: #ccc;
}

.efficiency {
  color: #00cc66;
  font-weight: bold;
}

.process-btn {
  width: 100%;
  padding: 10px;
  background: #9932CC;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

.process-btn:hover:not(:disabled) {
  background: #BA55D3;
}

.process-btn:disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.5;
}

.separation-stats h4 {
  color: #00d4ff;
  margin-bottom: 10px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  border: 1px solid #333;
}

.stat-label {
  color: #aaa;
}

.stat-value {
  color: #fff;
  font-weight: bold;
}
</style>