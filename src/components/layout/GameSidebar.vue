<template>
  <aside class="sidebar">
    <div class="phase-section">
      <div class="phase-title">生産システム</div>
      <button 
        v-for="tab in productionTabs" 
        :key="tab.id"
        @click="$emit('selectTab', tab.id)"
        :class="['tab', { active: activeTab === tab.id, disabled: tab.disabled }]"
      >
        {{ tab.name }}
      </button>
    </div>
    
    <div class="phase-section">
      <div class="phase-title">管理システム</div>
      <button 
        v-for="tab in managementTabs" 
        :key="tab.id"
        @click="$emit('selectTab', tab.id)"
        :class="['tab', { active: activeTab === tab.id, disabled: tab.disabled }]"
      >
        {{ tab.name }}
      </button>
    </div>
  </aside>
</template>

<script>
export default {
  name: 'GameSidebar',
  props: {
    activeTab: { type: String, required: true }
  },
  emits: ['selectTab'],
  data() {
    return {
      productionTabs: [
        { id: 'drilling', name: '掘削・分離', disabled: false },
        { id: 'smelting', name: '精錬', disabled: false },
        { id: 'manufacturing', name: '製造', disabled: false },
        { id: 'power', name: '電力・設備', disabled: false }
      ],
      managementTabs: [
        { id: 'efficiency', name: '効率管理', disabled: false },
        { id: 'research', name: '研究開発', disabled: true },
        { id: 'spacetime', name: '時空技術', disabled: true },
        { id: 'laws', name: '法則制御', disabled: true },
        { id: 'creation', name: '創造設計', disabled: true }
      ]
    }
  }
}
</script>
