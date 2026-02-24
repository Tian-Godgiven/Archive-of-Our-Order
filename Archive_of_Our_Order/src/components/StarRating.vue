<template>
  <div class="flex gap-1">
    <button
      v-for="n in max"
      :key="n"
      type="button"
      @click="emit('update:modelValue', n)"
      class="transition-transform active:scale-90"
      :class="variant === 'flame' ? 'text-orange-400' : 'text-yellow-400'"
    >
      <Flame v-if="variant === 'flame'"
        :size="size"
        :fill="n <= modelValue ? 'currentColor' : 'none'"
        stroke-width="1.5"
      />
      <Star v-else
        :size="size"
        :fill="n <= modelValue ? 'currentColor' : 'none'"
        stroke-width="1.5"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Star, Flame } from 'lucide-vue-next';

withDefaults(defineProps<{
  modelValue: number;
  max?: number;
  size?: number;
  variant?: 'star' | 'flame';
}>(), {
  max: 5,
  size: 24,
  variant: 'star',
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();
</script>
