import { reactive } from 'vue'

export function useGameState() {
  const gameState = reactive({
    // 基本ゲーム状態
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
      
      // エネルギー・ユーティリティ
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
      },
      deadline: 5,
      difficulty: 1
    },
    weeklyQuotas: [
      { name: '鉄生産', current: 0, target: 100 },
      { name: '銅生産', current: 0, target: 50 }
    ],
    
    // アップグレード
    upgrades: {
      mining_speed: false,
      auto_mining: false,
      smelting_efficiency: false,
      automation_level: 0
    },
    
    // メトリクス
    metrics: {
      production: 100,
      automation: 0,
      quality: 100,
      speed: 100
    },
    
    // トレンドデータ
    trends: []
  })
  
  const updateGameState = (path, value) => {
    const keys = path.split('.')
    let current = gameState
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
  }
  
  return {
    gameState,
    updateGameState
  }
}
