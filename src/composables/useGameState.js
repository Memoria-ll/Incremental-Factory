// src/composables/useGameState.js
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

// src/composables/useResourceSystem.js
import { computed } from 'vue'

export function useResourceSystem(gameState) {
  const resourceCategories = computed(() => ({
    raw: ['soil', 'rocks', 'iron_ore', 'copper_ore', 'rare_ore'],
    processed: ['iron', 'copper', 'steel', 'alloys'],
    manufactured: ['wire', 'circuits', 'components', 'machinery'],
    utility: ['energy', 'fuel', 'coolant']
  }))
  
  const updateResources = (updateData) => {
    switch (updateData.type) {
      case 'mine':
        mineResource(updateData.resource, updateData.amount)
        break
      case 'smelt':
        smeltResource(updateData.input, updateData.output, updateData.efficiency)
        break
      case 'manufacture':
        manufactureItem(updateData.recipe, updateData.quantity)
        break
      case 'consume':
        consumeResource(updateData.resource, updateData.amount)
        break
    }
  }
  
  const mineResource = (resource, amount) => {
    const efficiency = gameState.efficiency / 100
    const actualAmount = Math.floor(amount * efficiency)
    gameState.resources[resource] += actualAmount
    
    // セレスの意思による効率化
    if (gameState.celestialWill > 0) {
      const bonus = Math.floor(actualAmount * 0.1)
      gameState.resources[resource] += bonus
    }
  }
  
  const smeltResource = (input, output, efficiency = 100) => {
    const inputResource = input.resource
    const inputAmount = input.amount
    const outputResource = output.resource
    const outputAmount = output.amount
    
    if (gameState.resources[inputResource] >= inputAmount) {
      gameState.resources[inputResource] -= inputAmount
      
      const actualOutput = Math.floor(outputAmount * (efficiency / 100))
      gameState.resources[outputResource] += actualOutput
      
      // エネルギー消費
      consumeResource('energy', Math.floor(inputAmount / 10))
    }
  }
  
  const manufactureItem = (recipe, quantity = 1) => {
    const canManufacture = Object.entries(recipe.inputs).every(
      ([resource, amount]) => gameState.resources[resource] >= amount * quantity
    )
    
    if (canManufacture) {
      // 材料消費
      Object.entries(recipe.inputs).forEach(([resource, amount]) => {
        gameState.resources[resource] -= amount * quantity
      })
      
      // 製品生産
      Object.entries(recipe.outputs).forEach(([resource, amount]) => {
        gameState.resources[resource] += amount * quantity
      })
      
      // エネルギー消費
      consumeResource('energy', recipe.energyCost || 1)
    }
  }
  
  const consumeResource = (resource, amount) => {
    gameState.resources[resource] = Math.max(0, gameState.resources[resource] - amount)
  }
  
  const getResourceBalance = (resource) => {
    // リソースの生産率と消費率の計算
    return {
      production: calculateProductionRate(resource),
      consumption: calculateConsumptionRate(resource),
      net: calculateNetRate(resource)
    }
  }
  
  const calculateProductionRate = (resource) => {
    // 生産率計算ロジック
    let baseRate = 0
    
    if (gameState.upgrades.auto_mining && ['iron_ore', 'copper_ore'].includes(resource)) {
      baseRate += 0.5
    }
    
    return baseRate
  }
  
  const calculateConsumptionRate = (resource) => {
    // 消費率計算ロジック
    let baseRate = 0
    
    if (resource === 'energy') {
      baseRate += 0.1 // 基本的なエネルギー消費
    }
    
    return baseRate
  }
  
  const calculateNetRate = (resource) => {
    return calculateProductionRate(resource) - calculateConsumptionRate(resource)
  }
  
  return {
    resourceCategories,
    updateResources,
    getResourceBalance,
    calculateProductionRate,
    calculateConsumptionRate
  }
}

// src/composables/useCelestialWill.js
import { CelestialWillSystem } from '../systems/celestial-will.js'

