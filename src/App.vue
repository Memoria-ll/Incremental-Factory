<template>
  <div id="app" class="main-container">
    <GameHeader 
      :celestial-will="gameState.celestialWill"
      :current-week="gameState.currentWeek"
      :current-depth="gameState.currentDepth"
      :temperature="gameState.temperature"
      :show-depth-selector="showDepthSelector"
      :available-depths="availableDepths"
      @select-depth="selectDepth"
    />
    
    <div class="main-layout">
      <GameSidebar 
        :active-tab="activeTab"
        @select-tab="selectTab"
      />
      
      <MainContent 
        :active-tab="activeTab"
        :resources="gameState.resources"
        :celestial-will="gameState.celestialWill"
        :available-upgrades="availableUpgrades"
        :game-state="gameState"
        @update-resources="handleResourceUpdate"
        @task-complete="handleTaskComplete"
        @purchase-upgrade="handleUpgradePurchase"
      />
    </div>
    
    <GameFooter 
      :current-week="gameState.currentWeek"
      :weekly-quotas="gameState.weeklyQuotas"
      :efficiency="gameState.efficiency"
      :power="gameState.power"
      :max-power="gameState.maxPower"
      :cooling="gameState.cooling"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import GameHeader from './components/layout/GameHeader.vue'
import GameSidebar from './components/layout/GameSidebar.vue'
import MainContent from './components/layout/MainContent.vue'
import GameFooter from './components/layout/GameFooter.vue'

export default {
  name: 'SelenianLegacy',
  components: {
    GameHeader,
    GameSidebar,
    MainContent,
    GameFooter
  },
  setup() {
    // ゲーム状態
    const activeTab = ref('drilling')
    
    const gameState = reactive({
      // 基本状態
      currentWeek: 1,
      gameTime: 0,
      celestialWill: 0,
      
      // 深度システム
      currentDepth: 50,
      maxDepth: 100,
      temperature: 15,
      
      // リソース
      resources: {
        // 原材料
        soil: 0,
        rocks: 0,
        sediment: 0,
        iron_ore: 0,
        copper_ore: 0,
        rare_ore: 0,
        
        // 精錬済み
        iron: 0,
        copper: 0,
        steel: 0,
        alloys: 0,
        
        // 製品
        wire: 0,
        circuits: 0,
        components: 0,
        machinery: 0,
        
        // ユーティリティ
        energy: 100,
        fuel: 0,
        coolant: 100
      },
      
      // システム状態
      efficiency: 100,
      power: 0,
      maxPower: 100,
      cooling: 100,
      
      // タスク・クォータ
      currentTask: {
        name: "基礎研究所建設",
        requirements: {
          iron: 20,
          copper: 10,
          wire: 5
        }
      },
      weeklyQuotas: [
        { name: '鉄生産', current: 0, target: 100 },
        { name: '銅生産', current: 0, target: 50 }
      ],
      
      // アップグレード
      upgrades: {
        mining_speed: false,
        auto_mining: false,
        smelting_efficiency: false
      }
    })
    
    // 計算プロパティ
    const showDepthSelector = computed(() => {
      return activeTab.value === 'drilling'
    })
    
    const availableDepths = computed(() => {
      return [
        { level: 50, name: '表土層', range: '0-100m', locked: false },
        { level: 150, name: '岩盤層', range: '100-1000m', locked: gameState.maxDepth < 150 },
        { level: 300, name: '地下水層', range: '1000-3000m', locked: gameState.maxDepth < 300 }
      ]
    })
    
    const availableUpgrades = computed(() => {
      return [
        {
          id: 'mining_speed',
          name: '採掘効率向上',
          description: '採掘速度が50%向上します',
          cost: 250,
          category: 'mining',
          purchased: gameState.upgrades.mining_speed
        },
        {
          id: 'auto_mining',
          name: '自動採掘システム',
          description: '少量の自動採掘を開始します',
          cost: 500,
          category: 'mining',
          purchased: gameState.upgrades.auto_mining
        }
      ]
    })
    
    // メソッド
    const selectTab = (tabId) => {
      activeTab.value = tabId
    }
    
    const selectDepth = (depth) => {
      if (depth <= gameState.maxDepth) {
        gameState.currentDepth = depth
        gameState.temperature = 15 + (depth * 0.025)
      }
    }
    
    const handleResourceUpdate = (updateData) => {
      // リソース更新ロジック
      switch (updateData.type) {
        case 'mine':
          gameState.resources[updateData.resource] += updateData.amount
          break
        case 'smelt':
          // 精錬ロジック
          break
        case 'manufacture':
          // 製造ロジック
          break
      }
    }
    
    const handleTaskComplete = (task) => {
      // タスク完了処理
      const canComplete = Object.entries(task.requirements).every(
        ([resource, required]) => gameState.resources[resource] >= required
      )
      
      if (canComplete) {
        // リソース消費
        Object.entries(task.requirements).forEach(([resource, required]) => {
          gameState.resources[resource] -= required
        })
        
        // 報酬
        gameState.celestialWill += 250
        gameState.currentWeek += 1
        
        // 新しいタスク生成
        generateNewTask()
      }
    }
    
    const handleUpgradePurchase = (upgrade) => {
      if (gameState.celestialWill >= upgrade.cost && !upgrade.purchased) {
        gameState.celestialWill -= upgrade.cost
        gameState.upgrades[upgrade.id] = true
        
        // アップグレード効果の適用
        applyUpgradeEffects(upgrade)
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
        }
      ]
      
      const newTask = tasks[Math.floor(Math.random() * tasks.length)]
      Object.assign(gameState.currentTask, newTask)
    }
    
    const applyUpgradeEffects = (upgrade) => {
      switch (upgrade.id) {
        case 'mining_speed':
          gameState.efficiency = Math.floor(gameState.efficiency * 1.5)
          break
        case 'auto_mining':
          // 自動採掘開始
          break
      }
    }
    
    // セレスの意思による自動最適化
    const celestialWillOptimization = () => {
      Object.keys(gameState.resources).forEach(resource => {
        const required = gameState.currentTask.requirements[resource] || 0
        const current = gameState.resources[resource]
        const excess = current - required
        
        if (excess > 50) {
          gameState.resources[resource] -= Math.floor(excess * 0.1)
        }
      })
    }
    
    // ゲームループ
    let gameInterval
    let optimizationInterval
    
    onMounted(() => {
      // 1秒ごとのゲーム時間更新
      gameInterval = setInterval(() => {
        gameState.gameTime += 1
      }, 1000)
      
      // 3秒ごとのセレスの意思処理
      optimizationInterval = setInterval(celestialWillOptimization, 3000)
    })
    
    onUnmounted(() => {
      if (gameInterval) clearInterval(gameInterval)
      if (optimizationInterval) clearInterval(optimizationInterval)
    })
    
    return {
      activeTab,
      gameState,
      showDepthSelector,
      availableDepths,
      availableUpgrades,
      selectTab,
      selectDepth,
      handleResourceUpdate,
      handleTaskComplete,
      handleUpgradePurchase
    }
  }
}
</script>

<style>
/* App.vue専用スタイル */
#app {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary, linear-gradient(135deg, #1a1a2e, #16213e));
  color: var(--text-primary);
  overflow: hidden;
}

.main-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.main-layout {
  flex: 1;
  display: flex;
  min-height: 0;
}
</style>
