<template>
  <div class="production-line-section">
    <div class="card-title">生産ライン管理</div>
    
    <div class="recipe-selector">
      <h4>製造レシピ選択</h4>
      <div class="recipe-grid">
        <div 
          v-for="recipe in productionRecipes" 
          :key="recipe.id"
          class="recipe-card"
          :class="{ 'active': selectedRecipe?.id === recipe.id, 'disabled': !canProduce(recipe) }"
          @click="selectRecipe(recipe)"
        >
          <div class="recipe-name">{{ recipe.name }}</div>
          <div class="recipe-inputs">
            <span v-for="(amount, material) in recipe.inputs" :key="material" class="input-item">
              {{ material }}: {{ amount }}
            </span>
          </div>
          <div class="recipe-outputs">
            <span v-for="(amount, product) in recipe.outputs" :key="product" class="output-item">
              → {{ product }}: {{ amount }}
            </span>
          </div>
          <div class="recipe-time">製造時間: {{ recipe.time }}秒</div>
        </div>
      </div>
    </div>

    <div class="production-control" v-if="selectedRecipe">
      <h4>{{ selectedRecipe.name }} 製造</h4>
      <div class="quantity-control">
        <label>製造数量:</label>
        <input 
          type="number" 
          v-model.number="quantity" 
          min="1" 
          :max="maxQuantity"
          class="quantity-input"
        >
        <span class="max-quantity">最大: {{ maxQuantity }}</span>
      </div>
      
      <div class="efficiency-display">
        <span>製造効率: {{ efficiency }}%</span>
        <span>実際製造時間: {{ Math.ceil(selectedRecipe.time * (100 / efficiency)) }}秒</span>
      </div>

      <button 
        @click="startProduction" 
        :disabled="!canProduce(selectedRecipe) || quantity <= 0"
        class="manufacture-btn"
      >
        製造開始
      </button>
    </div>

    <div class="production-queue" v-if="productionQueue.length > 0">
      <h4>製造キュー</h4>
      <div class="queue-item" v-for="(item, index) in productionQueue" :key="index">
        <span>{{ item.recipe.name }} × {{ item.quantity }}</span>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: item.progress + '%' }"></div>
        </div>
        <span>{{ Math.floor(item.progress) }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductionLineSection',
  props: {
    metals: { type: Object, required: true },
    productionRecipes: { type: Array, required: true },
    efficiency: { type: Number, default: 100 }
  },
  emits: ['manufacture'],
  data() {
    return {
      selectedRecipe: null,
      quantity: 1,
      productionQueue: []
    }
  },
  computed: {
    maxQuantity() {
      if (!this.selectedRecipe) return 0
      
      let max = Infinity
      for (const [material, required] of Object.entries(this.selectedRecipe.inputs)) {
        const available = this.metals[material] || 0
        max = Math.min(max, Math.floor(available / required))
      }
      return max === Infinity ? 0 : max
    }
  },
  methods: {
    selectRecipe(recipe) {
      this.selectedRecipe = recipe
      this.quantity = Math.min(this.quantity, this.maxQuantity)
    },
    
    canProduce(recipe) {
      for (const [material, required] of Object.entries(recipe.inputs)) {
        if ((this.metals[material] || 0) < required) {
          return false
        }
      }
      return true
    },
    
    startProduction() {
      if (!this.canProduce(this.selectedRecipe) || this.quantity <= 0) return
      
      const productionItem = {
        recipe: this.selectedRecipe,
        quantity: this.quantity,
        progress: 0,
        startTime: Date.now()
      }
      
      this.productionQueue.push(productionItem)
      this.processProduction(productionItem)
      
      this.$emit('manufacture', {
        recipe: this.selectedRecipe,
        quantity: this.quantity
      })
    },
    
    processProduction(item) {
      const totalTime = item.recipe.time * (100 / this.efficiency) * 1000 // ミリ秒
      const updateInterval = 100 // 100ms毎に更新
      
      const interval = setInterval(() => {
        const elapsed = Date.now() - item.startTime
        item.progress = Math.min((elapsed / totalTime) * 100, 100)
        
        if (item.progress >= 100) {
          clearInterval(interval)
          this.completeProduction(item)
        }
      }, updateInterval)
    },
    
    completeProduction(item) {
      const index = this.productionQueue.indexOf(item)
      if (index > -1) {
        this.productionQueue.splice(index, 1)
      }
    }
  }
}
</script>

<style scoped>
.production-line-section {
  background: rgba(0,0,0,0.3);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #333;
  margin-bottom: 20px;
}

.card-title {
  color: #00d4ff;
  font-size: 1.1em;
  margin-bottom: 15px;
  border-bottom: 1px solid #333;
  padding-bottom: 8px;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.recipe-card {
  background: rgba(100,50,0,0.2);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #664400;
  cursor: pointer;
  transition: all 0.3s ease;
}

.recipe-card:hover {
  background: rgba(100,50,0,0.3);
}

.recipe-card.active {
  border-color: #00d4ff;
  background: rgba(0,212,255,0.2);
}

.recipe-card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.recipe-name {
  font-weight: bold;
  color: #ffaa00;
  margin-bottom: 8px;
}

.recipe-inputs, .recipe-outputs {
  font-size: 0.9em;
  margin: 5px 0;
}

.input-item {
  color: #ff9999;
  margin-right: 10px;
}

.output-item {
  color: #99ff99;
  margin-right: 10px;
}

.recipe-time {
  color: #aaa;
  font-size: 0.8em;
  margin-top: 5px;
}

.production-control {
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.quantity-input {
  width: 80px;
  padding: 5px;
  background: #333;
  color: #fff;
  border: 1px solid #666;
  border-radius: 4px;
}

.max-quantity {
  color: #aaa;
  font-size: 0.9em;
}

.efficiency-display {
  display: flex;
  gap: 20px;
  margin: 10px 0;
  color: #ccc;
  font-size: 0.9em;
}

.manufacture-btn {
  background: #00d4ff;
  color: #000;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.manufacture-btn:hover:not(:disabled) {
  background: #0099cc;
}

.manufacture-btn:disabled {
  background: #666;
  color: #999;
  cursor: not-allowed;
}

.production-queue {
  background: rgba(0,100,0,0.1);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #004400;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
  padding: 8px;
  background: rgba(255,255,255,0.05);
  border-radius: 4px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00cc66, #00d4ff);
  transition: width 0.1s ease;
}
</style>
