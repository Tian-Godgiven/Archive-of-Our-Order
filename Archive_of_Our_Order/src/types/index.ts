// 菜谱
export interface Recipe {
  id: string;
  name: string;
  chefComment: string;
  bestIngredientsId?: string; // 指向最完美食材列表的记录ID
  hideFromHome: boolean; // 是否在首页隐藏
  createdAt: number;
  updatedAt: number;
}

// 做菜记录
export interface CookingRecord {
  id: string;
  recipeId: string;
  photos: string[]; // 照片路径数组
  ingredients: string; // 食材列表
  steps: string; // 制作步骤
  difficulty?: number; // 1-5星
  duration?: number; // 分钟
  notes: string; // 心得文字
  count: number; // 第几次做
  createdAt: number;
  updatedAt: number;
  ratings: MemberRating[]; // 家庭成员评价列表
}

// 家庭成员评价
export interface MemberRating {
  memberId: string;
  memberName: string;
  stars: number; // 1-5星
  comment?: string; // 评语
}

// 家庭成员
export interface Member {
  id: string;
  name: string;
  isDefault: boolean; // 是否在默认家庭组
  createdAt: number;
}

// 数据存储结构
export interface AppData {
  recipes: Recipe[];
  records: CookingRecord[];
  members: Member[];
}
