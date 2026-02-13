import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'RecipeList',
      component: () => import('@/views/RecipeList.vue'),
    },
    {
      path: '/recipe/:id',
      name: 'RecipeDetail',
      component: () => import('@/views/RecipeDetail.vue'),
    },
    {
      path: '/record/:id',
      name: 'RecordDetail',
      component: () => import('@/views/RecordDetail.vue'),
    },
    {
      path: '/record/add/:recipeId',
      name: 'RecordEdit',
      component: () => import('@/views/RecordEdit.vue'),
    },
    {
      path: '/our',
      name: 'OurPage',
      component: () => import('@/views/OurPage.vue'),
    },
    {
      path: '/members',
      name: 'MemberManage',
      component: () => import('@/views/MemberManage.vue'),
    },
  ],
});

export default router;