export function useCelestialWill(gameState) {
  const celestialWillSystem = new CelestialWillSystem()
  
  // ゲーム状態とセレスの意思システムの同期
  const syncWithGameState = () => {
    celestialWillSystem.amount = gameState.celestialWill
  }
  
  const updateGameStateFromSystem = () => {
    gameState.celestialWill = celestialWillSystem.amount
  }
  
  const gainCelestialWill = (amount, reason = 'task_completion') => {
    celestialWillSystem.gain(amount)
    updateGameStateFromSystem()
    
    // 獲得理由のログ記録
    logCelestialWillActivity(amount, reason)
  }
  
  const spendCelestialWill = (amount, purpose = 'upgrade') => {
    if (celestialWillSystem.spend(amount)) {
      updateGameStateFromSystem()
      logCelestialWillActivity(-amount, purpose)
      return true
    }
    return false
  }
  
  const optimizeResources = () => {
    const removed = celestialWillSystem.optimizeResources(
      gameState.resources,
      gameState.currentTask?.requirements || {}
    )
    
    if (removed > 0) {
      logOptimizationActivity(removed)
    }
    
    return removed
  }
  
  const logCelestialWillActivity = (amount, reason) => {
    if (!gameState.celestialWillLog) {
      gameState.celestialWillLog = []
    }
    
    gameState.celestialWillLog.push({
      timestamp: Date.now(),
      amount,
      reason,
      total: celestialWillSystem.amount
    })
    
    // ログサイズ制限
    if (gameState.celestialWillLog.length > 100) {
      gameState.celestialWillLog.shift()
    }
  }
  
  const logOptimizationActivity = (removedCount) => {
    if (!gameState.optimizationLog) {
      gameState.optimizationLog = []
    }
    
    gameState.optimizationLog.push({
      timestamp: Date.now(),
      removedCount,
      totalRemoved: celestialWillSystem.removedCount
    })
    
    // ログサイズ制限
    if (gameState.optimizationLog.length > 50) {
      gameState.optimizationLog.shift()
    }
  }
  
  const getCelestialWillSummary = () => {
    return {
      current: celestialWillSystem.amount,
      totalRemoved: celestialWillSystem.removedCount,
      recentActivity: gameState.celestialWillLog?.slice(-10) || [],
      recentOptimizations: gameState.optimizationLog?.slice(-5) || []
    }
  }
  
  return {
    celestialWillSystem,
    gainCelestialWill,
    spendCelestialWill,
    optimizeResources,
    getCelestialWillSummary,
    syncWithGameState,
    updateGameStateFromSystem
  }
}

// src/composables/useTaskSystem.js
import { ref, computed } from 'vue'

export function useTaskSystem(gameState) {
  const taskTemplates = [
    {
      name: "基礎研究所建設",
      requirements: { iron: 20, copper: 10, wire: 5 },
      reward: 100,
      difficulty: 1
    },
    {
      name: "電力システム構築",
      requirements: { iron: 30, copper: 20, wire: 10, energy: 50 },
      reward: 150,
      difficulty: 1.2
    },
    {
      name: "採掘装置改良",
      requirements: { iron: 50, copper: 30, components: 5 },
      reward: 200,
      difficulty: 1.5
    },
    {
      name: "精錬設備建設",
      requirements: { iron: 40, copper: 60, circuits: 8 },
      reward: 250,
      difficulty: 1.8
    }
  ]
  
  const generateTask = (week = 1) => {
    const template = taskTemplates[Math.floor(Math.random() * taskTemplates.length)]
    const difficultyMultiplier = Math.pow(1.2, Math.floor(week / 4))
    
    const newTask = {
      name: `${template.name} (Week ${week})`,
      requirements: {},
      reward: Math.floor(template.reward * difficultyMultiplier),
      difficulty: template.difficulty * difficultyMultiplier,
      deadline: 5, // 金曜日まで
      startWeek: week
    }
    
    // 要求量の難易度調整
    Object.entries(template.requirements).forEach(([resource, amount]) => {
      newTask.requirements[resource] = Math.floor(amount * difficultyMultiplier)
    })
    
    return newTask
  }
  
  const checkTaskCompletion = (task, resources) => {
    return Object.entries(task.requirements).every(
      ([resource, required]) => resources[resource] >= required
    )
  }
  
  const completeTask = (task, resources) => {
    if (checkTaskCompletion(task, resources)) {
      // リソース消費
      Object.entries(task.requirements).forEach(([resource, required]) => {
        resources[resource] -= required
      })
      
      return {
        success: true,
        reward: task.reward,
        bonusMultiplier: calculateBonusMultiplier(task)
      }
    }
    
    return { success: false }
  }
  
  const calculateBonusMultiplier = (task) => {
    const currentDay = (gameState.currentWeek - task.startWeek) * 5 + getCurrentDayOfWeek()
    const remainingDays = task.deadline - currentDay
    
    if (remainingDays >= 3) return 1.5 // 早期完了ボーナス
    if (remainingDays >= 1) return 1.2 // 標準ボーナス
    return 1.0 // 期限ギリギリ
  }
  
  const getCurrentDayOfWeek = () => {
    // 0: 月曜, 4: 金曜
    return Math.floor(gameState.gameTime / 86400) % 5
  }
  
  const getTaskProgress = (task, resources) => {
    const progress = {}
    let totalProgress = 0
    const requirementCount = Object.keys(task.requirements).length
    
    Object.entries(task.requirements).forEach(([resource, required]) => {
      const current = resources[resource] || 0
      const percentage = Math.min(100, (current / required) * 100)
      progress[resource] = {
        current,
        required,
        percentage
      }
      totalProgress += percentage
    })
    
    return {
      byResource: progress,
      overall: totalProgress / requirementCount
    }
  }
  
  return {
    taskTemplates,
    generateTask,
    checkTaskCompletion,
    completeTask,
    getTaskProgress,
    getCurrentDayOfWeek
  }
}