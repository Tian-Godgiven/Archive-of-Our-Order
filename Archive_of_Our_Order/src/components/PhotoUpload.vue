<template>
  <div class="space-y-3">
    <!-- 照片预览 -->
    <div v-if="modelValue.length > 0" class="flex gap-2 overflow-x-auto pb-2">
      <div
        v-for="(photo, index) in modelValue"
        :key="index"
        class="relative flex-shrink-0"
      >
        <img
          :src="getPhotoUrl(photo)"
          class="w-24 h-24 rounded object-cover cursor-pointer"
          @click="$emit('view', photo)"
        />
        <button
          @click="removePhoto(index)"
          class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
        >
          ×
        </button>
      </div>
    </div>

    <!-- 添加照片按钮 -->
    <button
      @click="addPhotos"
      :disabled="uploading"
      class="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition disabled:opacity-50"
    >
      {{ uploading ? '上传中...' : '+ 添加照片' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { selectPhotos, getPhotoUrl } from '@/utils/photo';

const props = defineProps<{
  modelValue: string[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
  'view': [photo: string];
}>();

const uploading = ref(false);

async function addPhotos() {
  uploading.value = true;
  try {
    const photos = await selectPhotos();
    if (photos.length > 0) {
      emit('update:modelValue', [...props.modelValue, ...photos]);
    }
  } catch (error) {
    console.error('Failed to add photos:', error);
    alert('添加照片失败');
  } finally {
    uploading.value = false;
  }
}

function removePhoto(index: number) {
  const newPhotos = [...props.modelValue];
  newPhotos.splice(index, 1);
  emit('update:modelValue', newPhotos);
}
</script>
