<template>
  <div class="assembly-area" ref="container">
    <div class="columns">
      <div class="build-panel">
        <div class="panel-title">组装核苷酸</div>
        <div class="stage-wrap">
          <v-stage :config="buildStageConfig">
            <v-layer>
              <!-- 虚线占位：磷酸（圆形，位于糖的外上侧45°） -->
              <v-circle :config="computedAnchors.phosphate" />
              <!-- 虚线占位：脱氧核糖（五边形，居中） -->
              <v-regular-polygon :config="computedAnchors.deoxyribose" />
              <!-- 虚线占位：碱基（与资产一致的圆角长方形） -->
              <v-rect :config="computedAnchors.baseRect" />
              <!-- 虚线连接：磷酸-糖、糖-碱基 -->
              <v-line :config="anchorLinks.phosToSugar" />
              <v-line :config="anchorLinks.sugarToBase" />
              
              <!-- 已放置的真实图像 -->
              <v-image v-for="node in placedNodes" :key="node.id" :config="node" />
            </v-layer>
          </v-stage>
        </div>
      </div>
      <div class="pair-panel">
        <div class="panel-title">碱基配对</div>
        <!-- 候选由左侧零件库点击直接进入，这里不再展示候选列表 -->
        <div class="pairs">
          <div class="duplex center">
            <DuplexCanvas :pairs="pairs" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import NucleotideIcon from './NucleotideIcon.vue';
import DuplexPair from './DuplexPair.vue';
import DuplexCanvas from './DuplexCanvas.vue';
import adenineIcon from '../assets/adenine.svg';
import thymineIcon from '../assets/thymine.svg';
import cytosineIcon from '../assets/cytosine.svg';
import guanineIcon from '../assets/guanine.svg';

// 无库存概念
const props = defineProps({});

const emit = defineEmits(['placed', 'error', 'complete', 'pairing-complete', 'produced']);

const container = ref(null);
const buildStageConfig = ref({ width: 520, height: 180 });

onMounted(() => {
  if (container.value) {
    const w = container.value.offsetWidth;
    buildStageConfig.value.width = Math.max(400, Math.floor(w * 0.55));
    buildStageConfig.value.height = 180; // 下调高度，保持紧凑
  }
});

// 阶段一：点击式组装（可重复构建）
const ORDER = ['phosphate', 'deoxyribose', 'base'];
const step = ref(0);

// 基础锚点（未偏移）
const anchorStylesBase = ref({
  phosphate: { x: 120, y: 140, radius: 26, stroke: '#999', dash: [6,4], strokeWidth: 2 },
  deoxyribose: { x: 220, y: 130, sides: 5, radius: 35, stroke: '#999', dash: [6,4], strokeWidth: 2 },
  // base 只存基于中心点的占位信息，实际渲染使用圆角矩形
  base: { x: 320, y: 140, width: 70, height: 44, cornerRadius: 8, stroke: '#999', dash: [6,4], strokeWidth: 2 },
});

