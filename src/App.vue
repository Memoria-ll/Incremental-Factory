<template>
  <div id="app">
    <header class="header">
      <h1>セレニアンの遺産</h1>
      <div class="status">
        <span>セレスの意思: {{ celestialWill }}</span>
        <span>週: {{ currentWeek }}</span>
      </div>
    </header>

    <main class="main">
      <section class="task-section">
        <h2>今週のタスク</h2>
        <div class="task-card">
          <h3>{{ currentTask.name }}</h3>
          <div class="requirements">
            <div v-for="(required, resource) in currentTask.requirements" :key="resource">
              {{ resource }}: {{ resources[resource] }} / {{ required }}
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: Math.min(100, (resources[resource] / required) * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
          <button 
            @click="completeTask" 
            :disabled="!canCompleteTask"
            class="complete-btn"
          >
            タスク完了
          </button>
        </div>
      </section>

      <section class="production-section">
        <h2>生産システム</h2>
        <div class="resources">
          <div v-for="(amount, resource) in resources" :key="resource" class="resource">
            <span class="resource-name">{{ resource }}</span>
            <span class="resource-amount">{{ amount }}</span>
          </div>
        </div>
        <div class="actions">
          <button @click="mine('iron')" class="action-btn">鉄を採掘</button>
          <button @click="mine('copper')" class="action-btn">銅を採掘</button>
          <button @click="automate" :disabled="celestialWill < 50" class="auto-btn">
            自動化 (50セレスの意思)
          </button>
        </div>
      </section>
    </main>

    <footer class="footer">
      <div class="game-info">
        <span>ゲーム時間: {{ formatTime(gameTime) }}</span>
        <button @click="save" class="save-btn">セーブ</button>
        <button @click="reset" class="reset-btn">リセット</button>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

export default {
  name: 'SelenianLegacy',
  setup() {
    // ゲーム状態
    const celestialWill = ref(0)
    const currentWeek = ref(1)
    const gameTime = ref(0)
    
    const resources = reactive({
      iron: 0,
      copper: 0,
      wire: 0
    })
    
    const currentTask = reactive({
      name: "基礎研究所建設",
      requirements: {
        iron: 20,
        copper: 10,
        wire: 5
      }
    })
    
    // 計算プロパティ
    const canCompleteTask = computed(() => {
      return Object.entries(currentTask.requirements).every(
        ([resource, required]) => resources[resource] >= required
      )
    })
    
    // 方法
    const mine = (resource) => {
      const amount = Math.floor(Math.random() * 5) + 1
      resources[resource] += amount
    }
    
    const automate = () => {
      if (celestialWill.value >= 50) {
        celestialWill.value -= 50
        
        // 30秒間自動採掘
        const automationTime = 30000
        const interval = 500
        let elapsed = 0
        
        const automationInterval = setInterval(() => {
          mine('iron')
          mine('copper')
          elapsed += interval
          
          if (elapsed >= automationTime) {
            clearInterval(automationInterval)
          }
        }, interval)
      }
    }
    
    const completeTask = () => {
      if (canCompleteTask.value) {
        // リソース消費
        Object.entries(currentTask.requirements).forEach(([resource, required]) => {
          resources[resource] -= required
        })
        
        // 報酬
        const reward = 100
        celestialWill.value += reward
        
        // 新しいタスク生成
        generateNewTask()
        currentWeek.value += 1
      }
    }
    
    const generateNewTask = () => {
      const tasks = [
        { 
          name: "電力システム構築", 
          requirements: { iron: 30, copper: 20, wire: 10 } 
        },
        { 
          name: "採掘装置改良", 
          requirements: { iron: 50, copper: 30, wire: 8 } 
        },
        { 
          name: "精錬設備建設", 
          requirements: { iron: 40, copper: 60, wire: 15 } 
        }
      ]
      
      const selectedTask = tasks[Math.floor(Math.random() * tasks.length)]
      Object.assign(currentTask, selectedTask)
    }
    
    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    
    const save = () => {
      const saveData = {
        celestialWill: celestialWill.value,
        currentWeek: currentWeek.value,
        gameTime: gameTime.value,
        resources: { ...resources },
        currentTask: { ...currentTask }
      }
      
      localStorage.setItem('selenian-legacy-save', JSON.stringify(saveData))
      alert('ゲームをセーブしました！')
    }
    
    const reset = () => {
      if (confirm('本当にリセットしますか？')) {
        celestialWill.value = 0
        currentWeek.value = 1
        gameTime.value = 0
        Object.assign(resources, { iron: 0, copper: 0, wire: 0 })
        Object.assign(currentTask, {
          name: "基礎研究所建設",
          requirements: { iron: 20, copper: 10, wire: 5 }
        })
        localStorage.removeItem('selenian-legacy-save')
      }
    }
    
    // セレスの意思による自動調整
    const celestialWillTick = () => {
      // 余剰リソースの段階的消失
      Object.keys(resources).forEach(resource => {
        const required = currentTask.requirements[resource] || 0
        const excess = resources[resource] - required
        
        if (excess > 50) {
          resources[resource] -= Math.floor(excess * 0.1)
        }
      })
    }
    
    // ゲームループ
    let gameInterval
    let celestialInterval
    
    onMounted(() => {
      // 1秒ごとのゲーム時間更新
      gameInterval = setInterval(() => {
        gameTime.value += 1
      }, 1000)
      
      // 3秒ごとのセレスの意思処理
      celestialInterval = setInterval(celestialWillTick, 3000)
    })
    
    onUnmounted(() => {
      if (gameInterval) clearInterval(gameInterval)
      if (celestialInterval) clearInterval(celestialInterval)
    })
    
    return {
      celestialWill,
      currentWeek,
      gameTime,
      resources,
      currentTask,
      canCompleteTask,
      mine,
      automate,
      completeTask,
      formatTime,
      save,
      reset
    }
  }
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: #e0e0e0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid #00d4ff;
  background: rgba(0, 0, 0, 0.2);
}

.header h1 {
  color: #00d4ff;
  margin: 0;
  font-size: 2rem;
}

.status {
  display: flex;
  gap: 20px;
  font-size: 1.1rem;
}

.main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
}

