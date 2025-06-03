export class ResourceSystem {
  constructor(gameState) {
    this.gameState = gameState
  }
  
  updateResource(resource, amount, operation = 'add') {
    if (operation === 'add') {
      this.gameState.resources[resource] += amount
    } else if (operation === 'subtract') {
      this.gameState.resources[resource] = Math.max(0, this.gameState.resources[resource] - amount)
    } else if (operation === 'set') {
      this.gameState.resources[resource] = amount
    }
  }
  
  canAfford(costs) {
    return Object.entries(costs).every(([resource, cost]) => 
      this.gameState.resources[resource] >= cost
    )
  }
  
  consumeResources(costs) {
    if (this.canAfford(costs)) {
      Object.entries(costs).forEach(([resource, cost]) => {
        this.updateResource(resource, cost, 'subtract')
      })
      return true
    }
    return false
  }
}