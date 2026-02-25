<template>
  <div class="min-h-screen bg-gray-50 pb-4" @click="showMenu = false">
    <div class="max-w-md mx-auto" v-if="record && recipe">
      <!-- 固定顶部栏 -->
      <div class="sticky top-0 bg-white shadow-sm px-3 py-2 flex items-center justify-between z-10">
        <button @click="goBack" class="text-gray-600 p-2 -ml-2">
          <ChevronLeft :size="24" />
        </button>
        <h1 class="text-lg font-semibold">{{ recipe.name }}</h1>
        <div v-if="!memberIdFromQuery" class="relative">
          <button @click.stop="showMenu = !showMenu" class="text-gray-600 p-2 -mr-2">
            <MoreVertical :size="22" />
          </button>
          <DropdownMenu :visible="showMenu">
            <button
              @click="showMenu = false; router.push(`/record/edit/${recordId}`)"
              class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition"
            >
              编辑记录
            </button>
            <button
              @click="showMenu = false; deleteRecord()"
              class="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-50 transition"
            >
              删除记录
            </button>
          </DropdownMenu>
        </div>
        <div v-else class="w-10"></div>
      </div>

      <!-- 查看模式 -->
      <div class="p-4 space-y-4">
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
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700">第{{ record.count }}次</span>
            <span class="text-sm text-gray-500">{{ formatDate(record.createdAt) }}</span>
          </div>
          <div v-if="record.difficulty" class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-700">难度：</span>
            <span class="flex items-center text-yellow-500"><Star v-for="i in record.difficulty" :key="i" :size="16" /></span>
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
                <span class="flex items-center text-yellow-500"><Star v-for="i in rating.stars" :key="i" :size="16" /></span>
              </div>
              <div v-if="rating.comment" class="text-gray-600 text-sm">{{ rating.comment }}</div>
            </div>
          </div>
        </div>

        <!-- memberIdFromQuery 模式下的删除评价按钮 -->
        <button v-if="memberIdFromQuery" @click="deleteRecord" class="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
          删除该评价
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
import { getPhotoUrl } from '@/utils/photo';
import PhotoViewer from '@/components/PhotoViewer.vue';
import DropdownMenu from '@/components/DropdownMenu.vue';
import { ChevronLeft, Star, MoreVertical } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const recipeStore = useRecipeStore();

const recordId = route.params.id as string;
const memberIdFromQuery = route.query.memberId as string | undefined;
const record = computed(() => recipeStore.records.find(r => r.id === recordId));
const recipe = computed(() => record.value ? recipeStore.getRecipeById(record.value.recipeId) : null);

const showPhotoViewer = ref(false);
const photoViewerIndex = ref(0);
const showMenu = ref(false);

onMounted(() => {
  recipeStore.loadData();
});

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function deleteRecord() {
  if (memberIdFromQuery) {
    if (confirm('确定要删除该成员的评价吗？')) {
      recipeStore.saveRecord({
        ...record.value!,
        ratings: record.value!.ratings.filter(r => r.memberId !== memberIdFromQuery),
        updatedAt: Date.now(),
      });
      goBack();
    }
  } else {
    if (confirm('确定要删除这条记录吗？')) {
      recipeStore.deleteRecord(recordId);
      goBack();
    }
  }
}

function goBack() {
  if (recipe.value) {
    router.push(`/recipe/${recipe.value.id}`);
  } else {
    router.push('/');
  }
}

function openPhotoViewer(index: number) {
  photoViewerIndex.value = index;
  showPhotoViewer.value = true;
}
</script>
