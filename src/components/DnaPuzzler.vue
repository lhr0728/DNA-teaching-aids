<template>
  <div class="dna-puzzler">
  <PartsLibrary :parts="parts" :produced-items="producedItems" @part-selected="onPartSelected" @use-produced="onUseProduced" />
    <AssemblyArea
      ref="assemblyArea"
      
      @placed="onPlaced"
      @error="onError"
      @complete="onComplete"
      @produced="onProduced"
      @pairing-complete="onPairingComplete"
    />
    <FeedbackPanel :message="feedbackMessage" :message-type="feedbackType" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PartsLibrary from './PartsLibrary.vue';
import AssemblyArea from './AssemblyArea.vue';
import FeedbackPanel from './FeedbackPanel.vue';

import phosphateIcon from '../assets/phosphate.svg';
import deoxyriboseIcon from '../assets/deoxyribose.svg';
import adenineIcon from '../assets/adenine.svg';
import thymineIcon from '../assets/thymine.svg';
import cytosineIcon from '../assets/cytosine.svg';
import guanineIcon from '../assets/guanine.svg';

const assemblyArea = ref(null);
const feedbackMessage = ref('点击“磷酸→脱氧核糖→碱基”组装核苷酸；左侧列表中出现的字母图标可无限次用于 A-T、C-G 配对。');
const feedbackType = ref('info');

const parts = ref([
  { type: 'phosphate', name: '磷酸', src: phosphateIcon },
  { type: 'deoxyribose', name: '脱氧核糖', src: deoxyriboseIcon },
  { type: 'adenine', name: '腺嘌呤', src: adenineIcon, isBase: true },
  { type: 'thymine', name: '胸腺嘧啶', src: thymineIcon, isBase: true },
  { type: 'cytosine', name: '胞嘧啶', src: cytosineIcon, isBase: true },
  { type: 'guanine', name: '鸟嘌呤', src: guanineIcon, isBase: true },
]);

// 仅记录已解锁的字母集合（无限使用）
const producedItems = ref([]); // [{id, letter}] 此处保留为数组以复用组件结构，但只保存唯一字母

const onPartSelected = (part) => {
  feedbackMessage.value = `你选择了 ${part.name}。`;
  feedbackType.value = 'info';
  assemblyArea.value?.handleSelected(part);
};

const onPlaced = (payload) => {
  feedbackMessage.value = `已放置：${payload.name}`;
  feedbackType.value = 'success';
};

const onError = (msg) => {
  feedbackMessage.value = msg;
  feedbackType.value = 'error';
};

const onComplete = (payload) => {
  feedbackMessage.value = `完成：${payload.baseName}脱氧核糖核苷酸。`;
  feedbackType.value = 'success';
};

const onProduced = ({ letter }) => {
  if (!producedItems.value.find(i => i.letter === letter)) {
    producedItems.value.push({ id: letter, letter });
  }
  feedbackMessage.value = `已解锁：${letter} 型核苷酸，可无限使用`;
  feedbackType.value = 'success';
};

// 使用左侧产生的某一个具体核苷酸图标进行配对（第一步选择）
const onUseProduced = (item) => {
  assemblyArea.value?.selectFromLibrary(item.letter);
};

const onPairingComplete = () => {
  feedbackMessage.value = '配对完成！已构建 DNA 双链的局部片段。';
  feedbackType.value = 'success';
};
</script>

<style scoped>
.dna-puzzler {
  display: grid;
  grid-template-columns: 300px 1fr;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "library assembly"
    "library feedback";
  gap: 20px;
  padding: 20px;
  max-width: 1400px;
  height: 75vh;
  margin: auto;
  background: #f0f2f5;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  font-family: 'Microsoft YaHei', sans-serif;
  font-weight: bold;
}
</style>