// 让锚点组在画布内部居中：根据画布尺寸计算偏移
const GROUP_CENTER = { x: 220, y: 140 };
const computedAnchors = computed(() => {
  const dx = buildStageConfig.value.width / 2 - GROUP_CENTER.x;
  const dy = buildStageConfig.value.height / 2 - GROUP_CENTER.y;
  // 糖中心（先按居中计算）
  const sugar = {
    x: anchorStylesBase.value.deoxyribose.x + dx,
    y: anchorStylesBase.value.deoxyribose.y + dy,
  };
  // 统一的间距：三者之间等距
  const gap = Math.max(96, Math.floor(buildStageConfig.value.width * 0.18));
  const phosOffset = Math.round(gap / Math.SQRT2); // 45°的投影，使中心距等于 gap
  // 依据三者整体外延，微调糖的 y，使整体区域在画布中垂直居中
  const phosphateR = anchorStylesBase.value.phosphate.radius;
  const sugarR = anchorStylesBase.value.deoxyribose.radius;
  const baseHalfH = (anchorStylesBase.value.base.height || 44) / 2;
  const topExtent = phosOffset + phosphateR; // 上方向的最大外延
  const bottomExtent = Math.max(sugarR, baseHalfH); // 下方向的最大外延
  const centerShift = (topExtent - bottomExtent) / 2; // >0 表示需要下移
  sugar.y += centerShift;
  // 磷酸中心（相对糖外上侧，水平方向增加距离）
  const phosphate = {
    ...anchorStylesBase.value.phosphate,
    x: sugar.x - phosOffset * 1.5, // 水平方向增加距离
    y: sugar.y - phosOffset * 0.78, // 垂直方向保持不变
  };
  // 碱基圆角矩形（以中心定位，offsetX/offsetY 保证 x/y 表示中心）
  const baseRect = {
    x: sugar.x + gap + 15,
    y: sugar.y - 11,
    width: anchorStylesBase.value.base.width,
    height: anchorStylesBase.value.base.height,
    cornerRadius: anchorStylesBase.value.base.cornerRadius,
    stroke: anchorStylesBase.value.base.stroke,
    dash: anchorStylesBase.value.base.dash,
    strokeWidth: anchorStylesBase.value.base.strokeWidth,
    offsetX: anchorStylesBase.value.base.width / 2,
    offsetY: anchorStylesBase.value.base.height / 2,
  };
  return {
    phosphate,
    deoxyribose: { ...anchorStylesBase.value.deoxyribose, x: sugar.x, y: sugar.y },
  // base 仍保留中心点，供放置真实图像时使用
  base: { x: baseRect.x, y: baseRect.y },
    baseRect,
  };
});

// 占位图标之间的虚线连接
const anchorLinks = computed(() => {
  const phos = computedAnchors.value.phosphate;
  const sugar = computedAnchors.value.deoxyribose;
  const base = computedAnchors.value.baseRect;
  const common = { stroke: '#999', strokeWidth: 2, dash: [6,4] };
  
  // 磷酸到糖的连接：45度线+水平线到五边形左侧顶点
  const phosRadius = phos.radius;
  const sugarRadius = sugar.radius;
  
  // 磷酸右下边缘起点
  const phosStartX = phos.x + phosRadius * 0.7;
  const phosStartY = phos.y + phosRadius * 0.7;
  
  // 45度线段长度
  const diagonalLength = 38;
  
  // 第一个折点：从磷酸边缘45度延伸
  const bend1X = phosStartX + diagonalLength * Math.cos(Math.PI / 4);
  const bend1Y = phosStartY + diagonalLength * Math.sin(Math.PI / 4);
  
  // 五边形左侧顶点 (五边形的左侧顶点在180度位置)
  const sugarLeftX = sugar.x + sugarRadius * Math.cos(Math.PI); // 180度 = 左侧顶点
  const sugarLeftY = sugar.y; // 水平对齐，所以Y坐标和糖中心一样
  
  // 糖到碱基：从糖右顶点到碱基左侧，增加虚线长度
  const sugarRightTopAngle = 7; // 五边形右顶点在0度位置
  const sugarRightTopX = sugar.x + 32;
  const sugarRightTopY = sugar.y - 10;
  const baseLeftX = base.x - base.width / 2 + 0; // 增加40像素的虚线长度
  
  return {
    phosToSugar: { 
      ...common, 
      points: [phosStartX, phosStartY, bend1X, bend1Y, sugarLeftX, bend1Y] 
    },
    sugarToBase: { 
      ...common, 
      points: [sugarRightTopX, sugarRightTopY, baseLeftX, base.y] 
    },
  };
});

const placedNodes = ref([]);
const nextId = (() => { let i=1; return () => i++; })();

const baseLetter = (type) => ({ adenine: 'A', thymine: 'T', cytosine: 'C', guanine: 'G' })[type] || '?';
const baseName = (type) => ({ adenine: '腺嘌呤', thymine: '胸腺嘧啶', cytosine: '胞嘧啶', guanine: '鸟嘌呤' })[type] || '未知碱基';

