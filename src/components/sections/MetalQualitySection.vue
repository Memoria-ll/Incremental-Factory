<template>
  <div class="metal-quality-section">
    <div class="card-title">金属品質管理</div>
    
    <div class="quality-overview">
      <div class="quality-summary">
        <div class="summary-stat">
          <div class="stat-label">平均品質</div>
          <div class="stat-value" :class="getQualityClass(averageQuality)">
            {{ averageQuality.toFixed(1) }}%
          </div>
        </div>
        <div class="summary-stat">
          <div class="stat-label">最高品質</div>
          <div class="stat-value excellent">{{ maxQuality.toFixed(1) }}%</div>
        </div>
        <div class="summary-stat">
          <div class="stat-label">品質グレード</div>
          <div class="stat-value grade" :class="'grade-' + overallGrade.toLowerCase()">
            {{ overallGrade }}
          </div>
        </div>
      </div>
    </div>

    <div class="metal-analysis">
      <h4>金属別品質分析</h4>
      <div class="metals-grid">
        <div 
          v-for="(amount, metalType) in metals" 
          :key="metalType"
          class="metal-card"
          v-if="amount > 0"
        >
          <div class="metal-header">
            <div class="metal-info">
              <span class="metal-name">{{ getMetalName(metalType) }}</span>
              <span class="metal-amount">{{ formatAmount(amount) }}kg</span>
            </div>
            <div class="purity-indicator" :style="{ background: getPurityColor(metalType) }">
              {{ getPurity(metalType) }}%
            </div>
          </div>
          
          <div class="quality-meter">
            <div class="quality-label">品質レーティング</div>
            <div class="quality-bar-container">
              <div class="quality-bar">
                <div 
                  class="quality-fill" 
                  :style="{ 
                    width: getQualityRating(metalType) + '%',
                    background: getQualityGradient(metalType)
                  }"
                ></div>
              </div>
              <span class="quality-number">{{ getQualityRating(metalType) }}%</span>
            </div>
          </div>
          
          <div class="metal-properties">
            <div class="property-grid">
              <div class="property-item">
                <span class="property-label">硬度</span>
                <div class="property-bar">
                  <div 
                    class="property-fill" 
                    :style="{ width: getHardness(metalType) + '%' }"
                  ></div>
                </div>
                <span class="property-value">{{ getHardness(metalType) }}</span>
              </div>
              <div class="property-item">
                <span class="property-label">耐腐食性</span>
                <div class="property-bar">
                  <div 
                    class="property-fill" 
                    :style="{ width: getCorrosionResistance(metalType) + '%' }"
                  ></div>
                </div>
                <span class="property-value">{{ getCorrosionResistance(metalType) }}</span>
              </div>
              <div class="property-item">
                <span class="property-label">導電性</span>
                <div class="property-bar">
                  <div 
                    class="property-fill" 
                    :style="{ width: getConductivity(metalType) + '%' }"
                  ></div>
                </div>
                <span class="property-value">{{ getConductivity(metalType) }}</span>
              </div>
            </div>
          </div>
          
          <div class="quality-actions">
            <button 
              @click="analyzeComposition(metalType)"
              class="analyze-btn"
              :disabled="analyzing === metalType"
            >
              {{ analyzing === metalType ? '分析中...' : '成分分析' }}
            </button>
            <button 
              @click="purifyMetal(metalType)"
              class="purify-btn"
              :disabled="!canPurify(metalType)"
            >
              精製処理
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="alloy-research">
      <h4>合金研究</h4>
      <div class="alloy-grid">
        <div 
          v-for="alloy in availableAlloys" 
          :key="alloy.id"
          class="alloy-card"
          :class="{ 'discovered': alloy.discovered, 'researching': alloy.researching }"
        >
          <div class="alloy-header">
            <span class="alloy-name">{{ alloy.name }}</span>
            <span class="discovery-status" :class="alloy.discovered ? 'discovered' : 'unknown'">
              {{ alloy.discovered ? '発見済み' : '未発見' }}
            </span>
          </div>
          
          <div class="alloy-composition" v-if="alloy.discovered">
            <div class="composition-title">組成比</div>
            <div class="composition-list">
              <div 
                v-for="(ratio, metal) in alloy.composition" 
                :key="metal"
                class="composition-item"
              >
                <span>{{ getMetalName(metal) }}: {{ ratio }}%</span>
              </div>
            </div>
          </div>
          
          <div class="alloy-properties" v-if="alloy.discovered">
            <div class="expected-quality">予想品質: {{ alloy.expectedQuality }}%</div>
            <div class="special-properties">
              <span 
                v-for="property in alloy.specialProperties" 
                :key="property"
                class="special-property"
              >
                {{ property }}
              </span>
            </div>
          </div>
          
          <div class="alloy-actions">
            <button 
              @click="researchAlloy(alloy)"
              :disabled="alloy.discovered || alloy.researching || !canResearch(alloy)"
              class="research-btn"
            >
              {{ alloy.researching ? '研究中...' : alloy.discovered ? '完了' : '研究開始' }}
            </button>
            <button 
              @click="createAlloy(alloy)"
              :disabled="!alloy.discovered || !hasRequiredMaterials(alloy)"
              class="create-btn"
              v-if="alloy.discovered"
            >
              合金作成
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="quality-improvements">
      <h4>品質向上技術</h4>
      <div class="improvements-grid">
        <div 
          v-for="improvement in qualityImprovements" 
          :key="improvement.id"
          class="improvement-card"
          :class="{ 'unlocked': improvement.unlocked }"
        >
          <div class="improvement-icon">{{ improvement.icon }}</div>
          <div class="improvement-info">
            <div class="improvement-name">{{ improvement.name }}</div>
            <div class="improvement-description">{{ improvement.description }}</div>
            <div class="improvement-effect">効果: {{ improvement.effect }}</div>
          </div>
          <div class="improvement-cost">
            <div class="cost-display">{{ improvement.cost }} SP</div>
            <button 
              @click="unlockImprovement(improvement)"
              :disabled="improvement.unlocked || !canUnlock(improvement)"
              class="unlock-btn"
            >
              {{ improvement.unlocked ? '解禁済み' : '解禁' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MetalQualitySection',
  props: {
    metals: { type: Object, required: true },
    qualityRatings: { type: Object, required: true }
  },
  emits: ['analyze-metal', 'purify-metal', 'research-alloy'],
  data() {
    return {
      analyzing: null,
      availableAlloys: [
        {
          id: 'steel',
          name: '鋼鉄',
          discovered: true,
          researching: false,
          composition: { iron: 85, carbon: 15 },
          expectedQuality: 120,
          specialProperties: ['高強度', '耐久性']
        },
        {
          id: 'bronze',
          name: '青銅',
          discovered: true,
          researching: false,
          composition: { copper: 88, tin: 12 },
          expectedQuality: 110,
          specialProperties: ['耐腐食', '加工性']
        },
        {
          id: 'titanium_alloy',
          name: 'チタン合金',
          discovered: false,
          researching: false,
          composition: { titanium: 70, aluminum: 20, vanadium: 10 },
          expectedQuality: 180,
          specialProperties: ['超軽量', '超耐久', '高温耐性']
        },
        {
          id: 'superconductor',
          name: '超伝導合金',
          discovered: false,
          researching: false,
          composition: { rare_ore: 60, copper: 30, special_catalyst: 10 },
          expectedQuality: 250,
          specialProperties: ['超伝導', '零抵抗', '磁気浮上']
        }
      ],
      qualityImprovements: [
        {
          id: 'vacuum_smelting',
          name: '真空精錬技術',
          description: '真空環境での高純度精錬',
          effect: '全金属品質 +15%',
          cost: 800,
          unlocked: false,
          icon: '🔬'
        },
        {
          id: 'plasma_refining',
          name: 'プラズマ精製',
          description: 'プラズマによる不純物除去',
          effect: '希少金属品質 +25%',
          cost: 1500,
          unlocked: false,
          icon: '⚡'
        },
        {
          id: 'molecular_assembly',
          name: '分子組立技術',
          description: '分子レベルでの材料設計',
          effect: '合金品質 +40%',
          cost: 3000,
          unlocked: false,
          icon: '🧬'
        }
      ]
    }
  },
  computed: {
    averageQuality() {
      const qualities = Object.values(this.qualityRatings)
      return qualities.length > 0 ? qualities.reduce((a, b) => a + b) / qualities.length : 0
    },
    
    maxQuality() {
      const qualities = Object.values(this.qualityRatings)
      return qualities.length > 0 ? Math.max(...qualities) : 0
    },
    
    overallGrade() {
      const avg = this.averageQuality
      if (avg >= 95) return 'S'
      if (avg >= 85) return 'A'
      if (avg >= 70) return 'B'
      if (avg >= 50) return 'C'
      return 'D'
    }
  },
  methods: {
    getMetalName(metalType) {
      const names = {
        iron: '鉄',
        copper: '銅',
        alloys: '合金',
        steel: '鋼鉄',
        aluminum: 'アルミニウム',
        titanium: 'チタン',
        rare_ore: '希少鉱石'
      }
      return names[metalType] || metalType
    },
    
    formatAmount(amount) {
      if (amount >= 1000000) {
        return (amount / 1000000).toFixed(1) + 'M'
      } else if (amount >= 1000) {
        return (amount / 1000).toFixed(1) + 'k'
      }
      return amount.toString()
    },
    
    getQualityRating(metalType) {
      return Math.round(this.qualityRatings[metalType] || 75)
    },
    
    getQualityClass(quality) {
      if (quality >= 95) return 'excellent'
      if (quality >= 85) return 'good'
      if (quality >= 70) return 'average'
      return 'poor'
    },
    
    getQualityGradient(metalType) {
      const quality = this.getQualityRating(metalType)
      if (quality >= 95) return 'linear-gradient(90deg, #00ff88, #00ffdd)'
      if (quality >= 85) return 'linear-gradient(90deg, #88ff00, #00ff88)'
      if (quality >= 70) return 'linear-gradient(90deg, #ffaa00, #88ff00)'
      return 'linear-gradient(90deg, #ff6666, #ffaa00)'
    },
    
    getPurity(metalType) {
      const base = this.getQualityRating(metalType)
      return Math.min(99.9, base + Math.random() * 5)
    },
    
    getPurityColor(metalType) {
      const purity = this.getPurity(metalType)
      if (purity >= 95) return '#00ff88'
      if (purity >= 85) return '#88ff00'
      if (purity >= 70) return '#ffaa00'
      return '#ff6666'
    },
    
    getHardness(metalType) {
      const baseValues = { iron: 60, copper: 30, alloys: 85, steel: 90 }
      return baseValues[metalType] || 50
    },
    
    getCorrosionResistance(metalType) {
      const baseValues = { iron: 40, copper: 80, alloys: 75, steel: 65 }
      return baseValues[metalType] || 50
    },
    
    getConductivity(metalType) {
      const baseValues = { iron: 20, copper: 95, alloys: 60, steel: 25 }
      return baseValues[metalType] || 50
    },
    
    analyzeComposition(metalType) {
      this.analyzing = metalType
      
      setTimeout(() => {
        // 分析結果をシミュレート
        console.log(`${this.getMetalName(metalType)}の成分分析完了`)
        this.analyzing = null
        
        this.$emit('analyze-metal', {
          metalType,
          composition: this.generateComposition(metalType),
          impurities: this.generateImpurities()
        })
      }, 3000)
    },
    
    generateComposition(metalType) {
      // 金属タイプに応じた成分構成を生成
      const compositions = {
        iron: { Fe: 96.5, C: 2.1, Si: 0.8, Mn: 0.6 },
        copper: { Cu: 99.2, Zn: 0.4, Pb: 0.2, Fe: 0.2 },
        alloys: { Fe: 70, Cr: 18, Ni: 8, Mo: 4 }
      }
      return compositions[metalType] || { main: 95, trace: 5 }
    },
    
    generateImpurities() {
      const impurities = ['酸素', '硫黄', 'リン', '窒素']
      return impurities.slice(0, Math.floor(Math.random() * 3) + 1)
    },
    
    purifyMetal(metalType) {
      if (!this.canPurify(metalType)) return
      
      console.log(`${this.getMetalName(metalType)}の精製処理開始`)
      
      this.$emit('purify-metal', {
        metalType,
        cost: this.getPurifyCost(metalType),
        expectedImprovement: 10
      })
    },
    
    canPurify(metalType) {
      return this.getQualityRating(metalType) < 95
    },
    
    getPurifyCost(metalType) {
      const baseCosts = { iron: 50, copper: 80, alloys: 120 }
      return baseCosts[metalType] || 100
    },
    
    researchAlloy(alloy) {
      if (alloy.discovered || alloy.researching || !this.canResearch(alloy)) return
      
      alloy.researching = true
      
      setTimeout(() => {
        alloy.researching = false
        alloy.discovered = true
        console.log(`${alloy.name}の研究が完了しました`)
        
        this.$emit('research-alloy', {
          alloyId: alloy.id,
          researchCost: 500
        })
      }, 5000)
    },
    
    canResearch(alloy) {
      // 必要な基礎材料があるかチェック
      return Object.keys(alloy.composition).every(material => 
        this.metals[material] > 0 || material === 'carbon' || material === 'special_catalyst'
      )
    },
    
    createAlloy(alloy) {
      if (!alloy.discovered || !this.hasRequiredMaterials(alloy)) return
      
      console.log(`${alloy.name}の作成開始`)
      // 合金作成の処理は親コンポーネントに委譲
    },
    
    hasRequiredMaterials(alloy) {
      return Object.entries(alloy.composition).every(([material, ratio]) => {
        const required = ratio / 100 * 100 // 100kgの合金を作るのに必要な量
        return (this.metals[material] || 0) >= required
      })
    },
    
    unlockImprovement(improvement) {
      if (improvement.unlocked || !this.canUnlock(improvement)) return
      
      improvement.unlocked = true
      console.log(`${improvement.name}を解禁しました`)
    },
    
    canUnlock(improvement) {
      // セレスの意思ポイントの判定は親コンポーネントで行う
      return true
    }
  }
}
</script>

<style scoped>
.metal-quality-section {
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

.quality-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.summary-stat {
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

.stat-value.grade.grade-s { color: #00ff88; }
.stat-value.grade.grade-a { color: #88ff00; }
.stat-value.grade.grade-b { color: #ffaa00; }
.stat-value.grade.grade-c { color: #fff; }
.stat-value.grade.grade-d { color: #ff6666; }

.metals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.metal-card {
  background: rgba(100,50,0,0.2);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #664400;
}

.metal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.metal-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.metal-name {
  font-weight: bold;
  color: #ffaa00;
  font-size: 1.1em;
}

.metal-amount {
  color: #aaa;
  font-size: 0.9em;
}

.purity-indicator {
  padding: 5px 10px;
  border-radius: 15px;
  color: #000;
  font-weight: bold;
  font-size: 0.8em;
}

.quality-meter {
  margin-bottom: 15px;
}

.quality-label {
  color: #ccc;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.quality-bar-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.quality-bar {
  flex: 1;
  height: 10px;
  background: #333;
  border-radius: 5px;
  overflow: hidden;
}

.quality-fill {
  height: 100%;
  transition: width 0.5s ease;
}

.quality-number {
  color: #fff;
  font-weight: bold;
  min-width: 45px;
}

.property-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.property-item {
  display: grid;
  grid-template-columns: 80px 1fr 40px;
  align-items: center;
  gap: 10px;
}

.property-label {
  color: #aaa;
  font-size: 0.8em;
}

.property-bar {
  height: 6px;
  background: #333;
  border-radius: 3px;
  overflow: hidden;
}

.property-fill {
  height: 100%;
  background: linear-gradient(90deg, #666, #00d4ff);
  transition: width 0.3s ease;
}

.property-value {
  color: #fff;
  font-size: 0.8em;
  text-align: center;
}

.quality-actions {
  display: flex;
  gap: 10px;
}

.analyze-btn, .purify-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.analyze-btn {
  background: #0066cc;
  color: #fff;
}

.purify-btn {
  background: #00aa44;
  color: #fff;
}

.analyze-btn:disabled, .purify-btn:disabled {
  background: #666;
  color: #999;
  cursor: not-allowed;
}

.alloy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.alloy-card {
  background: rgba(0,100,100,0.1);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #006666;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.alloy-card.discovered {
  opacity: 1;
  border-color: #00cccc;
  background: rgba(0,150,150,0.15);
}

.alloy-card.researching {
  border-color: #ffaa00;
  background: rgba(255,170,0,0.1);
  animation: pulse 2s infinite;
}

.alloy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.alloy-name {
  font-weight: bold;
  color: #66cccc;
}

.discovery-status {
  font-size: 0.8em;
  padding: 2px 8px;
  border-radius: 4px;
}

.discovery-status.discovered {
  background: rgba(0,204,102,0.2);
  color: #00cc66;
}

.discovery-status.unknown {
  background: rgba(102,102,102,0.2);
  color: #aaa;
}

.composition-title {
  color: #ccc;
  font-size: 0.9em;
  margin-bottom: 5px;
}

.composition-list {
  margin-bottom: 10px;
}

.composition-item {
  color: #aaa;
  font-size: 0.8em;
}

.expected-quality {
  color: #00ff88;
  font-weight: bold;
  margin-bottom: 5px;
}

.special-properties {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.special-property {
  background: rgba(0,212,255,0.2);
  color: #00d4ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7em;
}

.alloy-actions {
  display: flex;
  gap: 10px;
}

.research-btn, .create-btn {
  flex: 1;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 0.8em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.research-btn {
  background: #0066cc;
  color: #fff;
}

.create-btn {
  background: #00aa44;
  color: #fff;
}

.research-btn:disabled, .create-btn:disabled {
  background: #666;
  color: #999;
  cursor: not-allowed;
}

.improvements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.improvement-card {
  background: rgba(0,100,200,0.1);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #006699;
  display: flex;
  align-items: center;
  gap: 15px;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.improvement-card.unlocked {
  opacity: 1;
  border-color: #00ccff;
  background: rgba(0,150,255,0.15);
}

.improvement-icon {
  font-size: 2em;
  text-align: center;
  min-width: 50px;
}

.improvement-info {
  flex: 1;
}

.improvement-name {
  font-weight: bold;
  color: #66aaff;
  margin-bottom: 5px;
}

.improvement-description, .improvement-effect {
  color: #ccc;
  font-size: 0.9em;
  margin: 2px 0;
}

.improvement-cost {
  text-align: center;
  min-width: 100px;
}

.cost-display {
  color: #ffaa00;
  font-weight: bold;
  margin-bottom: 8px;
}

.unlock-btn {
  width: 100%;
  padding: 6px;
  background: #00d4ff;
  color: #000;
  border: none;
  border-radius: 4px;
  font-size: 0.8em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.unlock-btn:disabled {
  background: #666;
  color: #999;
  cursor: not-allowed;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
</style>
