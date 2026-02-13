import { defineStore } from 'pinia';
import type { Recipe, CookingRecord } from '@/types';
import * as storage from '@/utils/storage';

export const useRecipeStore = defineStore('recipe', {
  state: () => ({
    recipes: [] as Recipe[],
    records: [] as CookingRecord[],
    loading: false,
  }),

  getters: {
    // 获取可见的菜谱（不包括隐藏的）
    visibleRecipes: (state) => {
      return state.recipes.filter(r => !r.hideFromHome);
    },

    // 根据ID获取菜谱
    getRecipeById: (state) => (id: string) => {
      return state.recipes.find(r => r.id === id);
    },

    // 获取某个菜谱的所有记录
    getRecordsByRecipeId: (state) => (recipeId: string) => {
      return state.records
        .filter(r => r.recipeId === recipeId)
        .sort((a, b) => b.createdAt - a.createdAt);
    },

    // 获取菜谱的平均难度
    getAverageDifficulty: (state) => (recipeId: string) => {
      const records = state.records.filter(r => r.recipeId === recipeId && r.difficulty);
      if (records.length === 0) return 0;
      const sum = records.reduce((acc, r) => acc + (r.difficulty || 0), 0);
      return sum / records.length;
    },

    // 获取菜谱的平均时长
    getAverageDuration: (state) => (recipeId: string) => {
      const records = state.records.filter(r => r.recipeId === recipeId && r.duration);
      if (records.length === 0) return 0;
      const sum = records.reduce((acc, r) => acc + (r.duration || 0), 0);
      return sum / records.length;
    },

    // 获取菜谱最后一次做的时间
    getLastCookedTime: (state) => (recipeId: string) => {
      const records = state.records.filter(r => r.recipeId === recipeId);
      if (records.length === 0) return 0;
      return Math.max(...records.map(r => r.createdAt));
    },
  },

  actions: {
    async loadData() {
      this.loading = true;
      try {
        this.recipes = await storage.getRecipes();
        this.records = await storage.getRecords();
      } finally {
        this.loading = false;
      }
    },

    async saveRecipe(recipe: Recipe) {
      await storage.saveRecipe(recipe);
      await this.loadData();
    },

    async deleteRecipe(id: string) {
      await storage.deleteRecipe(id);
      await this.loadData();
    },

    async saveRecord(record: CookingRecord) {
      await storage.saveRecord(record);
      await this.loadData();
    },

    async deleteRecord(id: string) {
      await storage.deleteRecord(id);
      await this.loadData();
    },
  },
});
