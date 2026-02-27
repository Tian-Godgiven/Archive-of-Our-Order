<template>
  <div class="space-y-3">
    <!-- 照片预览 -->
    <div v-if="modelValue.length > 0" class="flex gap-2 overflow-x-auto py-3 px-1">
      <div
        v-for="(photo, index) in modelValue"
        :key="index"
        class="relative flex-shrink-0"
      >
        <img
          :src="photoUrls[photo] || ''"
          class="w-24 h-24 rounded object-cover cursor-pointer"
          @click="$emit('view', photo)"
        />
        <button
          @click="removePhoto(index)"
          class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
        >
          <X :size="14" />
        </button>
      </div>
    </div>

    <!-- 添加照片按钮 -->
    <button
      @click="handleAddClick"
      :disabled="uploading"
      class="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition disabled:opacity-50"
    >
      {{ uploading ? '上传中...' : '+ 添加照片' }}
    </button>

    <!-- 选择方式弹窗 -->
    <ModalOverlay :visible="showMethodPicker" @close="showMethodPicker = false">
      <div class="bg-white rounded-lg p-6 m-4 max-w-sm w-full" @click.stop>
        <h3 class="text-lg font-semibold mb-4">选择照片方式</h3>
        <div class="space-y-3">
          <button
            @click="selectMethod('camera')"
            class="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
          >
            <Camera :size="20" />
            拍照
          </button>
          <button
            @click="selectMethod('gallery')"
            class="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition flex items-center justify-center gap-2"
          >
            <Image :size="20" />
            从相册选择
          </button>
        </div>
        <label class="flex items-center gap-2 mt-4 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" v-model="rememberChoice" class="rounded" />
          记住我的选择
        </label>
      </div>
    </ModalOverlay>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { selectPhotos, takePhoto, getThumbnailUrl } from '@/utils/photo';
import { load } from '@tauri-apps/plugin-store';
import { X, Camera, Image } from 'lucide-vue-next';
import ModalOverlay from './ModalOverlay.vue';

const props = defineProps<{
  modelValue: string[];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
  'view': [photo: string];
}>();

const uploading = ref(false);
const photoUrls = ref<Record<string, string>>({});
const showMethodPicker = ref(false);
const rememberChoice = ref(false);
const defaultMethod = ref<'camera' | 'gallery' | null>(null);

onMounted(async () => {
  const store = await load('settings.json', { defaults: {} });
  const saved = await store.get<'camera' | 'gallery'>('photoMethod');
  if (saved) {
    defaultMethod.value = saved;
  }
});

async function loadPhotoUrls() {
  for (const photo of props.modelValue) {
    if (!photoUrls.value[photo]) {
      photoUrls.value[photo] = await getThumbnailUrl(photo);
    }
  }
}

watch(() => props.modelValue, loadPhotoUrls, { immediate: true });

async function handleAddClick() {
  const remaining = 9 - props.modelValue.length;
  if (remaining <= 0) {
    alert('最多只能添加9张照片');
    return;
  }

  if (defaultMethod.value) {
    await addPhotosWithMethod(defaultMethod.value);
  } else {
    showMethodPicker.value = true;
  }
}

async function selectMethod(method: 'camera' | 'gallery') {
  showMethodPicker.value = false;

  if (rememberChoice.value) {
    const store = await load('settings.json', { defaults: {} });
    await store.set('photoMethod', method);
    await store.save();
    defaultMethod.value = method;
  }

  await addPhotosWithMethod(method);
}

async function addPhotosWithMethod(method: 'camera' | 'gallery') {
  uploading.value = true;
  try {
    const remaining = 9 - props.modelValue.length;
    const photos = method === 'camera'
      ? await takePhoto()
      : await selectPhotos();

    if (photos.length > 0) {
      emit('update:modelValue', [...props.modelValue, ...photos.slice(0, remaining)]);
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
