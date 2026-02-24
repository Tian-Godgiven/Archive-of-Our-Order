<template>
  <div class="flex gap-1">
    <button
      v-for="star in max"
      :key="star"
      type="button"
      @click="emit('update:modelValue', star)"
      class="text-yellow-400 transition-transform active:scale-90"
    >
      <Star
        :size="size"
        :fill="star <= modelValue ? 'currentColor' : 'none'"
        stroke-width="1.5"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { Star } from 'lucide-vue-next';

withDefaults(defineProps<{
  modelValue: number;
  max?: number;
  size?: number;
}>(), {
  max: 5,
  size: 24,
});

const emit = defineEmits<{
  'update:modelValue': [value: number];
}>();
</script>
