<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="max-w-md mx-auto">
      <!-- 固定顶部栏 -->
      <div class="sticky top-0 bg-white shadow-sm p-4 flex items-center justify-between z-10">
        <h1 class="text-xl font-semibold">我们</h1>
        <button @click="$router.push('/members')" class="text-blue-500">设置</button>
      </div>

      <!-- 成员筛选栏 -->
      <div class="bg-white p-4 shadow-sm overflow-x-auto">
        <div class="flex gap-3">
          <button
            @click="selectedMemberId = null"
            :class="[
              'px-4 py-2 rounded-full whitespace-nowrap',
              selectedMemberId === null ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            ]"
          >
            全部
          </button>
          <button
            v-for="member in members"
            :key="member.id"
            @click="selectedMemberId = member.id"
            :class="[
              'px-4 py-2 rounded-full whitespace-nowrap',
              selectedMemberId === member.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
            ]"
          >
            {{ member.name }}
          </button>
        </div>
      </div>

      <!-- 评价记录列表 -->
      <div class="p-4 space-y-3">
        <div
          v-for="item in filteredRatings"
          :key="`${item.recordId}-${item.rating.memberId}`"
          @click="goToRecord(item.recordId)"
          class="bg-white rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md transition"
        >
          <div class="flex items-start justify-between mb-2">
            <div>
              <h3 class="font-semibold text-lg">{{ item.recipeName }}</h3>
              <div class="text-sm text-gray-600">
                {{ item.rating.memberName }} · {{ formatDate(item.createdAt) }}
              </div>
            </div>
            <div class="text-yellow-500">
              {{ '⭐'.repeat(item.rating.stars) }}
            </div>
          </div>
          <div v-if="item.rating.comment" class="text-gray-600 text-sm">
            {{ item.rating.comment }}
          </div>
        </div>

        <div v-if="filteredRatings.length === 0" class="text-center text-gray-500 py-8">
          {{ selectedMemberId ? '该成员还没有评价记录' : '还没有评价记录' }}
        </div>
      </div>

      <!-- 底部导航 -->
      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
        <button @click="$router.push('/')" class="flex-1 py-3 text-gray-600">菜谱</button>
        <button class="flex-1 py-3 text-blue-500 font-medium">我们</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRecipeStore } from '@/stores/recipeStore';
import { useMemberStore } from '@/stores/memberStore';

const router = useRouter();
const recipeStore = useRecipeStore();
const memberStore = useMemberStore();

const selectedMemberId = ref<string | null>(null);
const members = computed(() => memberStore.members);

interface RatingItem {
  recordId: string;
  recipeName: string;
  createdAt: number;
  rating: {
    memberId: string;
    memberName: string;
    stars: number;
    comment?: string;
  };
}

const allRatings = computed(() => {
  const items: RatingItem[] = [];

  for (const record of recipeStore.records) {
    const recipe = recipeStore.getRecipeById(record.recipeId);
    if (!recipe) continue;

    for (const rating of record.ratings) {
      items.push({
        recordId: record.id,
        recipeName: recipe.name,
        createdAt: record.createdAt,
        rating,
      });
    }
  }

  // 按时间倒序排列
  return items.sort((a, b) => b.createdAt - a.createdAt);
});

const filteredRatings = computed(() => {
  if (selectedMemberId.value === null) {
    return allRatings.value;
  }
  return allRatings.value.filter(item => item.rating.memberId === selectedMemberId.value);
});

onMounted(() => {
  recipeStore.loadData();
  memberStore.loadData();
});

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function goToRecord(recordId: string) {
  router.push(`/record/${recordId}`);
}
</script>
