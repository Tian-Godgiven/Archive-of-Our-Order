import { Store } from '@tauri-apps/plugin-store';
import type { AppData, Recipe, CookingRecord, Member } from '@/types';

const store = new Store('app-data.json');

// 初始化数据
const initData: AppData = {
  recipes: [],
  records: [],
  members: [],
};

// 获取所有数据
export async function loadData(): Promise<AppData> {
  const data = await store.get<AppData>('data');
  return data || initData;
}

// 保存所有数据
export async function saveData(data: AppData): Promise<void> {
  await store.set('data', data);
  await store.save();
}

// 菜谱相关
export async function getRecipes(): Promise<Recipe[]> {
  const data = await loadData();
  return data.recipes;
}

export async function saveRecipe(recipe: Recipe): Promise<void> {
  const data = await loadData();
  const index = data.recipes.findIndex(r => r.id === recipe.id);
  if (index >= 0) {
    data.recipes[index] = recipe;
  } else {
    data.recipes.push(recipe);
  }
  await saveData(data);
}

export async function deleteRecipe(id: string): Promise<void> {
  const data = await loadData();
  data.recipes = data.recipes.filter(r => r.id !== id);
  data.records = data.records.filter(r => r.recipeId !== id);
  await saveData(data);
}

// 做菜记录相关
export async function getRecords(recipeId?: string): Promise<CookingRecord[]> {
  const data = await loadData();
  if (recipeId) {
    return data.records.filter(r => r.recipeId === recipeId);
  }
  return data.records;
}

export async function saveRecord(record: CookingRecord): Promise<void> {
  const data = await loadData();
  const index = data.records.findIndex(r => r.id === record.id);
  if (index >= 0) {
    data.records[index] = record;
  } else {
    data.records.push(record);
  }
  await saveData(data);
}

export async function deleteRecord(id: string): Promise<void> {
  const data = await loadData();
  data.records = data.records.filter(r => r.id !== id);
  await saveData(data);
}

// 家庭成员相关
export async function getMembers(): Promise<Member[]> {
  const data = await loadData();
  return data.members;
}

export async function saveMember(member: Member): Promise<void> {
  const data = await loadData();
  const index = data.members.findIndex(m => m.id === member.id);
  if (index >= 0) {
    data.members[index] = member;
  } else {
    data.members.push(member);
  }
  await saveData(data);
}

export async function deleteMember(id: string): Promise<void> {
  const data = await loadData();
  data.members = data.members.filter(m => m.id !== id);
  await saveData(data);
}

// 生成唯一ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
