<template>
  <div class="min-h-screen bg-gray-50 pb-4">
    <div class="max-w-md mx-auto" v-if="recipe">
      <!-- 固定顶部栏 -->
      <div class="sticky top-0 bg-white shadow-sm p-4 flex items-center justify-between z-10">
        <button @click="$router.back()" class="text-gray-600">← 返回</button>
        <h1 class="text-lg font-semibold">{{ recipe.name }}</h1>
        <button @click="saveRecord" class="text-blue-500">保存</button>
      </div>

      <!-- 内容区域 -->
      <div class="p-4 space-y-4">
        <!-- 照片上传 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-2">照片</h3>
          <PhotoUpload v-model="formData.photos" @view="viewPhoto" />
        </div>

        <!-- 食材列表 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-2">食材列表</h3>
          <textarea
            v-model="formData.ingredients"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="输入食材列表..."
          ></textarea>
        </div>

        <!-- 制作步骤 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-2">制作步骤</h3>
          <textarea
            v-model="formData.steps"
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
              @click="formData.difficulty = star"
              class="text-2xl"
              :class="star <= (formData.difficulty || 0) ? 'text-yellow-500' : 'text-gray-300'"
            >
              ⭐
            </button>
          </div>
        </div>

        <!-- 时长 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-2">制作时长（分钟）</h3>
          <input
            v-model.number="formData.duration"
            type="number"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入时长..."
          />
        </div>

        <!-- 心得 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-2">心得</h3>
          <textarea
            v-model="formData.notes"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="写下你的心得..."
          ></textarea>
        </div>

        <!-- 家庭成员评价 -->
        <div class="bg-white rounded-lg p-4 shadow-sm">
          <h3 class="text-sm font-medium text-gray-700 mb-3">家庭成员评价</h3>

          <!-- 默认成员列表 -->
          <div class="space-y-3 mb-3">
            <div
              v-for="member in defaultMembers"
              :key="member.id"
              class="border border-gray-200 rounded-lg p-3"
            >
              <div class="flex items-center justify-between mb-2">
                <span class="font-medium">{{ member.name }}</span>
                <div class="flex gap-1">
                  <button
                    v-for="star in 5"
                    :key="star"
                    @click="setMemberRating(member.id, member.name, star)"
                    class="text-lg"
                    :class="star <= getMemberStars(member.id) ? 'text-yellow-500' : 'text-gray-300'"
                  >
                    ⭐
                  </button>
                </div>
              </div>
              <input
                v-if="getMemberStars(member.id) > 0"
                v-model="getMemberRating(member.id).comment"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecipeStore } from '@/stores/recipeStore';
import { useMemberStore } from '@/stores/memberStore';
import type { CookingRecord, MemberRating } from '@/types';
import { generateId } from '@/utils/storage';
import PhotoUpload from '@/components/PhotoUpload.vue';
import PhotoViewer from '@/components/PhotoViewer.vue';

const route = useRoute();
const router = useRouter();
const recipeStore = useRecipeStore();
const memberStore = useMemberStore();

const recipeId = route.params.recipeId as string;
const recipe = computed(() => recipeStore.getRecipeById(recipeId));
const defaultMembers = computed(() => memberStore.defaultMembers);

const formData = ref({
  photos: [] as string[],
  ingredients: '',
  steps: '',
  difficulty: undefined as number | undefined,
  duration: undefined as number | undefined,
  notes: '',
  ratings: [] as MemberRating[],
});

const showPhotoViewer = ref(false);
const photoViewerIndex = ref(0);

onMounted(() => {
  recipeStore.loadData();
  memberStore.loadData();
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
  const name = prompt('请输入成员名字：');
  if (name) {
    const tempId = `temp_${generateId()}`;
    setMemberRating(tempId, name, 0);
  }
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
  router.push(`/recipe/${recipeId}`);
}
</script>
