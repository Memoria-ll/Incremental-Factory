<template>
  <aside class="sidebar">
    <div class="phase-section">
      <div class="phase-title">生産システム</div>
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="$emit('selectTab', tab.id)"
        :class="['tab', { active: activeTab === tab.id }]"
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
    activeTab: String
  },
  emits: ['selectTab'],
  data() {
    return {
      tabs: [
        { id: 'drilling', name: '掘削・分離' },
        { id: 'smelting', name: '精錬' },
        { id: 'manufacturing', name: '製造' },
        { id: 'efficiency', name: '効率管理' }
      ]
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 200px;
  background: rgba(0, 20, 40, 0.8);
  border-right: 1px solid #00d4ff;
  padding: 20px;
}

.phase-title {
  color: #00d4ff;
  font-size: 0.9em;
  text-transform: uppercase;
  margin-bottom: 10px;
}

.tab {
  display: block;
  width: 100%;
  padding: 12px 20px;
  margin-bottom: 5px;
  background: transparent;
  color: #e0e0e0;
  border: none;
  border-left: 4px solid transparent;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tab.active {
  background: rgba(0, 212, 255, 0.2);
  border-left-color: #00d4ff;
}
</style>
