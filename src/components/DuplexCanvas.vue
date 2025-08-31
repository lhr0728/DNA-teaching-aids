<template>
  <div class="duplex-canvas" ref="wrap">
    <v-stage :config="stageCfg">
      <v-layer>
        <!-- 每一行的左右糖和碱基 -->
        <template v-for="(p,i) in pairs" :key="'row-'+i">
          <!-- 左糖 -->
          <v-image :config="imgCfg(sugarImg, leftSugarX - 13, rowY(i) - 13, 26, 26)"/>
          <!-- 左碱基 -->
          <v-image :config="imgCfg(baseImg(p.left), leftBaseX - 16, rowY(i) - 12, 32, 24)"/>
          <!-- 左糖-碱基连接线（糖苷键示意） -->
          <v-line :config="sugarBaseLinkCfg('left', i)" />
          <!-- 右碱基 -->
          <v-image :config="imgCfg(baseImg(p.right), rightBaseX - 16, rowY(i) - 12, 32, 24)"/>
          <!-- 右糖-碱基连接线（糖苷键示意，镜像） -->
          <v-line :config="sugarBaseLinkCfg('right', i)" />
          <!-- 氢键（2或3条虚线） -->
          <template v-for="k in bondCount(p)">
            <v-line :config="hBondCfg(i, k, bondCount(p))" />
          </template>
          <!-- 右糖（镜像） -->
          <v-image :config="imgCfg(sugarImg, rightSugarX - 13, rowY(i) - 13, 26, 26, true)"/>

          <!-- 每行两侧的磷酸，位于糖外上侧45°，数量与糖一致，并连接当前糖与上一行糖形成连续主链 -->
          <!-- 左侧磷酸与连线 -->
          <v-image :config="imgCfg(phosImg, phosPos('left', i).x - 11, phosPos('left', i).y - 11, 22, 22)"/>
          <v-line :config="linkCfg(leftSugarX, rowY(i), phosPos('left', i).x, phosPos('left', i).y)"/>
          <template v-if="i > 0">
            <v-line :config="linkCfg(phosPos('left', i).x, phosPos('left', i).y, leftSugarX, rowY(i-1))"/>
          </template>
          <!-- 右侧磷酸与连线（镜像） -->
          <v-image :config="imgCfg(phosImg, phosPos('right', i).x - 11, phosPos('right', i).y - 11, 22, 22)"/>
          <v-line :config="linkCfg(rightSugarX, rowY(i), phosPos('right', i).x, phosPos('right', i).y)"/>
          <template v-if="i > 0">
            <v-line :config="linkCfg(phosPos('right', i).x, phosPos('right', i).y, rightSugarX, rowY(i-1))"/>
          </template>
        </template>
      </v-layer>
    </v-stage>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import adenine from '../assets/adenine.svg';
import thymine from '../assets/thymine.svg';
import cytosine from '../assets/cytosine.svg';
import guanine from '../assets/guanine.svg';
import sugar from '../assets/deoxyribose.svg';
import phosphate from '../assets/phosphate.svg';

const props = defineProps({
  pairs: { type: Array, required: true }, // [{left,right}]
});

const wrap = ref(null);
const stageCfg = ref({ width: 520, height: 260 });

const rowGap = 46; // 行间距，稍微紧凑
let topPad = 24; let bottomPad = 56; // 动态边距（会在布局时根据磷酸偏移微调）

// 水平坐标（根据总宽更新）
let leftSugarX = 120, rightSugarX = 400;
let leftBaseX = 210, rightBaseX = 310;
// 磷酸将在每行按45°相对糖定位，不再使用跨行中点
const phosOffsetDefault = 26;
let phosOffset = phosOffsetDefault;

const updateLayout = () => {
  if (wrap.value) {
    const w = wrap.value.clientWidth || 520;
    stageCfg.value.width = Math.max(460, w);
    // 关键点：糖位置
    leftSugarX = Math.floor(stageCfg.value.width * 0.22);
    rightSugarX = Math.floor(stageCfg.value.width * 0.78);
    // 让碱基更靠近糖
    const baseDX = Math.max(36, Math.floor(stageCfg.value.width * 0.085));
    leftBaseX = leftSugarX + baseDX;
    rightBaseX = rightSugarX - baseDX;
    // 45°外上侧的偏移，按宽度做轻微缩放
    phosOffset = Math.max(22, Math.floor(stageCfg.value.width * 0.05));
    // 顶部边距需要容纳首行上方的磷酸
    topPad = Math.max(28, phosOffset + 18);
    // 底部边距留更多空间避免溢出
    bottomPad = Math.max(56, Math.floor(stageCfg.value.width * 0.06));
  }
  const n = props.pairs?.length || 0;
  stageCfg.value.height = topPad + (n ? (n - 1) * rowGap : 0) + bottomPad + 40;
};

onMounted(updateLayout);
watch(() => props.pairs?.length, () => updateLayout(), { immediate: false });

const img = (src) => { const im = new Image(); im.src = src; return im; };
const sugarImg = img(sugar);
const phosImg = img(phosphate);
const baseImg = (letter) => img({ A: adenine, T: thymine, C: cytosine, G: guanine }[letter]);

const rowY = (i) => topPad + i * rowGap + 20;
// 计算某侧某行的磷酸中心坐标
// 规则：i==0 位于该行糖的外上侧45°；i>0 垂直居于本行与上一行糖之间
const phosPos = (side, i) => {
  const cx = side === 'left' ? leftSugarX : rightSugarX;
  const x = side === 'left' ? cx - phosOffset : cx + phosOffset;
  const y = i === 0 ? (rowY(i) - phosOffset) : ((rowY(i) + rowY(i - 1)) / 2);
  return { x, y };
};

const imgCfg = (image, x, y, width, height, flip=false) => ({ image, x, y, width, height, scaleX: flip ? -1 : 1, offsetX: flip ? width : 0 });
const linkCfg = (x1,y1,x2,y2) => ({ points: [x1, y1, x2, y2], stroke: '#94a3b8', strokeWidth: 2 });
const sugarBaseLinkCfg = (side, i) => {
  const y = rowY(i);
  if (side === 'left') {
    return linkCfg(leftSugarX + 8, y - 4, leftBaseX - 14, y - 4);
  }
  return linkCfg(rightBaseX + 14, y - 4, rightSugarX - 8, y - 4);
};
const hBondCfg = (rowIndex, k, total) => {
  const y0 = rowY(rowIndex) - 8; // 上线位置
  const step = total === 2 ? 12 : 8;
  const y = y0 + (k-1) * step;
  return { points: [leftBaseX + 16, y, rightBaseX - 16, y], stroke: '#d37474', strokeWidth: 2, dash: [6,4] };
};
const bondCount = (p) => ((p.left === 'A' && p.right === 'T') || (p.left === 'T' && p.right === 'A')) ? 2 : 3;
</script>

<style scoped>
.duplex-canvas { width: max-content; margin: 0 auto; }
</style>
