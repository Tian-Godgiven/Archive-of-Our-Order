<template>
  <ModalOverlay :visible="visible" :dark="true" @close="close">
    <div class="relative w-full h-full" @click.stop>
      <!-- 关闭按钮 -->
      <button
        class="absolute top-4 right-4 w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30 z-10"
        @click="close"
      >
        <X :size="20" />
      </button>

      <!-- 照片显示 -->
      <div
        class="relative w-full h-full flex items-center justify-center"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <img
          :src="currentPhotoUrl"
          class="max-w-full max-h-full object-contain"
        />

        <!-- 左右切换按钮 -->
        <button
          v-if="hasPrevious"
          @click="previous"
          class="absolute left-4 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30"
        >
          <ChevronLeft :size="24" />
        </button>
        <button
          v-if="hasNext"
          @click="next"
          class="absolute right-4 w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-white hover:bg-opacity-30"
        >
          <ChevronRight :size="24" />
        </button>

        <!-- 指示器 -->
        <div
          v-if="photos.length > 1"
          class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 px-3 py-1 rounded-full text-white text-sm"
        >
          {{ currentIndex + 1 }} / {{ photos.length }}
        </div>
      </div>
    </div>
  </ModalOverlay>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { getPhotoUrl } from '@/utils/photo';
import ModalOverlay from '@/components/ModalOverlay.vue';
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next';

const props = defineProps<{
  visible: boolean;
  photos: string[];
  initialIndex?: number;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const currentIndex = ref(props.initialIndex || 0);

// 滑动相关
const touchStartX = ref(0);
const touchEndX = ref(0);
const minSwipeDistance = 50;

const currentPhotoUrl = computed(() => {
  if (props.photos.length === 0) return '';
  return getPhotoUrl(props.photos[currentIndex.value]);
});

const hasPrevious = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value < props.photos.length - 1);

function close() {
  emit('update:visible', false);
}

function previous() {
  if (hasPrevious.value) {
    currentIndex.value--;
  }
}

function next() {
  if (hasNext.value) {
    currentIndex.value++;
  }
}

// 触摸事件处理
function handleTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX;
}

function handleTouchMove(e: TouchEvent) {
  touchEndX.value = e.touches[0].clientX;
}

function handleTouchEnd() {
  const distance = touchEndX.value - touchStartX.value;

  // 向右滑动（上一张）
  if (distance > minSwipeDistance) {
    previous();
  }

  // 向左滑动（下一张）
  if (distance < -minSwipeDistance) {
    next();
  }

  // 重置
  touchStartX.value = 0;
  touchEndX.value = 0;
}

// 监听键盘事件
function handleKeydown(e: KeyboardEvent) {
  if (!props.visible) return;

  if (e.key === 'Escape') {
    close();
  } else if (e.key === 'ArrowLeft') {
    previous();
  } else if (e.key === 'ArrowRight') {
    next();
  }
}

// 添加和移除键盘事件监听
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown);
}
</script>
