<template>
  <div class="min-h-screen bg-gray-50 pb-4">
    <div class="max-w-md mx-auto" v-if="recipe">
      <!-- 固定顶部栏 -->
      <div class="sticky top-0 bg-white shadow-sm px-3 py-2 flex items-center justify-between z-10">
        <button @click="$router.push(`/recipe/${recipeId}`)" class="text-gray-600 p-2 -ml-2">
          <ChevronLeft :size="24" />
        </button>
        <h1 class="text-lg font-semibold">{{ recipe.name }}</h1>
        <button @click="saveRecord" class="text-blue-500">保存</button>
      </div>

      <!-- 内容区域 -->
      <div class="p-4 space-y-4">
        <!-- 次数和日期 -->
        <div class="bg-white rounded-lg p-4 shadow-sm flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">第{{ nextCount }}次</span>
          <span class="text-sm text-gray-500">{{ todayStr }}</span>
        </div>

        <!-- 食材列表 -->
        <div class="bg-white rounded-lg p-4 shadow-sm" :class="!expandIngredients ? 'cursor-pointer' : ''" @click="!expandIngredients && (expandIngredients = true)">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 cursor-pointer" @click.stop="expandIngredients = !expandIngredients">
              <ChevronDown :size="16" class="text-gray-400 transition-transform" :class="expandIngredients ? 'rotate-180' : ''" />
              <h3 class="text-sm font-medium text-gray-700">食材列表</h3>
            </div>
            <label v-if="expandIngredients" class="flex items-center gap-1 text-sm cursor-pointer select-none" @click.stop>
              <input type="checkbox" v-model="updateIngredients" class="accent-blue-500" />
              <span :class="updateIngredients ? 'text-blue-500' : 'text-gray-400'">更新到菜谱</span>
            </label>
          </div>
          <div v-if="expandIngredients" class="mt-3">
            <IngredientEditor v-model="formData.ingredients" />
          </div>
        </div>

        <!-- 制作步骤 -->
        <div class="bg-white rounded-lg p-4 shadow-sm" :class="!expandSteps ? 'cursor-pointer' : ''" @click="!expandSteps && (expandSteps = true)">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 cursor-pointer" @click.stop="expandSteps = !expandSteps">
              <ChevronDown :size="16" class="text-gray-400 transition-transform" :class="expandSteps ? 'rotate-180' : ''" />
              <h3 class="text-sm font-medium text-gray-700">制作步骤</h3>
            </div>
            <label v-if="expandSteps" class="flex items-center gap-1 text-sm cursor-pointer select-none" @click.stop>
              <input type="checkbox" v-model="updateSteps" class="accent-blue-500" />
              <span :class="updateSteps ? 'text-blue-500' : 'text-gray-400'">更新到菜谱</span>
            </label>
          </div>
          <div v-if="expandSteps" class="mt-3">
            <textarea
              v-model="formData.steps"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="6"
              placeholder="输入制作步骤..."
            ></textarea>
          </div>
        </div>

        <!-- 照片、难度、时长、心得 -->
        <div class="bg-white rounded-lg p-4 shadow-sm space-y-4">
          <!-- 照片上传 -->
          <div>
            <PhotoUpload v-model="formData.photos" @view="viewPhoto" />
          </div>

          <!-- 难度 -->
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-medium text-gray-700">难度</h3>
            <StarRating :model-value="formData.difficulty || 0" @update:model-value="formData.difficulty = $event" variant="flame" />
          </div>

          <!-- 时长 -->
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-2">制作时长</h3>
            <div class="flex items-center gap-3">
              <input
                :value="durationHours"
                @input="durationHours = Math.max(0, parseInt(($event.target as HTMLInputElement).value) || 0)"
                type="text"
                inputmode="numeric"
                maxlength="3"
                class="w-12 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                placeholder="0"
              />
              <span class="text-gray-600">时</span>
              <input
                :value="durationMinutes"
                @input="durationMinutes = Math.min(59, Math.max(0, parseInt(($event.target as HTMLInputElement).value) || 0))"
                type="text"
                inputmode="numeric"
                maxlength="2"
                class="w-12 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                placeholder="0"
              />
              <span class="text-gray-600">分</span>
            </div>
          </div>

          <!-- 心得 -->
          <div>
            <h3 class="text-sm font-medium text-gray-700 mb-2">心得</h3>
            <textarea
              v-model="formData.notes"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="写下你的心得..."
            ></textarea>
          </div>
        </div>

        <!-- 家庭成员评价 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-3">家庭成员评价</h3>

          <!-- 默认成员列表 -->
          <div class="space-y-3 mb-3">
            <div
              v-for="member in defaultMembers"
              :key="member.id"
              class="pb-3 border-b border-gray-200 last:border-0"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium">{{ member.name }}</span>
                <StarRating :model-value="getMemberStars(member.id)" @update:model-value="setMemberRating(member.id, member.name, $event)" :size="20" />
              </div>
              <input
                v-if="getMemberStars(member.id) > 0"
                v-model="getMemberRating(member.id).comment"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="评语（可选）"
              />
            </div>

            <!-- 临时成员列表 -->
            <div
              v-for="rating in tempRatings"
              :key="rating.memberId"
              class="pb-3 border-b border-gray-200 last:border-0"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium">{{ rating.memberName }}</span>
                <StarRating :model-value="rating.stars" @update:model-value="rating.stars = $event" :size="20" />
              </div>
              <input
                v-if="rating.stars > 0"
                v-model="rating.comment"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="评语（可选）"
              />
            </div>
          </div>

          <!-- 添加临时成员 -->
          <button
            @click="addTempMember"
            class="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition"
          >
            + 添加临时成员
          </button>
        </div>
      </div>

      <!-- 全屏照片查看器 -->
      <PhotoViewer
        v-model:visible="showPhotoViewer"
        :photos="formData.photos"
        :initial-index="photoViewerIndex"
      />

      <!-- 添加临时成员弹窗 -->
      <ModalOverlay :visible="showAddTempMember" @close="showAddTempMember = false">
        <div class="bg-white rounded-lg p-6 m-4 max-w-sm w-full" @click.stop>
          <h3 class="text-lg font-semibold mb-4">添加临时成员</h3>
          <input
            v-model="tempMemberName"
            type="text"
            placeholder="输入成员名字..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            @keyup.enter="confirmAddTempMember"
          />
          <div class="flex gap-3">
            <button @click="confirmAddTempMember" class="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">确认</button>
            <button @click="showAddTempMember = false" class="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">取消</button>
          </div>
        </div>
      </ModalOverlay>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecipeStore } from '@/stores/recipeStore';
