// src/systems/celestial-will.js
// セレスの意思システム - 自動最適化とアップグレード管理

export class CelestialWillSystem {
  constructor() {
    this.amount = 0
    this.removedCount = 0
    this.lastOptimizationTime = Date.now()
  }

  // セレスの意思を獲得
  gain(amount) {
    this.amount += amount
    return this.amount
  }

  // セレスの意思を消費
  spend(amount) {
    if (this.amount >= amount) {
      this.amount -= amount
      return true
    }
    return false
  }

  // 余剰リソースの自動最適化
  optimizeResources(resources, taskRequirements) {
    const now = Date.now()
    if (now - this.lastOptimizationTime < 3000) return // 3秒間隔

    let totalRemoved = 0

    Object.keys(resources).forEach(resource => {
      const required = taskRequirements[resource] || 0
      const current = resources[resource]
      const excess = current - required

      if (excess > 100) {
        // 大量の余剰は急速に最適化
        const toRemove = Math.floor(excess * 0.15)
        resources[resource] -= toRemove
        totalRemoved += toRemove
      } else if (excess > 50) {
        // 中程度の余剰は緩やかに最適化
        const toRemove = Math.floor(excess * 0.05)
        resources[resource] -= toRemove
        totalRemoved += toRemove
      }
    })

    this.removedCount += totalRemoved
    this.lastOptimizationTime = now

    return totalRemoved
  }

  // 週次タスク完了時の報酬計算
  calculateTaskReward(week, difficulty = 1, bonusFactors = {}) {
    const baseReward = 100
    const weekMultiplier = Math.floor(week / 4) + 1
    const difficultyMultiplier = difficulty
    
    let totalMultiplier = weekMultiplier * difficultyMultiplier

    // ボーナス要素の適用
    if (bonusFactors.earlyCompletion) {
      totalMultiplier *= 1.5
    }
    if (bonusFactors.perfectExecution) {
      totalMultiplier *= 2.0
    }
    if (bonusFactors.depthBonus) {
      totalMultiplier *= (1 + bonusFactors.depthBonus / 1000)
    }

    return Math.floor(baseReward * totalMultiplier)
  }

  // アップグレード効果の計算
  calculateUpgradeCost(baseUpgrade, purchasedCount = 0) {
    const baseCost = baseUpgrade.baseCost || 100
    const costMultiplier = baseUpgrade.costMultiplier || 1.5
    
    return Math.floor(baseCost * Math.pow(costMultiplier, purchasedCount))
  }

  // セーブデータ用のシリアライズ
  serialize() {
    return {
      amount: this.amount,
      removedCount: this.removedCount,
      lastOptimizationTime: this.lastOptimizationTime
    }
  }

  // セーブデータからの復元
  deserialize(data) {
    this.amount = data.amount || 0
    this.removedCount = data.removedCount || 0
    this.lastOptimizationTime = data.lastOptimizationTime || Date.now()
  }

  // デバッグ用情報
  getDebugInfo() {
    return {
      currentAmount: this.amount,
      totalRemoved: this.removedCount,
      optimizationInterval: Date.now() - this.lastOptimizationTime
    }
  }
}

// セレスの意思のメッセージシステム
export class CelestialMessages {
  constructor() {
    this.messageHistory = []
    this.discoveryLevel = 0
  }

  // 発見段階に応じたメッセージ
  getDiscoveryMessage(level) {
    const messages = {
      0: "何かが余剰品を自動的に整理している...",
      1: "効率的な生産を促す未知の力を感じる",
      2: "古代の意思がプロジェクトを導いているようだ",
      3: "セレニアン族の遺志が我々を支援している",
      4: "セレスの意思として知られる支援システムが稼働中"
    }

    return messages[Math.min(level, 4)] || messages[4]
  }

  // 最適化実行時のメッセージ
  getOptimizationMessage(removedCount) {
    if (removedCount > 100) {
      return `セレスの意思により大量の余剰リソース(${removedCount}個)が最適化されました`
    } else if (removedCount > 50) {
      return `効率化のため${removedCount}個のアイテムが整理されました`
    } else if (removedCount > 0) {
      return `${removedCount}個の不要なアイテムが自動的に処理されました`
    }
    return null
  }

  // アップグレード購入時のメッセージ
  getUpgradeMessage(upgradeName) {
    const messages = {
      mining_speed: "採掘システムの効率が向上しました",
      auto_mining: "自動採掘システムが起動しました",
      smelting_efficiency: "精錬プロセスが最適化されました",
      depth_drilling: "より深い層への到達が可能になりました"
    }

    return messages[upgradeName] || "新しい技術が習得されました"
  }
}