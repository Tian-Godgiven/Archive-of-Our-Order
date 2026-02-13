<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-md mx-auto">
      <!-- 顶部搜索和排序 -->
      <div class="bg-white p-4 shadow-sm">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="搜索菜谱..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div class="mt-2 flex gap-2">
          <button
            @click="sortBy = 'default'"
            :class="['px-3 py-1 rounded-lg text-sm', sortBy === 'default' ? 'bg-blue-500 text-white' : 'bg-gray-200']"
          >
            默认排序
          </button>
          <button
            @click="sortBy = 'lastCooked'"
            :class="['px-3 py-1 rounded-lg text-sm', sortBy === 'lastCooked' ? 'bg-blue-500 text-white' : 'bg-gray-200']"
          >
            最久没做
          </button>
        </div>
      </div>

      <!-- 菜谱列表 -->
      <div class="p-4 space-y-3">
        <div
          v-for="recipe in filteredRecipes"
          :key="recipe.id"
          @click="goToRecipe(recipe.id)"
          class="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition"
        >
          <h3 class="text-lg font-semibold mb-2">{{ recipe.name }}</h3>
          <div class="flex items-center gap-4 text-sm text-gray-600">
            <span>⭐ {{ getAverageDifficulty(recipe.id).toFixed(1) }}</span>
            <span>⏱️ {{ Math.round(getAverageDuration(recipe.id)) }}分钟</span>
            <span>📝 {{ getRecordCount(recipe.id) }}次</span>
          </div>
          <div class="mt-2 text-red-500 font-medium">
            {{ getTimeSinceLastCooked(recipe.id) }}
          </div>
        </div>

        <div v-if="filteredRecipes.length === 0" class="text-center text-gray-500 py-8">
          暂无菜谱
        </div>
      </div>

      <!-- 添加按钮 -->
      <button
        @click="showQuickAdd = true"
        class="fixed bottom-20 right-4 w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-blue-600 transition"
      >
        +
      </button>

      <!-- 底部导航 -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
        <button class="flex-1 py-3 text-blue-500 font-medium">菜谱</button>
        <button @click="$router.push('/our')" class="flex-1 py-3 text-gray-600">我们</button>
      </div>

      <!-- 快速添加弹窗 -->
      <div v-if="showQuickAdd" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showQuickAdd = false">
        <div class="bg-white rounded-lg p-6 m-4 max-w-sm w-full" @click.stop>
          <h3 class="text-lg font-semibold mb-4">添加记录</h3>
          <div class="space-y-3">
            <button
              @click="createNewRecipe"
              class="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              创建新菜谱
            </button>
            <button
              @click="showSelectRecipe = true; showQuickAdd = false"
              class="w-full py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              选择已有菜谱
            </button>
          </div>
        </div>
      </div>

      <!-- 选择已有菜谱弹窗 -->
      <div v-if="showSelectRecipe" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="showSelectRecipe = false">
        <div class="bg-white rounded-lg p-6 m-4 max-w-sm w-full max-h-96 flex flex-col" @click.stop>
          <h3 class="text-lg font-semibold mb-4">选择菜谱</h3>

          <!-- 搜索框 -->
          <input
            v-model="selectSearchQuery"
            type="text"
            placeholder="搜索菜谱..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          />

          <!-- 菜谱列表 -->
          <div class="flex-1 overflow-y-auto space-y-2">
            <div
              v-for="recipe in filteredSelectRecipes"
              :key="recipe.id"
              @click="selectRecipeForRecord(recipe.id)"
              class="p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <div class="font-medium">{{ recipe.name }}</div>
              <div class="text-sm text-gray-600">做过 {{ getRecordCount(recipe.id) }} 次</div>
            </div>
          </div>

          <div v-if="filteredSelectRecipes.length === 0" class="text-center text-gray-500 py-4">
            没有找到菜谱
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRecipeStore } from '@/stores/recipeStore';

const router = useRouter();
const recipeStore = useRecipeStore();

const searchQuery = ref('');
const sortBy = ref<'default' | 'lastCooked'>('default');
const showQuickAdd = ref(false);
const showSelectRecipe = ref(false);
const selectSearchQuery = ref('');

onMounted(() => {
  recipeStore.loadData();
});

const filteredRecipes = computed(() => {
  let recipes = recipeStore.visibleRecipes;

  // 搜索过滤
  if (searchQuery.value) {
    recipes = recipes.filter(r =>
      r.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }

  // 排序
  if (sortBy.value === 'lastCooked') {
    recipes = [...recipes].sort((a, b) => {
      const timeA = recipeStore.getLastCookedTime(a.id);
      const timeB = recipeStore.getLastCookedTime(b.id);
      return timeA - timeB; // 最久没做的排前面
    });
  }

  return recipes;
});

const filteredSelectRecipes = computed(() => {
  let recipes = recipeStore.recipes;

  // 搜索过滤
  if (selectSearchQuery.value) {
    recipes = recipes.filter(r =>
      r.name.toLowerCase().includes(selectSearchQuery.value.toLowerCase())
    );
  }

  return recipes;
});

function getAverageDifficulty(recipeId: string) {
  return recipeStore.getAverageDifficulty(recipeId);
}

function getAverageDuration(recipeId: string) {
  return recipeStore.getAverageDuration(recipeId);
}

function getRecordCount(recipeId: string) {
  return recipeStore.getRecordsByRecipeId(recipeId).length;
}

function getTimeSinceLastCooked(recipeId: string) {
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
}

function goToRecipe(id: string) {
  router.push(`/recipe/${id}`);
}

function createNewRecipe() {
  const name = prompt('请输入菜名：');
  if (name) {
    const recipe = {
      id: Date.now().toString(),
      name,
      chefComment: '',
      hideFromHome: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    recipeStore.saveRecipe(recipe);
    router.push(`/record/add/${recipe.id}`);
  }
  showQuickAdd.value = false;
}

function selectRecipeForRecord(recipeId: string) {
  showSelectRecipe.value = false;
  router.push(`/record/add/${recipeId}`);
}
</script>
