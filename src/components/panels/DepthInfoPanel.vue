<template>
  <div class="content-card depth-info-panel">
    <h3 class="card-title">深度情報</h3>
    
    <div class="current-depth">
      <div class="depth-header">
        <span class="depth-title">現在深度: {{ currentDepth }}m</span>
        <span class="depth-status" :class="depthStatusClass">{{ depthStatus }}</span>
      </div>
    </div>
    
    <div class="depth-characteristics">
      <h4>環境特性</h4>
      <div class="characteristics-grid">
        <div class="characteristic-item">
          <span class="char-label">温度:</span>
          <span class="char-value">{{ temperature.toFixed(1) }}°C</span>
          <div class="char-bar">
            <div class="char-fill" :style="{ width: Math.min(100, temperature / 3) + '%' }"></div>
          </div>
        </div>
        
        <div class="characteristic-item">
          <span class="char-label">圧力:</span>
          <span class="char-value">{{ pressure.toFixed(2) }} MPa</span>
          <div class="char-bar">
            <div class="char-fill" :style="{ width: Math.min(100, pressure / 1.2) + '%' }"></div>
          </div>
        </div>
        
        <div class="characteristic-item">
          <span class="char-label">硬度:</span>
          <span class="char-value">{{ hardness.toFixed(0) }}</span>
          <div class="char-bar">
            <div class="char-fill" :style="{ width: hardness + '%' }"></div>
          </div>
        </div>
        
        <div class="characteristic-item">
          <span class="char-label">鉱石濃度:</span>
          <span class="char-value">{{ oreConcentration.toFixed(2) }}x</span>
          <div class="char-bar">
            <div class="char-fill" :style="{ width: Math.min(100, oreConcentration * 50) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="depth-layers">
      <h4>地層情報</h4>
      <div class="layers-list">
        <div 
          v-for="layer in depthLayers" 
          :key="layer.name"
          class="layer-item"
          :class="{ current: isCurrentLayer(layer), accessible: isAccessible(layer) }"
        >
          <div class="layer-info">
            <span class="layer-name">{{ layer.name }}</span>
            <span class="layer-range">{{ layer.range }}</span>
          </div>
          <div class="layer-features">
            <span v-for="feature in layer.features" :key="feature" class="feature-tag">
              {{ feature }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'DepthInfoPanel',
  props: {
    currentDepth: { type: Number, required: true },
    depthCharacteristics: { type: Object, required: true }
  },
  setup(props) {
    const depthLayers = [
      {
        name: '表土層',
        range: '0-100m',
        minDepth: 0,
        maxDepth: 100,
        features: ['基本鉱石', '低温', '低圧']
      },
      {
        name: '岩盤層',
        range: '100-1,000m',
        minDepth: 100,
        maxDepth: 1000,
        features: ['商業採掘', '希少金属', '中温']
      },
      {
        name: '地下水層',
        range: '1,000-3,000m',
        minDepth: 1000,
        maxDepth: 3000,
        features: ['地熱利用', '特殊鉱石', '高圧']
      },
      {
        name: '熱水層',
        range: '3,000-6,000m',
        minDepth: 3000,
        maxDepth: 6000,
        features: ['極限技術', 'エネルギー合金', '超高温']
      },
      {
        name: '高圧帯',
        range: '6,000-12,000m',
        minDepth: 6000,
        maxDepth: 12000,
        features: ['概念技術', '時空石', '極限環境']
      },
      {
        name: 'マグマ層',
        range: '12,000m+',
        minDepth: 12000,
        maxDepth: Infinity,
        features: ['創造技術', '完全架空', '究極環境']
      }
    ]
    
    const temperature = computed(() => props.depthCharacteristics.temperature || 15)
    const pressure = computed(() => props.depthCharacteristics.pressure || 0)
    const hardness = computed(() => props.depthCharacteristics.hardness || 0)
    const oreConcentration = computed(() => props.depthCharacteristics.oreConcentration || 1)
    
    const depthStatus = computed(() => {
      if (props.currentDepth < 100) return '安全'
      if (props.currentDepth < 1000) return '注意'
      if (props.currentDepth < 3000) return '危険'
      if (props.currentDepth < 6000) return '極限'
      return '未知'
    })
    
    const depthStatusClass = computed(() => {
      if (props.currentDepth < 100) return 'safe'
      if (props.currentDepth < 1000) return 'caution'
      if (props.currentDepth < 3000) return 'danger'
      if (props.currentDepth < 6000) return 'extreme'
      return 'unknown'
    })
    
    const isCurrentLayer = (layer) => {
      return props.currentDepth >= layer.minDepth && props.currentDepth < layer.maxDepth
    }
    
    const isAccessible = (layer) => {
      return props.currentDepth >= layer.minDepth
    }
    
    return {
      depthLayers,
      temperature,
      pressure,
      hardness,
      oreConcentration,
      depthStatus,
      depthStatusClass,
      isCurrentLayer,
      isAccessible
    }
  }
}
</script>

<style scoped>
.depth-info-panel {
  background: rgba(0, 100, 200, 0.1);
  border-color: #006699;
}

.current-depth {
  margin-bottom: 20px;
}

.depth-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(0, 150, 255, 0.2);
  border-radius: 6px;
}

.depth-title {
  color: #66aaff;
  font-weight: bold;
  font-size: 1.1rem;
}

.depth-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.depth-status.safe { background: #00cc66; color: white; }
.depth-status.caution { background: #ffaa00; color: white; }
.depth-status.danger { background: #ff6600; color: white; }
.depth-status.extreme { background: #ff0066; color: white; }
.depth-status.unknown { background: #9932cc; color: white; }

.depth-characteristics h4,
.depth-layers h4 {
  color: #66aaff;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(102, 170, 255, 0.3);
  padding-bottom: 5px;
}

.characteristics-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
}

.characteristic-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.char-label {
  min-width: 80px;
  color: #aaa;
  font-size: 0.9rem;
}

.char-value {
  min-width: 70px;
  color: #fff;
  font-weight: bold;
}

.char-bar {
  flex: 1;
  height: 6px;
  background: #333;
  border-radius: 3px;
  overflow: hidden;
}

.char-fill {
  height: 100%;
  background: linear-gradient(90deg, #00cc66, #00d4ff);
  transition: width 0.3s ease;
}

.layers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layer-item {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #444;
  background: rgba(0, 0, 0, 0.2);
  opacity: 0.6;
  transition: all 0.3s;
}

.layer-item.accessible {
  opacity: 1;
  border-color: #006699;
}

.layer-item.current {
  background: rgba(0, 150, 255, 0.3);
  border-color: #00d4ff;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
}

.layer-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.layer-name {
  color: #66aaff;
  font-weight: bold;
}

.layer-range {
  color: #aaa;
  font-size: 0.9rem;
}

.layer-features {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

.feature-tag {
  padding: 2px 6px;
  background: rgba(0, 212, 255, 0.2);
  color: #66aaff;
  border-radius: 3px;
  font-size: 0.7rem;
  border: 1px solid rgba(0, 212, 255, 0.3);
}
</style>