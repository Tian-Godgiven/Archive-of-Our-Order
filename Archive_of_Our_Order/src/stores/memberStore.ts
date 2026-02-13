import { defineStore } from 'pinia';
import type { Member } from '@/types';
import * as storage from '@/utils/storage';

export const useMemberStore = defineStore('member', {
  state: () => ({
    members: [] as Member[],
    loading: false,
  }),

  getters: {
    // 获取默认家庭组成员
    defaultMembers: (state) => {
      return state.members.filter(m => m.isDefault);
    },

    // 根据ID获取成员
    getMemberById: (state) => (id: string) => {
      return state.members.find(m => m.id === id);
    },
  },

  actions: {
    async loadData() {
      this.loading = true;
      try {
        this.members = await storage.getMembers();
      } finally {
        this.loading = false;
      }
    },

    async saveMember(member: Member) {
      await storage.saveMember(member);
      await this.loadData();
    },

    async deleteMember(id: string) {
      await storage.deleteMember(id);
      await this.loadData();
    },
  },
});