// 去掉本地展示列表与候选，使用左侧零件库中的具体图标

const handleSelected = (part) => {
  const expected = ORDER[step.value];
  const isBase = !!part.isBase;
  const typeOK = expected === (isBase ? 'base' : part.type);
  if (!typeOK) {
    emit('error', `顺序错误：当前应放置${expected === 'phosphate' ? '磷酸' : expected === 'deoxyribose' ? '脱氧核糖' : '含氮碱基'}`);
    return;
  }
  const anchorType = isBase ? 'base' : part.type;
  const pos = computedAnchors.value[anchorType];
  const img = new Image();
  img.src = part.src;
  placedNodes.value.push({ id: nextId(), image: img, x: pos.x - 32, y: pos.y - 32, width: 64, height: 64 });
  emit('placed', { type: anchorType, name: part.name });

  step.value += 1;
  if (step.value >= ORDER.length) {
    if (isBase) {
      const letter = baseLetter(part.type);
      emit('produced', { letter });
      emit('complete', { baseType: part.type, baseName: baseName(part.type) });
    }
    // 自动清空当前轮次以继续构建
    step.value = 0;
    placedNodes.value = [];
  }
};

// 暴露接口统一在下方一次性定义

// 阶段二
const pairs = ref([]); // [{left,right,leftId,rightId}]
const selectedForPair = ref({ letter: null, id: null });

const pairRuleOK = (a, b) => (
  (a === 'A' && b === 'T') || (a === 'T' && b === 'A') || (a === 'C' && b === 'G') || (a === 'G' && b === 'C')
);

function selectLetters(first, second) {
  if (!pairRuleOK(first, second)) {
    emit('error', '配对错误：请按照 A-T 或 C-G 的规则进行配对');
    selectedForPair.value = { letter: null, id: null };
    return;
  }
  pairs.value.push({ left: first, right: second });
  selectedForPair.value = { letter: null, id: null };
  if (pairs.value.length >= 2) emit('pairing-complete');
}

// 从零件库选择：第一次选为 left，第二次选为 right，并请求父组件移除该具体图标
function selectFromLibrary(letter) {
  if (!selectedForPair.value.letter) {
    selectedForPair.value = { letter, id: null };
    emit('placed', { type: 'candidate', name: letter });
  } else {
    const first = selectedForPair.value.letter;
    const second = letter;
    selectLetters(first, second);
  }
}

defineExpose({ handleSelected, selectFromLibrary });
</script>

<style scoped>
.assembly-area { grid-area: assembly; border: 1px solid #ddd; border-radius: 8px; background-color: #fff; overflow: hidden; }
.columns { display: grid; grid-template-columns: 1fr; gap: 0px; padding: 12px; }
.stage-wrap { display:flex; justify-content:center; align-items:center; min-height: 200px; }
.panel-title { font-family: 'Microsoft YaHei', sans-serif; font-weight: bold; margin-bottom: 8px;margin-top: 2%; }
.sub-title { font-size: 14px; color: #555; margin: 8px 0; }
.nuc-list { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; }
.nuc-card, .nuc-btn.card { display: flex; align-items: center; gap: 8px; background: #f7f9fc; border: 1px solid #e6ecf5; border-radius: 8px; padding: 8px; text-align: left; }
.nuc-card img, .nuc-btn.card img { width: 28px; height: 28px; }
.nuc-meta { display: flex; flex-direction: column; }
.nuc-name { font-size: 14px; }
.nuc-count { font-size: 12px; color: #555; }
.duplex { margin-top: 8px; }
.duplex.center { display: flex; justify-content: center; }
.pair-list { display: grid; grid-auto-rows: minmax(40px, auto); row-gap: 8px; }
.nuc-mini { width: 30px; height: 30px; border-radius: 6px; background: #007bff; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.selected { margin-top: 8px; color: #007bff; }

/* 不再需要旧的左右两列与氢键列，统一由 DuplexPair 控制 */
</style>
