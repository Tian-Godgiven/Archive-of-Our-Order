<template>
  <div class="min-h-screen bg-gray-50 pb-4" @click="actionMenuMember = null">
    <div class="max-w-md mx-auto">
      <!-- 固定顶部栏 -->
      <div class="sticky top-0 bg-white shadow-sm px-3 py-2 flex items-center justify-between z-10">
        <button @click="$router.push('/our')" class="text-gray-600 p-2 -ml-2">
          <ChevronLeft :size="24" />
        </button>
        <h1 class="text-xl font-semibold">成员管理</h1>
        <button @click="openAddModal" class="text-blue-500 p-2 -mr-2">
          <Plus :size="22" />
        </button>
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
            <div class="relative">
              <button
                @click.stop="toggleActionMenu(member)"
                class="px-3 py-1 text-gray-600 hover:text-gray-800"
              >
                <MoreVertical :size="20" />
              </button>

              <!-- 下拉菜单 -->
              <DropdownMenu :visible="actionMenuMember?.id === member.id">
                <button
                  @click="handleToggleDefault(member)"
                  class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition flex items-center justify-between"
                >
                  <span>默认家庭组</span>
                  <Check v-if="member.isDefault" :size="16" class="text-blue-500" />
                </button>
                <button
                  @click="handleEdit(member)"
                  class="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition"
                >
                  编辑
                </button>
                <button
                  @click="handleDelete(member)"
                  class="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-gray-50 transition"
                >
                  删除
                </button>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <div v-if="members.length === 0" class="text-center text-gray-500 py-8">
          还没有添加成员
        </div>
      </div>

      <!-- 添加/编辑成员弹窗 -->
      <ModalOverlay :visible="showMemberModal" @close="showMemberModal = false">
        <div class="bg-white rounded-lg p-6 m-4 max-w-sm w-full" @click.stop>
          <h3 class="text-lg font-semibold mb-4">{{ editingMember ? '编辑成员' : '添加成员' }}</h3>
          <input
            v-model="memberName"
            type="text"
            placeholder="输入成员名字..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            @keyup.enter="confirmMember"
          />
          <div class="flex gap-3">
            <button @click="confirmMember" class="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">确认</button>
            <button @click="showMemberModal = false" class="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">取消</button>
          </div>
        </div>
      </ModalOverlay>

      <!-- 删除确认弹窗 -->
      <ModalOverlay :visible="showDeleteModal" @close="showDeleteModal = false">
        <div class="bg-white rounded-lg p-6 m-4 max-w-sm w-full" @click.stop>
          <h3 class="text-lg font-semibold mb-2">删除成员</h3>
          <p class="text-gray-600 text-sm mb-4">确定要删除成员「{{ deletingMember?.name }}」吗？</p>
          <div class="flex gap-3">
            <button @click="confirmDelete" class="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">删除</button>
            <button @click="showDeleteModal = false" class="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">取消</button>
          </div>
        </div>
      </ModalOverlay>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMemberStore } from '@/stores/memberStore';
import type { Member } from '@/types';
import { generateId } from '@/utils/storage';
import ModalOverlay from '@/components/ModalOverlay.vue';
import DropdownMenu from '@/components/DropdownMenu.vue';
import { ChevronLeft, Plus, MoreVertical, Check } from 'lucide-vue-next';

const memberStore = useMemberStore();
const members = computed(() => memberStore.members);

const showMemberModal = ref(false);
const memberName = ref('');
const editingMember = ref<Member | null>(null);

const showDeleteModal = ref(false);
const deletingMember = ref<Member | null>(null);
const actionMenuMember = ref<Member | null>(null);

function toggleActionMenu(member: Member) {
  actionMenuMember.value = actionMenuMember.value?.id === member.id ? null : member;
}

function handleToggleDefault(member: Member) {
  toggleDefault(member);
  actionMenuMember.value = null;
}

function handleEdit(member: Member) {
  openEditModal(member);
  actionMenuMember.value = null;
}

function handleDelete(member: Member) {
  openDeleteModal(member);
  actionMenuMember.value = null;
}

onMounted(() => {
  memberStore.loadData();
});

function openAddModal() {
  editingMember.value = null;
  memberName.value = '';
  showMemberModal.value = true;
}

function openEditModal(member: Member) {
  editingMember.value = member;
  memberName.value = member.name;
  showMemberModal.value = true;
}

function confirmMember() {
  if (!memberName.value.trim()) return;
  if (editingMember.value) {
    memberStore.saveMember({ ...editingMember.value, name: memberName.value.trim() });
  } else {
    const member: Member = {
      id: generateId(),
      name: memberName.value.trim(),
      isDefault: false,
      createdAt: Date.now(),
    };
    memberStore.saveMember(member);
  }
  showMemberModal.value = false;
}

function openDeleteModal(member: Member) {
  deletingMember.value = member;
  showDeleteModal.value = true;
}

function confirmDelete() {
  if (deletingMember.value) {
    memberStore.deleteMember(deletingMember.value.id);
  }
  showDeleteModal.value = false;
}

function toggleDefault(member: Member) {
  memberStore.saveMember({ ...member, isDefault: !member.isDefault });
}
</script>
