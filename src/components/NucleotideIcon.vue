<template>
  <div class="nuc-icon" :class="orientation">
    <template v-if="orientation === 'left'">
      <img class="piece" :style="imgStyle" :src="phosphate" alt="磷酸" />
      <div class="link" />
      <img class="piece" :style="imgStyle" :src="deoxyribose" alt="脱氧核糖" />
      <div class="link" />
      <img class="piece base" :style="imgStyle" :src="baseSrc" :alt="baseName" />
    </template>
    <template v-else>
      <img class="piece base" :style="imgStyle" :src="baseSrc" :alt="baseName" />
      <div class="link" />
      <img class="piece" :style="imgStyle" :src="deoxyribose" alt="脱氧核糖" />
      <div class="link" />
      <img class="piece" :style="imgStyle" :src="phosphate" alt="磷酸" />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import phosphate from '../assets/phosphate.svg';
import deoxyribose from '../assets/deoxyribose.svg';
import adenine from '../assets/adenine.svg';
import thymine from '../assets/thymine.svg';
import cytosine from '../assets/cytosine.svg';
import guanine from '../assets/guanine.svg';

const props = defineProps({
  letter: { type: String, required: true }, // 'A' | 'T' | 'C' | 'G'
  size: { type: Number, default: 24 },
  orientation: { type: String, default: 'left' }, // 'left' | 'right'
});

const baseSrc = computed(() => ({ A: adenine, T: thymine, C: cytosine, G: guanine })[props.letter] || adenine);
const baseName = computed(() => ({ A: '腺嘌呤', T: '胸腺嘧啶', C: '胞嘧啶', G: '鸟嘌呤' })[props.letter] || '碱基');
const imgStyle = computed(() => ({ width: `${props.size}px`, height: `${props.size}px` }));
</script>

<style scoped>
.nuc-icon { display: inline-flex; align-items: center; }
.nuc-icon.right { flex-direction: row-reverse; }
.piece { display: inline-block; }
.link { width: 10px; height: 2px; background: #94a3b8; margin: 0 4px; border-radius: 1px; }
.base { filter: drop-shadow(0 0 0 rgba(0,0,0,0)); }
</style>
