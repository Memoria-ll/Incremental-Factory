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
