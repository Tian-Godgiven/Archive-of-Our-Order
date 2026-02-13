<template>
  <div class="min-h-screen bg-gray-50 pb-4">
    <div class="max-w-md mx-auto" v-if="record && recipe">
      <!-- 固定顶部栏 -->
      <div class="sticky top-0 bg-white shadow-sm p-4 flex items-center justify-between z-10">
        <button @click="goBack" class="text-gray-600">← 返回</button>
        <h1 class="text-lg font-semibold">第{{ record.count }}次 · {{ formatDate(record.createdAt) }}</h1>
        <button v-if="!isEditing" @click="startEdit" class="text-blue-500">编辑</button>
        <button v-else @click="saveEdit" class="text-blue-500">保存</button>
      </div>

      <!-- 查看模式 -->
      <div v-if="!isEditing" class="p-4 space-y-4">
        <!-- 照片相册 -->
        <div v-if="record.photos.length > 0" class="bg-white rounded-lg p-4 shadow-sm">
          <div class="flex gap-2 overflow-x-auto">
            <img
              v-for="(photo, index) in record.photos"
              :key="index"
              :src="getPhotoUrl(photo)"
              class="w-32 h-32 rounded object-cover cursor-pointer"
              @click="openPhotoViewer(index)"
            />
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="bg-white rounded-lg p-4 shadow-sm space-y-3">
          <div v-if="record.difficulty" class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700">难度：</span>
            <span class="text-yellow-500">{{ '⭐'.repeat(record.difficulty) }}</span>
          </div>
          <div v-if="record.duration" class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700">时长：</span>
            <span class="text-gray-600">{{ record.duration }}分钟</span>
          </div>
        </div>

        <!-- 食材列表 -->
        <div v-if="record.ingredients" class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-2">食材列表</h3>
          <div class="text-gray-600 whitespace-pre-wrap">{{ record.ingredients }}</div>
        </div>

        <!-- 制作步骤 -->
        <div v-if="record.steps" class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-2">制作步骤</h3>
          <div class="text-gray-600 whitespace-pre-wrap">{{ record.steps }}</div>
        </div>

        <!-- 心得 -->
        <div v-if="record.notes" class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-2">心得</h3>
          <div class="text-gray-600 whitespace-pre-wrap">{{ record.notes }}</div>
        </div>

        <!-- 家庭成员评价 -->
        <div v-if="record.ratings.length > 0" class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-3">家庭成员评价</h3>
          <div class="space-y-3">
            <div v-for="rating in record.ratings" :key="rating.memberId" class="border-b border-gray-200 pb-3 last:border-0">
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium">{{ rating.memberName }}</span>
                <span class="text-yellow-500">{{ '⭐'.repeat(rating.stars) }}</span>
              </div>
              <div v-if="rating.comment" class="text-gray-600 text-sm">{{ rating.comment }}</div>
            </div>
          </div>
        </div>

        <!-- 删除按钮 -->
        <button @click="deleteRecord" class="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
          删除记录
        </button>
      </div>

      <!-- 编辑模式 -->
      <div v-else class="p-4 space-y-4">
        <!-- 照片上传 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-2">照片</h3>
          <PhotoUpload v-model="editData.photos" @view="viewPhoto" />
        </div>

        <!-- 食材列表 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-2">食材列表</h3>
          <textarea
            v-model="editData.ingredients"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="输入食材列表..."
          ></textarea>
        </div>

        <!-- 制作步骤 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-2">制作步骤</h3>
          <textarea
            v-model="editData.steps"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="6"
            placeholder="输入制作步骤..."
          ></textarea>
        </div>

        <!-- 难度 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-2">难度</h3>
          <div class="flex gap-2">
            <button
              v-for="star in 5"
              :key="star"
              @click="editData.difficulty = star"
              class="text-2xl"
              :class="star <= (editData.difficulty || 0) ? 'text-yellow-500' : 'text-gray-300'"
            >
              ⭐
            </button>
          </div>
        </div>

        <!-- 时长 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-2">制作时长（分钟）</h3>
          <input
            v-model.number="editData.duration"
            type="number"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入时长..."
          />
        </div>

        <!-- 心得 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-2">心得</h3>
          <textarea
            v-model="editData.notes"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="写下你的心得..."
          ></textarea>
        </div>

        <!-- 取消按钮 -->
        <button @click="cancelEdit" class="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
          取消
        </button>
      </div>
    </div>

    <!-- 全屏照片查看器 -->
    <PhotoViewer
      v-model:visible="showPhotoViewer"
      :photos="record?.photos || []"
      :initial-index="photoViewerIndex"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecipeStore } from '@/stores/recipeStore';
import type { CookingRecord } from '@/types';
import { getPhotoUrl } from '@/utils/photo';
import PhotoUpload from '@/components/PhotoUpload.vue';
import PhotoViewer from '@/components/PhotoViewer.vue';

const route = useRoute();
const router = useRouter();
const recipeStore = useRecipeStore();

const recordId = route.params.id as string;
const record = computed(() => recipeStore.records.find(r => r.id === recordId));
const recipe = computed(() => record.value ? recipeStore.getRecipeById(record.value.recipeId) : null);

const isEditing = ref(false);
const editData = ref<Partial<CookingRecord>>({});
const showPhotoViewer = ref(false);
const photoViewerIndex = ref(0);

onMounted(() => {
  recipeStore.loadData();
});

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function startEdit() {
  if (record.value) {
    editData.value = { ...record.value };
    isEditing.value = true;
  }
}

function saveEdit() {
  if (record.value && editData.value) {
    recipeStore.saveRecord({
      ...record.value,
      ...editData.value,
      updatedAt: Date.now(),
    } as CookingRecord);
    isEditing.value = false;
  }
}

function cancelEdit() {
  isEditing.value = false;
  editData.value = {};
}

function deleteRecord() {
  if (confirm('确定要删除这条记录吗？')) {
    recipeStore.deleteRecord(recordId);
    goBack();
  }
}

function goBack() {
  if (recipe.value) {
    router.push(`/recipe/${recipe.value.id}`);
  } else {
    router.back();
  }
}

function openPhotoViewer(index: number) {
  photoViewerIndex.value = index;
  showPhotoViewer.value = true;
}

function viewPhoto(photo: string) {
  // 这个函数用于 PhotoUpload 组件的 @view 事件
  const index = record.value?.photos.indexOf(photo) || 0;
  openPhotoViewer(index);
}
</script>
