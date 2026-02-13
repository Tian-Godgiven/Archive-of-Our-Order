<template>
  <div
    class="min-h-screen bg-gray-50 pb-4"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div class="max-w-md mx-auto" v-if="recipe">
      <!-- 固定顶部栏 -->
      <div class="sticky top-0 bg-white shadow-sm p-4 flex items-center justify-between z-10">
        <button @click="$router.back()" class="text-gray-600">← 返回</button>
        <h1 class="text-xl font-semibold">{{ recipe.name }}</h1>
        <div class="flex gap-2">
          <button @click="showSettings = true" class="text-blue-500">设置</button>
          <button @click="addRecord" class="text-blue-500">添加</button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="p-4 space-y-4">
        <!-- 基本信息 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div class="flex items-center gap-4 text-sm mb-3">
            <span>⭐ {{ averageDifficulty.toFixed(1) }}</span>
            <span>⏱️ {{ Math.round(averageDuration) }}分钟</span>
            <span>📝 {{ records.length }}次</span>
          </div>
          <div class="text-red-500 font-medium mb-3">
            {{ timeSinceLastCooked }}
          </div>

          <!-- 厨师总评 -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-sm font-medium text-gray-700">厨师总评</label>
              <button @click="editingComment = true" class="text-blue-500 text-sm">编辑</button>
            </div>
            <div v-if="!editingComment" class="text-gray-600">
              {{ recipe.chefComment || '暂无总评' }}
            </div>
            <div v-else>
              <textarea
                v-model="newComment"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              ></textarea>
              <div class="flex gap-2 mt-2">
                <button @click="saveComment" class="px-3 py-1 bg-blue-500 text-white rounded text-sm">保存</button>
                <button @click="editingComment = false" class="px-3 py-1 bg-gray-200 rounded text-sm">取消</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 最完美食材列表 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <div class="flex items-center justify-between mb-2">
            <label class="text-sm font-medium text-gray-700">最完美食材列表</label>
            <button @click="selectBestIngredients" class="text-blue-500 text-sm">选择</button>
          </div>
          <div class="text-gray-600 whitespace-pre-wrap">
            {{ bestIngredients || '未设置' }}
          </div>
        </div>

        <!-- 做菜记录列表 -->
        <div class="space-y-3">
          <h2 class="text-lg font-semibold">做菜记录</h2>
          <div
            v-for="record in records"
            :key="record.id"
            @click="goToRecord(record.id)"
            class="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition"
          >
            <div class="flex items-start gap-3">
              <img
                v-if="record.photos.length > 0"
                :src="record.photos[0]"
                class="w-16 h-16 rounded object-cover"
              />
              <div class="flex-1">
                <div class="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <span>第{{ record.count }}次</span>
                  <span>{{ formatDate(record.createdAt) }}</span>
                </div>
                <div class="text-gray-800 line-clamp-2">
                  {{ record.notes || '暂无心得' }}
                </div>
              </div>
            </div>
          </div>

          <div v-if="records.length === 0" class="text-center text-gray-500 py-8">
            还没有做菜记录
          </div>
        </div>
      </div>

      <!-- 设置弹窗 -->
      <div v-if="showSettings" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showSettings = false">
        <div class="bg-white rounded-lg p-6 m-4 max-w-sm w-full" @click.stop>
          <h3 class="text-lg font-semibold mb-4">设置</h3>
          <div class="space-y-3">
            <button
              @click="toggleHideFromHome"
              class="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition text-left px-4"
            >
              {{ recipe.hideFromHome ? '显示在首页' : '不显示在首页' }}
            </button>
            <button
              @click="deleteRecipe"
              class="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              删除菜谱
            </button>
          </div>
        </div>
      </div>

      <!-- 选择最完美食材列表弹窗 -->
      <div v-if="showSelectIngredients" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showSelectIngredients = false">
        <div class="bg-white rounded-lg p-6 m-4 max-w-sm w-full max-h-96 overflow-y-auto" @click.stop>
          <h3 class="text-lg font-semibold mb-4">选择最完美食材列表</h3>
          <div class="space-y-2">
            <div
              v-for="record in recordsWithIngredients"
              :key="record.id"
              @click="setBestIngredients(record.id)"
              class="p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <div class="text-sm text-gray-600 mb-1">第{{ record.count }}次 - {{ formatDate(record.createdAt) }}</div>
              <div class="text-gray-800 line-clamp-3 whitespace-pre-wrap">{{ record.ingredients }}</div>
            </div>
          </div>
          <div v-if="recordsWithIngredients.length === 0" class="text-center text-gray-500 py-4">
            暂无可选的食材列表
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecipeStore } from '@/stores/recipeStore';

