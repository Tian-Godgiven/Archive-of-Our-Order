<template>
  <div class="min-h-screen bg-gray-50 pb-4">
    <div class="max-w-md mx-auto">
      <!-- 固定顶部栏 -->
      <div class="sticky top-0 bg-white shadow-sm p-4 flex items-center justify-between z-10">
        <button @click="$router.back()" class="text-gray-600">← 返回</button>
        <h1 class="text-xl font-semibold">成员管理</h1>
        <button @click="addMember" class="text-blue-500">添加</button>
      </div>

      <!-- 内容区域 -->
      <div class="p-4 space-y-3">
        <div
          v-for="member in members"
          :key="member.id"
          class="bg-white rounded-lg p-4 shadow-sm"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {{ member.name.charAt(0) }}
              </div>
              <div>
                <div class="font-medium">{{ member.name }}</div>
                <div v-if="member.isDefault" class="text-xs text-blue-500">默认家庭组</div>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="toggleDefault(member)"
                class="px-3 py-1 rounded text-sm"
                :class="member.isDefault ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'"
              >
                {{ member.isDefault ? '默认' : '设为默认' }}
              </button>
              <button
                @click="editMember(member)"
                class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm"
              >
                编辑
              </button>
              <button
                @click="deleteMember(member)"
                class="px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                删除
              </button>
            </div>
          </div>
        </div>

        <div v-if="members.length === 0" class="text-center text-gray-500 py-8">
          还没有添加成员
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useMemberStore } from '@/stores/memberStore';
import type { Member } from '@/types';
import { generateId } from '@/utils/storage';

const memberStore = useMemberStore();
const members = computed(() => memberStore.members);

onMounted(() => {
  memberStore.loadData();
});

function addMember() {
  const name = prompt('请输入成员名字：');
  if (name) {
    const member: Member = {
      id: generateId(),
      name,
      isDefault: false,
      createdAt: Date.now(),
    };
    memberStore.saveMember(member);
  }
}

function editMember(member: Member) {
  const name = prompt('请输入新名字：', member.name);
  if (name && name !== member.name) {
    memberStore.saveMember({
      ...member,
      name,
    });
  }
}

function toggleDefault(member: Member) {
  memberStore.saveMember({
    ...member,
    isDefault: !member.isDefault,
  });
}

function deleteMember(member: Member) {
  if (confirm(`确定要删除成员"${member.name}"吗？`)) {
    memberStore.deleteMember(member.id);
  }
}
</script>
