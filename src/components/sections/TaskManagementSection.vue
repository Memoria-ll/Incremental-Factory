<template>
  <div class="content-card task-management-section">
    <h3 class="card-title">タスク管理</h3>
    
    <div class="current-task">
      <h4>今週のタスク</h4>
      <div class="task-card">
        <div class="task-header">
          <span class="task-name">{{ currentTask.name }}</span>
          <span class="task-deadline">期限: 金曜日</span>
        </div>
        
        <div class="task-requirements">
          <div 
            v-for="(required, resource) in currentTask.requirements" 
            :key="resource"
            class="requirement-item"
          >
            <span class="req-resource">{{ getResourceName(resource) }}</span>
            <div class="req-progress">
              <span class="req-amounts">{{ getResourceAmount(resource) }} / {{ required }}</span>
              <div class="req-bar">
                <div 
                  class="req-fill" 
                  :style="{ width: getProgressPercentage(resource, required) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="task-actions">
          <button 
            @click="completeTask"
            :disabled="!canCompleteTask"
            class="complete-btn"
          >
            {{ canCompleteTask ? 'タスク完了' : '素材不足' }}
          </button>
          <div class="completion-rate">
            完了率: {{ overallProgress.toFixed(1) }}%
          </div>
        </div>
      </div>
    </div>
    
    <div class="weekly-quotas" v-if="weeklyQuotas.length > 0">
      <h4>週次クォータ</h4>
      <div class="quota-list">
        <div 
          v-for="quota in weeklyQuotas" 
          :key="quota.name"
          class="quota-item"
        >
          <span class="quota-name">{{ quota.name }}</span>
          <div class="quota-progress">
            <span class="quota-amounts">{{ quota.current }} / {{ quota.target }}</span>
            <div class="quota-bar">
              <div 
                class="quota-fill" 
                :style="{ width: Math.min(100, (quota.current / quota.target) * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="completion-stats">
      <h4>完了統計</h4>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">今週完了率:</span>
          <span class="stat-value">{{ completionRate.toFixed(1) }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均完了時間:</span>
          <span class="stat-value">{{ averageCompletionTime }}日</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">連続成功:</span>
          <span class="stat-value">{{ consecutiveSuccess }}回</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'TaskManagementSection',
  props: {
    currentTask: { type: Object, required: true },
    weeklyQuotas: { type: Array, default: () => [] },
    completionRate: { type: Number, default: 0 },
    resources: { type: Object, default: () => ({}) }
  },
  emits: ['complete-task'],
  setup(props, { emit }) {
    const resourceNames = {
      iron: '鉄',
      copper: '銅',
      wire: '配線',
      circuits: '回路',
      components: '部品',
      energy: 'エネルギー'
    }
    
    const canCompleteTask = computed(() => {
      return Object.entries(props.currentTask.requirements || {}).every(
        ([resource, required]) => getResourceAmount(resource) >= required
      )
    })
    
    const overallProgress = computed(() => {
      const requirements = Object.entries(props.currentTask.requirements || {})
      if (requirements.length === 0) return 0
      
      const totalProgress = requirements.reduce((sum, [resource, required]) => {
        return sum + Math.min(100, (getResourceAmount(resource) / required) * 100)
      }, 0)
      
      return totalProgress / requirements.length
    })
    
    const averageCompletionTime = computed(() => {
      // TODO: 実際の統計データから計算
      return 3.2
    })
    
    const consecutiveSuccess = computed(() => {
      // TODO: 実際の成功回数データから計算
      return 5
    })
    
    const getResourceName = (resource) => {
      return resourceNames[resource] || resource
    }
    
    const getResourceAmount = (resource) => {
      return props.resources[resource] || 0
    }
    
    const getProgressPercentage = (resource, required) => {
      return Math.min(100, (getResourceAmount(resource) / required) * 100)
    }
    
    const completeTask = () => {
      if (canCompleteTask.value) {
        emit('complete-task', props.currentTask)
      }
    }
    
    return {
      canCompleteTask,
      overallProgress,
      averageCompletionTime,
      consecutiveSuccess,
      getResourceName,
      getResourceAmount,
      getProgressPercentage,
      completeTask
    }
  }
}
</script>

<style scoped>
.task-management-section {
  margin-bottom: 20px;
}

.current-task {
  margin-bottom: 25px;
}

.current-task h4,
.weekly-quotas h4,
.completion-stats h4 {
  color: #00d4ff;
  margin-bottom: 15px;
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
}

.task-card {
  padding: 20px;
  background: rgba(100, 50, 0, 0.2);
  border-radius: 8px;
  border: 1px solid #664400;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.task-name {
  color: #ffaa00;
  font-weight: bold;
  font-size: 1.1rem;
}

.task-deadline {
  color: #ff6666;
  font-size: 0.9rem;
}

.task-requirements {
  margin-bottom: 20px;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 12px;
}

.req-resource {
  min-width: 80px;
  color: #ccc;
  font-weight: bold;
}

.req-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.req-amounts {
  min-width: 100px;
  color: #fff;
  font-size: 0.9rem;
}

.req-bar {
  flex: 1;
  height: 12px;
  background: #333;
  border-radius: 6px;
  overflow: hidden;
}

.req-fill {
  height: 100%;
  background: linear-gradient(90deg, #00cc66, #00d4ff);
  transition: width 0.3s ease;
}

.task-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.complete-btn {
  padding: 12px 24px;
  background: #00cc66;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
  font-weight: bold;
}

.complete-btn:hover:not(:disabled) {
  background: #00aa55;
}

.complete-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.completion-rate {
  color: #00d4ff;
  font-weight: bold;
}

.weekly-quotas {
  margin-bottom: 25px;
}

.quota-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quota-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

.quota-name {
  min-width: 100px;
  color: #aaa;
}

.quota-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.quota-amounts {
  min-width: 80px;
  color: #fff;
  font-size: 0.9rem;
}

.quota-bar {
  flex: 1;
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
}

.quota-fill {
  height: 100%;
  background: linear-gradient(90deg, #00cc66, #00d4ff);
  transition: width 0.3s ease;
}

.completion-stats {
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
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
  color: #00cc66;
  font-weight: bold;
}
</style>
