<!-- src/App.vue - 構造化版 -->
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
    
    <!-- モーダルオーバーレイ（将来の拡張用） -->
    <div v-if="showModal" class="overlay">
      <div class="dialog">
        <!-- モーダルコンテンツ -->
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import GameHeader from './components/layout/GameHeader.vue'
import GameSidebar from './components/layout/GameSidebar.vue'
import MainContent from './components/layout/MainContent.vue'
import GameFooter from './components/layout/GameFooter.vue'
import { useGameState } from './composables/useGameState.js'
import { useResourceSystem } from './composables/useResourceSystem.js'
import { useCelestialWill } from './composables/useCelestialWill.js'

export default {
  name: 'SelenianLegacy',
  components: {
    GameHeader,
    GameSidebar,
    MainContent,
    GameFooter
  },
  setup() {
    // Composablesを使用した状態管理
    const { gameState, updateGameState } = useGameState()
    const { updateResources } = useResourceSystem(gameState)
    const { celestialWillSystem } = useCelestialWill(gameState)
    
    // UI状態
    const activeTab = ref('drilling')
    const showModal = ref(false)
    
    // 計算プロパティ
    const showDepthSelector = computed(() => {
      return activeTab.value === 'drilling'
    })
    
    const availableDepths = computed(() => {
      return [
        { level: 50, name: '表土層', range: '0-100m', locked: false },
        { level: 150, name: '岩盤層', range: '100-1000m', locked: gameState.maxDepth < 150 },
        { level: 300, name: '地下水層', range: '1000-3000m', locked: gameState.maxDepth < 300 },
        { level: 500, name: '熱水層', range: '3000-6000m', locked: gameState.maxDepth < 500 }
      ]
    })
    
    const availableUpgrades = computed(() => {
      return [
        {
          id: 'mining_speed',
          name: '採掘効率向上',
          description: '採掘速度が50%向上します',
          cost: 250,
          purchased: gameState.upgrades?.mining_speed || false
        },
        {
          id: 'auto_mining',
          name: '自動採掘システム',
          description: '少量の自動採掘を開始します',
          cost: 500,
          purchased: gameState.upgrades?.auto_mining || false
        }
      ]
    })
    
    // メソッド
    const selectTab = (tabId) => {
      activeTab.value = tabId
    }
    
    const selectDepth = (depth) => {
      if (depth <= gameState.maxDepth) {
        updateGameState('currentDepth', depth)
        // 深度変更時の温度計算
        updateGameState('temperature', 15 + (depth * 0.025))
      }
    }
    
    const handleResourceUpdate = (updateData) => {
      updateResources(updateData)
    }
    
    const handleTaskComplete = (task) => {
      // タスク完了処理
      const reward = celestialWillSystem.calculateTaskReward(
        gameState.currentWeek,
        task.difficulty || 1
      )
      
      updateGameState('celestialWill', gameState.celestialWill + reward)
      updateGameState('currentWeek', gameState.currentWeek + 1)
      
      // 新しいタスク生成
      generateNewTask()
    }
    
    const handleUpgradePurchase = (upgrade) => {
      if (gameState.celestialWill >= upgrade.cost) {
        updateGameState('celestialWill', gameState.celestialWill - upgrade.cost)
        updateGameState(`upgrades.${upgrade.id}`, true)
        
        // アップグレード効果の適用
        applyUpgradeEffects(upgrade)
      }
    }
    
    const generateNewTask = () => {
      // タスク生成ロジック（後で実装）
    }
    
    const applyUpgradeEffects = (upgrade) => {
      switch (upgrade.id) {
        case 'mining_speed':
          updateGameState('efficiency', gameState.efficiency * 1.5)
          break
        case 'auto_mining':
          // 自動採掘システム開始
          break
      }
    }
    
    // セーブ・ロード
    const saveGame = () => {
      const saveData = {
        gameState: { ...gameState },
        activeTab: activeTab.value,
        timestamp: Date.now()
      }
      
      localStorage.setItem('selenian-legacy-structured', JSON.stringify(saveData))
    }
    
    const loadGame = () => {
      const saveData = localStorage.getItem('selenian-legacy-structured')
      if (saveData) {
        try {
          const data = JSON.parse(saveData)
          Object.assign(gameState, data.gameState)
          activeTab.value = data.activeTab || 'drilling'
        } catch (e) {
          console.error('セーブデータの読み込みに失敗:', e)
        }
      }
    }
    
    // ゲームループ
    let gameInterval
    let celestialInterval
    
    onMounted(() => {
      // セーブデータの自動ロード
      loadGame()
      
      // ゲーム時間の更新（1秒間隔）
      gameInterval = setInterval(() => {
        updateGameState('gameTime', gameState.gameTime + 1)
      }, 1000)
      
      // セレスの意思システム（3秒間隔）
      celestialInterval = setInterval(() => {
        celestialWillSystem.optimizeResources(
          gameState.resources,
          gameState.currentTask?.requirements || {}
        )
      }, 3000)
      
      // 自動セーブ（30秒間隔）
      setInterval(saveGame, 30000)
    })
    
    onUnmounted(() => {
      if (gameInterval) clearInterval(gameInterval)
      if (celestialInterval) clearInterval(celestialInterval)
      saveGame() // 終了時にセーブ
    })
    
    return {
      gameState,
      activeTab,
      showModal,
      showDepthSelector,
      availableDepths,
      availableUpgrades,
      selectTab,
      selectDepth,
      handleResourceUpdate,
      handleTaskComplete,
      handleUpgradePurchase,
      saveGame,
      loadGame
    }
  }
}
</script>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  color: #e0e0e0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* レスポンシブ対応 */
@media (max-width: 1024px) {
  .main-layout {
    flex-direction: column;
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  padding: 30px;
  border-radius: 15px;
  border: 2px solid #00d4ff;
  max-width: 80%;
  max-height: 80%;
  overflow-y: auto;
}
</style>