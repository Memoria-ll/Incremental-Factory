<template>
  <div class="quality-control-section">
    <div class="card-title">品質管理</div>
    
    <div class="quality-overview">
      <div class="quality-stats">
        <div class="stat-item">
          <div class="stat-label">全体品質率</div>
          <div class="stat-value" :class="getQualityClass(overallQuality)">
            {{ overallQuality.toFixed(1) }}%
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-label">検査済み製品</div>
          <div class="stat-value">{{ totalInspected }}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">不良品率</div>
          <div class="stat-value error">{{ defectRate.toFixed(1) }}%</div>
        </div>
      </div>
    </div>

    <div class="product-inspection">
      <h4>製品検査</h4>
      <div class="product-grid">
        <div 
          v-for="(amount, product) in products" 
          :key="product"
          class="product-item"
          v-if="amount > 0"
        >
          <div class="product-header">
            <span class="product-name">{{ getProductName(product) }}</span>
            <span class="product-amount">{{ amount }}個</span>
          </div>
          
          <div class="quality-meter">
            <div class="quality-bar">
              <div 
                class="quality-fill" 
                :style="{ 
                  width: getProductQuality(product) + '%',
                  background: getQualityColor(getProductQuality(product))
                }"
              ></div>
            </div>
            <span class="quality-percentage">{{ getProductQuality(product) }}%</span>
          </div>
          
          <div class="inspection-controls">
            <button 
              @click="inspectProduct(product)" 
              class="inspect-btn"
              :disabled="inspecting"
            >
              {{ inspecting === product ? '検査中...' : '詳細検査' }}
            </button>
            <button 
              @click="improveQuality(product)" 
              class="improve-btn"
              :disabled="!canImprove(product)"
            >
              品質改善
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="quality-standards">
      <h4>品質基準設定</h4>
      <div class="standards-grid">
        <div v-for="(standard, grade) in qualityStandards" :key="grade" class="standard-item">
          <div class="grade-label" :class="'grade-' + grade.toLowerCase()">
            グレード {{ grade.toUpperCase() }}
          </div>
          <div class="standard-range">
            {{ standard.min }}% - {{ standard.max }}%
          </div>
          <div class="standard-bonus">
            ボーナス: +{{ standard.bonus }}%
          </div>
        </div>
      </div>
    </div>

    <div class="quality-improvements">
      <h4>品質改善オプション</h4>
      <div class="improvement-options">
        <div 
          v-for="improvement in availableImprovements" 
          :key="improvement.id"
          class="improvement-card"
        >
          <div class="improvement-name">{{ improvement.name }}</div>
          <div class="improvement-effect">{{ improvement.effect }}</div>
          <div class="improvement-cost">コスト: {{ improvement.cost }} SP</div>
          <button 
            @click="purchaseImprovement(improvement)"
            class="purchase-btn"
            :disabled="!canPurchase(improvement)"
          >
            購入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QualityControlSection',
  props: {
    products: { type: Object, required: true },
    qualityStandards: { type: Object, default: () => ({}) }
  },
  emits: ['quality-check'],
  data() {
    return {
      inspecting: null,
      productQualities: {
        components: 85,
        circuits: 92,
        machinery: 78
      },
      totalInspected: 247,
      defectiveItems: 18,
      availableImprovements: [
        {
          id: 'precision_tools',
          name: '精密工具セット',
          effect: '全製品品質 +5%',
          cost: 500
        },
        {
          id: 'auto_inspector',
          name: '自動検査装置',
          effect: '検査速度 +100%',
          cost: 1200
        },
        {
          id: 'quality_ai',
          name: '品質管理AI',
          effect: '不良品率 -50%',
          cost: 2500
        }
      ]
    }
  },
  computed: {
    overallQuality() {
      const qualities = Object.values(this.productQualities)
      return qualities.length > 0 ? qualities.reduce((a, b) => a + b) / qualities.length : 0
    },
    
    defectRate() {
      return this.totalInspected > 0 ? (this.defectiveItems / this.totalInspected) * 100 : 0
    },
    
    defaultQualityStandards() {
      return {
        s: { min: 95, max: 100, bonus: 50 },
        a: { min: 85, max: 94, bonus: 25 },
        b: { min: 70, max: 84, bonus: 10 },
        c: { min: 50, max: 69, bonus: 0 },
        d: { min: 0, max: 49, bonus: -25 }
      }
    }
  },
  methods: {
    getProductName(product) {
      const names = {
        components: '部品',
        circuits: '回路',
        machinery: '機械'
      }
      return names[product] || product
    },
    
    getProductQuality(product) {
      return this.productQualities[product] || 75
    },
    
    getQualityClass(quality) {
      if (quality >= 95) return 'excellent'
      if (quality >= 85) return 'good'
      if (quality >= 70) return 'average'
      return 'poor'
    },
    
    getQualityColor(quality) {
      if (quality >= 95) return '#00ff88'
      if (quality >= 85) return '#88ff00'
      if (quality >= 70) return '#ffaa00'
      return '#ff6666'
    },
    
    inspectProduct(product) {
      this.inspecting = product
      
      setTimeout(() => {
        // 検査結果をランダムに生成
        const baseQuality = this.productQualities[product]
        const variance = Math.random() * 20 - 10 // ±10%の変動
        const newQuality = Math.max(0, Math.min(100, baseQuality + variance))
        
        this.productQualities[product] = Math.round(newQuality)
        this.totalInspected += 5
        
        if (newQuality < 70) {
          this.defectiveItems += Math.floor(Math.random() * 3)
        }
        
        this.inspecting = null
        
        this.$emit('quality-check', {
          product,
          quality: newQuality,
          passed: newQuality >= 70
        })
      }, 2000)
    },
    
    improveQuality(product) {
      if (!this.canImprove(product)) return
      
      // 品質を5-15%改善
      const improvement = Math.random() * 10 + 5
      this.productQualities[product] = Math.min(100, this.productQualities[product] + improvement)
    },
    
    canImprove(product) {
      return this.productQualities[product] < 95
    },
    
    purchaseImprovement(improvement) {
      if (!this.canPurchase(improvement)) return
      
      // 改善効果を適用
      switch (improvement.id) {
        case 'precision_tools':
          Object.keys(this.productQualities).forEach(product => {
            this.productQualities[product] = Math.min(100, this.productQualities[product] + 5)
          })
          break
        case 'auto_inspector':
          // 検査速度向上の効果はここでは表現しない
          break
        case 'quality_ai':
          this.defectiveItems = Math.floor(this.defectiveItems * 0.5)
          break
      }
      
      // 改善オプションを削除
      const index = this.availableImprovements.findIndex(imp => imp.id === improvement.id)
      if (index > -1) {
        this.availableImprovements.splice(index, 1)
      }
    },
    
    canPurchase(improvement) {
      // セレスの意思ポイントの判定は親コンポーネントで行う
      return true
    }
  }
}
</script>

