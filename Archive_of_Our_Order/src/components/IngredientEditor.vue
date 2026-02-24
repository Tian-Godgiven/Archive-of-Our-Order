<template>
  <div class="space-y-2">
    <div
      v-for="(item, index) in list"
      :key="index"
      class="flex items-center gap-2"
    >
      <input
        v-model="item.name"
        type="text"
        placeholder="食材名称"
        class="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        @input="emitChange"
      />
      <input
        v-model="item.amount"
        type="text"
        placeholder="用量"
        class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        @input="emitChange"
      />
      <button
        type="button"
        @click="removeItem(index)"
        class="text-gray-400 hover:text-red-500 transition flex-shrink-0"
      >
        <X :size="16" />
      </button>
    </div>

    <button
      type="button"
      @click="addItem"
      class="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition text-sm"
    >
      + 添加食材
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

interface IngredientItem { name: string; amount: string }

function parseIngredients(str: string): IngredientItem[] {
  if (!str.trim()) return [{ name: '', amount: '' }];
  return str.split('\n').filter(l => l.trim()).map(line => {
    const parts = line.trim().split(/\s+/);
    if (parts.length === 1) return { name: parts[0], amount: '' };
    return { name: parts.slice(0, -1).join(' '), amount: parts[parts.length - 1] };
  });
}

function listToString(list: IngredientItem[]): string {
  return list
    .filter(i => i.name.trim())
    .map(i => i.amount.trim() ? `${i.name} ${i.amount}` : i.name)
    .join('\n');
}

const list = ref<IngredientItem[]>(parseIngredients(props.modelValue));

watch(() => props.modelValue, (val) => {
  const current = listToString(list.value);
  if (val !== current) list.value = parseIngredients(val);
});

function emitChange() {
  emit('update:modelValue', listToString(list.value));
}

function addItem() {
  list.value.push({ name: '', amount: '' });
}

function removeItem(index: number) {
  list.value.splice(index, 1);
  if (list.value.length === 0) list.value.push({ name: '', amount: '' });
  emitChange();
}
</script>
