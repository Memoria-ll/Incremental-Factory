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
