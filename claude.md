# Claude 工作原则

## 工作方式

1. **一问一答地进行工作**
   - 逐步确认需求和方向
   - 每个步骤都与用户沟通确认

2. **在修改代码之前向我汇报**
   - 先说明计划要做什么修改
   - 等待用户确认后再执行

## 开发进度

- **剩余开发时间**: 1小时（记录于 2026-02-13）
- **当前状态**: 所有功能开发完成

### 已完成
- ✅ 项目基础配置（Tailwind CSS、Vue Router、Pinia、Tauri Store）
- ✅ 类型定义和数据结构
- ✅ 数据存储工具
- ✅ 所有页面开发：
  - RecipeList.vue - 菜谱列表页
  - RecipeDetail.vue - 菜谱详情页
  - RecordDetail.vue - 做菜记录详情页（支持查看/编辑模式）
  - RecordEdit.vue - 添加做菜记录页面
  - MemberManage.vue - 成员管理页
  - OurPage.vue - "我们"页面（评价记录）
- ✅ 所有待实现功能：
  - 照片上传和显示（使用 Tauri dialog 和 fs 插件）
  - 菜谱详情页的左右滑动切换
  - 选择已有菜谱的界面（快速添加弹窗）
  - 全屏查看照片（支持左右切换、键盘控制）

### 待测试
- 需要安装 Rust 工具链才能运行 Tauri 应用
- 所有功能代码已完成，等待实际测试

### 技术栈
- Tauri 2
- Vue 3 + TypeScript
- Tailwind CSS v4
- Pinia (状态管理)
- Vue Router (路由)
- Tauri Store (数据存储)
- Tauri Dialog (文件选择)
- Tauri FS (文件系统)