.task-section, .production-section {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #333;
}

.task-section h2, .production-section h2 {
  color: #00d4ff;
  margin-bottom: 15px;
  border-bottom: 1px solid #333;
  padding-bottom: 8px;
}

.task-card {
  background: rgba(100, 50, 0, 0.2);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #664400;
}

.task-card h3 {
  color: #ffaa00;
  margin-bottom: 15px;
}

.requirements > div {
  margin-bottom: 10px;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #333;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 5px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00cc66, #00d4ff);
  transition: width 0.3s ease;
}

.complete-btn {
  width: 100%;
  padding: 12px;
  margin-top: 15px;
  background: #00cc66;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.complete-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.complete-btn:hover:not(:disabled) {
  background: #00aa55;
}

.resources {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 10px;
  margin-bottom: 20px;
}

.resource {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.resource-name {
  font-size: 0.8rem;
  color: #aaa;
  margin-bottom: 5px;
}

.resource-amount {
  font-weight: bold;
  color: #fff;
  font-size: 1.2rem;
}

.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn, .auto-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
  color: white;
  font-weight: bold;
}

.action-btn {
  background: #0066cc;
}

.action-btn:hover {
  background: #0055aa;
}

.auto-btn {
  background: #cc6600;
}

.auto-btn:hover:not(:disabled) {
  background: #aa5500;
}

.auto-btn:disabled {
  background: #666;
  cursor: not-allowed;
}

.footer {
  padding: 15px 20px;
  border-top: 1px solid #333;
  background: rgba(0, 0, 0, 0.2);
}

.game-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.save-btn, .reset-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-left: 10px;
}

.save-btn {
  background: #00cc66;
  color: white;
}

.reset-btn {
  background: #cc6600;
  color: white;
}

.save-btn:hover {
  background: #00aa55;
}

.reset-btn:hover {
  background: #aa5500;
}

@media (max-width: 768px) {
  .main {
    grid-template-columns: 1fr;
  }
  
  .header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .status {
    flex-direction: column;
    gap: 5px;
  }
}
</style>