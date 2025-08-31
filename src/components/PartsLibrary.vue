<template>
  <div class="parts-library">
    <h3>零件库</h3>
    <div class="part-groups">
      <div
        v-for="part in parts"
        :key="part.type"
        class="part-item"
        @click="$emit('part-selected', part)"
      >
        <img :src="part.src" :alt="part.name" />
        <span>{{ part.name }}</span>
      </div>
    </div>

    <!-- 由阶段一生产的核苷酸：有文字注释 -->
  <div class="produced">
      <div class="prod-title">核苷酸列表</div>
      <div class="prod-grid">
        <button
          v-for="item in producedItems"
          :key="item.id"
          class="prod-btn"
          @click="$emit('use-produced', item)"
          :title="item.letter"
        >
      <NucleotideIcon :letter="item.letter" :size="22" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import NucleotideIcon from './NucleotideIcon.vue';

const props = defineProps({
  parts: { type: Array, required: true },
  producedItems: { type: Array, required: true }, // 已解锁字母集合 [{id, letter}]，可无限使用
});

defineEmits(['part-selected', 'use-produced']);
</script>

<style scoped>
.parts-library {
  grid-area: library;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  background-color: #fff;
  font-family: 'Microsoft YaHei', sans-serif;
  font-weight: bold;
}

.part-groups {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.part-item {
  display: flex;

  align-items: center;
  padding: 6px;
  border: 1px solid #eee;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
}

.part-item:hover {
  background-color: #e9f5ff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.part-item img {
  width: 30px;
  height: 30px;
  margin-right: 20px;
  margin-left: 80px;
}

.inventory {
  margin-top: 12px;
}

.inv-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.inv-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.inv-card {
  background: #f7f9fc;
  border: 1px solid #e6ecf5;
  border-radius: 8px;
  padding: 8px;
  text-align: center;
}

.inv-letter {
  font-size: 18px;
  color: #007bff;
}

.inv-count {
  font-size: 14px;
  color: #555;
}

/* 生产出的核苷酸图标列表（竖向添加） */
.produced { margin-top: 20px; max-height: 40vh; overflow-y: auto; }
.prod-title { font-size: 14px; color: #333; margin-bottom: 16px; }
.prod-grid { display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box; }
.prod-btn { width: 100%; display:flex; align-items:center; justify-content:center; padding:6px; min-height: 44px; border:1px solid #e6ecf5; background:#fff; border-radius:8px; cursor:pointer; transition: transform .1s ease; box-sizing: border-box; }
.prod-btn:hover { transform: translateY(-1px); }
</style>