import { useMemberStore } from '@/stores/memberStore';
import type { CookingRecord, MemberRating } from '@/types';
import { generateId } from '@/utils/storage';
import PhotoUpload from '@/components/PhotoUpload.vue';
import PhotoViewer from '@/components/PhotoViewer.vue';
import StarRating from '@/components/StarRating.vue';
import { ChevronDown, ChevronLeft } from 'lucide-vue-next';
import ModalOverlay from '@/components/ModalOverlay.vue';
import IngredientEditor from '@/components/IngredientEditor.vue';

const route = useRoute();
const router = useRouter();
const recipeStore = useRecipeStore();
const memberStore = useMemberStore();

const recipeId = route.params.recipeId as string;
const recipe = computed(() => recipeStore.getRecipeById(recipeId));
const defaultMembers = computed(() => memberStore.defaultMembers);
const tempRatings = computed(() => formData.value.ratings.filter(r => r.memberId.startsWith('temp_')));

const formData = ref({
  photos: [] as string[],
  ingredients: '',
  steps: '',
  difficulty: undefined as number | undefined,
  duration: undefined as number | undefined,
  notes: '',
  ratings: [] as MemberRating[],
});

const nextCount = computed(() => recipeStore.getRecordsByRecipeId(recipeId).length + 1);
const todayStr = computed(() => {
  const d = new Date();
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
});
const photoViewerIndex = ref(0);
const updateIngredients = ref(false);
const updateSteps = ref(false);
const expandIngredients = ref(false);
const expandSteps = ref(false);
const showAddTempMember = ref(false);
const tempMemberName = ref('');

// 时长拆分为时和分，保存时合并为总分钟数
const durationHours = computed({
  get: () => Math.floor((formData.value.duration || 0) / 60),
  set: (val: number) => {
    formData.value.duration = (val || 0) * 60 + durationMinutes.value;
  },
});
const durationMinutes = computed({
  get: () => (formData.value.duration || 0) % 60,
  set: (val: number) => {
    formData.value.duration = durationHours.value * 60 + (val || 0);
  },
});

onMounted(() => {
  recipeStore.loadData();
  memberStore.loadData();
  if (recipe.value) {
    formData.value.ingredients = recipe.value.ingredients || '';
    formData.value.steps = recipe.value.steps || '';
  } else {
    const unwatch = watch(recipe, (val) => {
      if (val) {
        formData.value.ingredients = val.ingredients || '';
        formData.value.steps = val.steps || '';
        unwatch();
      }
    });
  }
});

function getMemberRating(memberId: string): MemberRating {
  let rating = formData.value.ratings.find(r => r.memberId === memberId);
  if (!rating) {
    rating = { memberId, memberName: '', stars: 0 };
    formData.value.ratings.push(rating);
  }
  return rating;
}

function getMemberStars(memberId: string): number {
  return getMemberRating(memberId).stars;
}

function setMemberRating(memberId: string, memberName: string, stars: number) {
  const rating = getMemberRating(memberId);
  rating.memberName = memberName;
  rating.stars = stars;
}

function addTempMember() {
  tempMemberName.value = '';
  showAddTempMember.value = true;
}

function confirmAddTempMember() {
  if (tempMemberName.value.trim()) {
    const tempId = `temp_${generateId()}`;
    setMemberRating(tempId, tempMemberName.value.trim(), 0);
  }
  showAddTempMember.value = false;
}

function viewPhoto(photo: string) {
  const index = formData.value.photos.indexOf(photo);
  if (index >= 0) {
    photoViewerIndex.value = index;
    showPhotoViewer.value = true;
  }
}

function saveRecord() {
  if (!recipe.value) return;

  // 计算这是第几次做
  const existingRecords = recipeStore.getRecordsByRecipeId(recipeId);
  const count = existingRecords.length + 1;

  // 过滤掉没有评分的成员
  const validRatings = formData.value.ratings.filter(r => r.stars > 0);

  const record: CookingRecord = {
    id: generateId(),
    recipeId,
    photos: formData.value.photos,
    ingredients: formData.value.ingredients,
    steps: formData.value.steps,
    difficulty: formData.value.difficulty,
    duration: formData.value.duration,
    notes: formData.value.notes,
    count,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ratings: validRatings,
  };

  recipeStore.saveRecord(record);

  // 根据开关状态更新菜谱默认值
  if (updateIngredients.value || updateSteps.value) {
    recipeStore.saveRecipe({
      ...recipe.value,
      ...(updateIngredients.value && { ingredients: formData.value.ingredients }),
      ...(updateSteps.value && { steps: formData.value.steps }),
      updatedAt: Date.now(),
    });
  }

  router.push(`/recipe/${recipeId}`);
}
</script>