const route = useRoute();
const router = useRouter();
const recipeStore = useRecipeStore();

const recipeId = route.params.id as string;
const recipe = computed(() => recipeStore.getRecipeById(recipeId));
const records = computed(() => recipeStore.getRecordsByRecipeId(recipeId));

const editingComment = ref(false);
const newComment = ref('');
const showSettings = ref(false);
const showSelectIngredients = ref(false);

// 滑动相关
const touchStartX = ref(0);
const touchEndX = ref(0);
const minSwipeDistance = 50; // 最小滑动距离

const averageDifficulty = computed(() => recipeStore.getAverageDifficulty(recipeId));
const averageDuration = computed(() => recipeStore.getAverageDuration(recipeId));

const timeSinceLastCooked = computed(() => {
  const lastTime = recipeStore.getLastCookedTime(recipeId);
  if (lastTime === 0) return '还没做过';

  const now = Date.now();
  const diff = now - lastTime;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '今天做的';
  if (days === 1) return '昨天做的';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  return `${Math.floor(days / 30)}个月前`;
});

const bestIngredients = computed(() => {
  if (!recipe.value?.bestIngredientsId) return '';
  const record = records.value.find(r => r.id === recipe.value?.bestIngredientsId);
  return record?.ingredients || '';
});

const recordsWithIngredients = computed(() => {
  return records.value.filter(r => r.ingredients && r.ingredients.trim());
});

// 获取当前菜谱在列表中的索引
const currentRecipeIndex = computed(() => {
  return recipeStore.visibleRecipes.findIndex(r => r.id === recipeId);
});

// 获取上一个菜谱
const previousRecipe = computed(() => {
  const index = currentRecipeIndex.value;
  if (index > 0) {
    return recipeStore.visibleRecipes[index - 1];
  }
  return null;
});

// 获取下一个菜谱
const nextRecipe = computed(() => {
  const index = currentRecipeIndex.value;
  if (index >= 0 && index < recipeStore.visibleRecipes.length - 1) {
    return recipeStore.visibleRecipes[index + 1];
  }
  return null;
});

onMounted(() => {
  if (recipe.value) {
    newComment.value = recipe.value.chefComment;
  }
});

// 触摸事件处理
function handleTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX;
}

function handleTouchMove(e: TouchEvent) {
  touchEndX.value = e.touches[0].clientX;
}

function handleTouchEnd() {
  const distance = touchEndX.value - touchStartX.value;

  // 向右滑动（显示上一个菜谱）
  if (distance > minSwipeDistance && previousRecipe.value) {
    router.push(`/recipe/${previousRecipe.value.id}`);
  }

  // 向左滑动（显示下一个菜谱）
  if (distance < -minSwipeDistance && nextRecipe.value) {
    router.push(`/recipe/${nextRecipe.value.id}`);
  }

  // 重置
  touchStartX.value = 0;
  touchEndX.value = 0;
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function saveComment() {
  if (recipe.value) {
    recipeStore.saveRecipe({
      ...recipe.value,
      chefComment: newComment.value,
      updatedAt: Date.now(),
    });
    editingComment.value = false;
  }
}

function selectBestIngredients() {
  showSelectIngredients.value = true;
}

function setBestIngredients(recordId: string) {
  if (recipe.value) {
    recipeStore.saveRecipe({
      ...recipe.value,
      bestIngredientsId: recordId,
      updatedAt: Date.now(),
    });
    showSelectIngredients.value = false;
  }
}

function toggleHideFromHome() {
  if (recipe.value) {
    recipeStore.saveRecipe({
      ...recipe.value,
      hideFromHome: !recipe.value.hideFromHome,
      updatedAt: Date.now(),
    });
    showSettings.value = false;
  }
}

function deleteRecipe() {
  if (confirm('确定要删除这个菜谱吗？所有相关记录也会被删除。')) {
    recipeStore.deleteRecipe(recipeId);
    router.push('/');
  }
}

function addRecord() {
  router.push(`/record/add/${recipeId}`);
}

function goToRecord(recordId: string) {
  router.push(`/record/${recordId}`);
}
</script>
