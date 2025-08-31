<template>
  <div class="pair-row">
    <div class="side left">
      <img class="phos" :src="phosphate" alt="磷酸" />
      <div class="link" />
      <img class="sugar" :src="deoxyribose" alt="脱氧核糖" />
      <div class="link" />
      <img class="base" :src="baseMap[left]" :alt="left" />
    </div>
    <div class="hbonds" :class="bondClass">
      <div v-for="n in bondCount" :key="n" class="bond" />
    </div>
    <div class="side right">
      <img class="base" :src="baseMap[right]" :alt="right" />
      <div class="link" />
      <img class="sugar flip wobble" :src="deoxyribose" alt="脱氧核糖" />
      <div class="link" />
      <img class="phos" :src="phosphate" alt="磷酸" />
    </div>
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
  left: { type: String, required: true },
  right: { type: String, required: true },
});

const baseMap = { A: adenine, T: thymine, C: cytosine, G: guanine };
const bondCount = computed(() => {
  const a = props.left, b = props.right;
  return (a === 'A' && b === 'T') || (a === 'T' && b === 'A') ? 2 : 3;
});
const bondClass = computed(() => (bondCount.value === 2 ? 'two' : 'three'));
</script>

<style scoped>
.pair-row { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 10px; }
.side { display: inline-flex; align-items: center; justify-content: flex-end; }
.side.right { justify-content: flex-start; }
.phos { width: 22px; height: 22px; }
.sugar { width: 26px; height: 26px; }
.flip { transform: scaleX(-1); }
.wobble { animation: wob 1.6s ease-in-out infinite; }
@keyframes wob { 0%,100%{ transform: scaleX(-1) translateX(0);} 50%{ transform: scaleX(-1) translateX(1px);} }
.base { width: 32px; height: 24px; }
.link { width: 12px; height: 2px; background: #94a3b8; margin: 0 4px; border-radius: 1px; }
.hbonds { width: 38px; display: grid; justify-items: center; }
.hbonds .bond { width: 26px; height: 0; border-top: 2px dashed #d37474; }
.hbonds.two { grid-template-rows: 1fr 1fr; row-gap: 6px; }
.hbonds.three { grid-template-rows: 1fr 1fr 1fr; row-gap: 4px; }
</style>