<style scoped>
.quality-control-section {
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

.quality-overview {
  margin-bottom: 20px;
}

.quality-stats {
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
  font-size: 0.9em;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.5em;
  font-weight: bold;
  color: #fff;
}

.stat-value.excellent { color: #00ff88; }
.stat-value.good { color: #88ff00; }
.stat-value.average { color: #ffaa00; }
.stat-value.poor { color: #ff6666; }
.stat-value.error { color: #ff4444; }

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.product-item {
  background: rgba(100,0,100,0.1);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #440044;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.product-name {
  font-weight: bold;
  color: #fff;
}

.product-amount {
  color: #aaa;
}

.quality-meter {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.quality-bar {
  flex: 1;
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
}

.quality-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.quality-percentage {
  color: #fff;
  font-weight: bold;
  min-width: 45px;
}

.inspection-controls {
  display: flex;
  gap: 10px;
}

.inspect-btn, .improve-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.inspect-btn {
  background: #0066cc;
  color: #fff;
}

.inspect-btn:hover:not(:disabled) {
  background: #0080ff;
}

.improve-btn {
  background: #00aa44;
  color: #fff;
}

.improve-btn:hover:not(:disabled) {
  background: #00cc55;
}

.inspect-btn:disabled, .improve-btn:disabled {
  background: #666;
  color: #999;
  cursor: not-allowed;
}

.standards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.standard-item {
  background: rgba(255,255,255,0.05);
  border-radius: 6px;
  padding: 10px;
  text-align: center;
}

.grade-label {
  font-weight: bold;
  margin-bottom: 5px;
}

.grade-s { color: #00ff88; }
.grade-a { color: #88ff00; }
.grade-b { color: #ffaa00; }
.grade-c { color: #fff; }
.grade-d { color: #ff6666; }

.standard-range, .standard-bonus {
  font-size: 0.8em;
  color: #aaa;
  margin: 2px 0;
}

.improvement-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.improvement-card {
  background: rgba(0,100,200,0.1);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #006699;
}

.improvement-name {
  font-weight: bold;
  color: #66aaff;
  margin-bottom: 5px;
}

.improvement-effect {
  color: #ccc;
  font-size: 0.9em;
  margin-bottom: 8px;
}

.improvement-cost {
  color: #ffaa00;
  font-size: 0.8em;
  margin-bottom: 10px;
}

.purchase-btn {
  width: 100%;
  padding: 8px;
  background: #00d4ff;
  color: #000;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.purchase-btn:hover:not(:disabled) {
  background: #0099cc;
}

.purchase-btn:disabled {
  background: #666;
  color: #999;
  cursor: not-allowed;
}
</style>
