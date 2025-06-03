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
