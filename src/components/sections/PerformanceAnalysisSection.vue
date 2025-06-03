<template>
  <div class="content-card performance-analysis-section">
    <h3 class="card-title">パフォーマンス分析</h3>
    
    <div class="efficiency-metrics">
      <h4>効率指標</h4>
      <div class="metrics-grid">
        <div class="metric-item" v-for="(value, metric) in efficiencyMetrics" :key="metric">
          <div class="metric-header">
            <span class="metric-name">{{ getMetricName(metric) }}</span>
            <span class="metric-value" :class="getMetricClass(value)">{{ value }}%</span>
          </div>
          <div class="metric-bar">
            <div 
              class="metric-fill" 
              :style="{ 
                width: value + '%',
                background: getMetricColor(value)
              }"
            ></div>
          </div>
          <div class="metric-trend">
            <span :class="getTrendClass(metric)">
              {{ getTrendText(metric) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="trend-analysis" v-if="trendData.length > 0">
      <h4>トレンド分析</h4>
      <div class="trend-chart">
        <div class="chart-container">
          <div 
            v-for="(data, index) in recentTrends" 
            :key="index"
            class="chart-bar"
            :style="{ height: data.efficiency + '%' }"
          >
            <div class="bar-label">W{{ data.week }}</div>
          </div>
        </div>
      </div>
      <div class="trend-summary">
        <span>週平均効率: {{ averageEfficiency }}%</span>
        <span>改善率: {{ improvementRate }}%</span>
      </div>
    </div>
    
    <div class="recommendations" v-if="recommendations.length > 0">
      <h4>最適化提案</h4>
      <div class="recommendations-list">
        <div 
          v-for="recommendation in recommendations" 
          :key="recommendation.id"
          class="recommendation-item"
          :class="recommendation.priority"
        >
          <div class="rec-header">
            <span class="rec-title">{{ recommendation.title }}</span>
            <span class="rec-priority">{{ recommendation.priority }}</span>
          </div>
          <p class="rec-description">{{ recommendation.description }}</p>
          <div class="rec-impact">
            期待効果: <span class="impact-value">{{ recommendation.expectedImprovement }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'PerformanceAnalysisSection',
  props: {
    efficiencyMetrics: { type: Object, required: true },
    trendData: { type: Array, default: () => [] },
    recommendations: { type: Array, default: () => [] }
  },
  setup(props) {
    const metricNames = {
      production: '生産効率',
      automation: '自動化率',
      quality: '品質指標',
      speed: '処理速度',
      energy: 'エネルギー効率',
      waste: '廃棄物削減'
    }
    
    const recentTrends = computed(() => {
      return props.trendData.slice(-10)
    })
    
    const averageEfficiency = computed(() => {
      if (recentTrends.value.length === 0) return 0
      const sum = recentTrends.value.reduce((acc, data) => acc + data.efficiency, 0)
      return Math.floor(sum / recentTrends.value.length)
    })
    
    const improvementRate = computed(() => {
      if (recentTrends.value.length < 2) return 0
      const first = recentTrends.value[0].efficiency
      const last = recentTrends.value[recentTrends.value.length - 1].efficiency
      return Math.floor(((last - first) / first) * 100)
    })
    
    const getMetricName = (metric) => {
      return metricNames[metric] || metric
    }
    
    const getMetricClass = (value) => {
      if (value >= 90) return 'excellent'
      if (value >= 70) return 'good'
      if (value >= 50) return 'average'
      return 'poor'
    }
    
    const getMetricColor = (value) => {
      if (value >= 90) return 'linear-gradient(90deg, #00cc66, #00ff88)'
      if (value >= 70) return 'linear-gradient(90deg, #66cc00, #88ff00)'
      if (value >= 50) return 'linear-gradient(90deg, #ffaa00, #ffcc00)'
      return 'linear-gradient(90deg, #ff6600, #ff8800)'
    }
    
    const getTrendClass = (metric) => {
      // TODO: 実際のトレンド計算
      return 'trend-up'
    }
    
    const getTrendText = (metric) => {
      // TODO: 実際のトレンド計算
      return '↗ +2.3%'
    }
    
    return {
      recentTrends,
      averageEfficiency,
      improvementRate,
      getMetricName,
      getMetricClass,
      getMetricColor,
      getTrendClass,
      getTrendText
    }
  }
}
</script>

<style scoped>
.performance-analysis-section {
  margin-bottom: 20px;
}

.efficiency-metrics,
.trend-analysis,
.recommendations {
  margin-bottom: 25px;
}

.efficiency-metrics h4,
.trend-analysis h4,
.recommendations h4 {
  color: #00d4ff;
  margin-bottom: 15px;
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.metric-item {
  padding: 15px;
  background: rgba(0, 100, 200, 0.1);
  border-radius: 8px;
  border: 1px solid #006699;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.metric-name {
  color: #66aaff;
  font-weight: bold;
}

.metric-value {
  font-weight: bold;
  font-size: 1.2rem;
}

.metric-value.excellent { color: #00cc66; }
.metric-value.good { color: #66cc00; }
.metric-value.average { color: #ffaa00; }
.metric-value.poor { color: #ff6600; }

.metric-bar {
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.metric-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.metric-trend {
  text-align: right;
  font-size: 0.8rem;
}

.trend-up { color: #00cc66; }
.trend-down { color: #ff6666; }
.trend-stable { color: #aaa; }

.trend-chart {
  margin-bottom: 15px;
}

.chart-container {
  display: flex;
  align-items: end;
  gap: 8px;
  height: 100px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, #00d4ff, #0066cc);
  border-radius: 2px;
  position: relative;
  min-height: 10px;
  transition: height 0.3s ease;
}

.bar-label {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: #aaa;
}

.trend-summary {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #ccc;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommendation-item {
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid;
}

.recommendation-item.high {
  background: rgba(255, 0, 0, 0.1);
  border-left-color: #ff0000;
}

.recommendation-item.medium {
  background: rgba(255, 165, 0, 0.1);
  border-left-color: #ffaa00;
}

.recommendation-item.low {
  background: rgba(0, 255, 0, 0.1);
  border-left-color: #00cc66;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.rec-title {
  color: #fff;
  font-weight: bold;
}

.rec-priority {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.recommendation-item.high .rec-priority {
  background: #ff0000;
  color: white;
}

.recommendation-item.medium .rec-priority {
  background: #ffaa00;
  color: white;
}

.recommendation-item.low .rec-priority {
  background: #00cc66;
  color: white;
}

.rec-description {
  color: #ccc;
  margin-bottom: 8px;
  line-height: 1.4;
}

.rec-impact {
  color: #aaa;
  font-size: 0.9rem;
}

.impact-value {
  color: #00cc66;
  font-weight: bold;
}
</style>
