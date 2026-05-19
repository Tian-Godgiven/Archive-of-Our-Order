# Archive of Our Order - 我们的做菜档案

一个帮助家庭记录做菜历程的移动端 App。记录每一道菜的制作过程、家人评价，追踪烹饪习惯，让做饭这件事变得更有仪式感。

<p align="center">
  <img src="../screenshot/20260519-155802.jpg" width="280" alt="菜谱列表" />
  &nbsp;&nbsp;
  <img src="../screenshot/20260519-155756.jpg" width="280" alt="家庭评价" />
</p>

## 功能

- **菜谱管理** — 创建和管理菜谱，记录食材、步骤和厨师心得
- **做菜记录** — 每次做菜都可以记录照片、难度、耗时和笔记
- **家庭评价** — 家庭成员对每次做菜打分和评论
- **成员管理** — 管理家庭成员，设置默认参与评价的人
- **智能排序** — 按"最久没做"排序，帮你发现被遗忘的菜谱
- **照片记录** — 支持多张照片上传，自动生成缩略图

## 技术栈

- **框架**: [Tauri 2](https://tauri.app/) + [Vue 3](https://vuejs.org/) + TypeScript
- **构建工具**: Vite 6
- **状态管理**: Pinia
- **样式**: Tailwind CSS v4
- **图标**: Lucide Icons
- **数据存储**: Tauri Store (本地 JSON 存储)

## 开发

### 前置要求

- Node.js 18+
- Rust 工具链 ([安装指南](https://www.rust-lang.org/tools/install))
- Tauri 开发环境 ([平台配置](https://tauri.app/start/prerequisites/))

### 运行

```bash
cd Archive_of_Our_Order
npm install
npm run tauri dev
```

仅前端开发（不需要 Rust 环境）：

```bash
npm run dev
```

### 构建

```bash
npm run tauri build
```

## 项目结构

```
Archive_of_Our_Order/
├── src/
│   ├── views/          # 页面组件
│   ├── components/     # 可复用组件
│   ├── stores/         # Pinia 状态管理
│   ├── composables/    # 组合式函数
│   ├── utils/          # 工具函数（存储、照片处理）
│   └── types/          # TypeScript 类型定义
└── src-tauri/          # Tauri/Rust 后端
```

## AI 编程

本项目大部分代码由 AI (Claude) 编写，是一次 AI 辅助编程的实践。从需求分析、架构设计到具体实现，AI 参与了绝大部分的开发工作，人类开发者主要负责需求定义、方向把控和最终验收。

## 下载

前往 [Releases](https://github.com/Tian-Godgiven/Archive-of-Our-Order/releases) 页面下载最新版本的 APK 安装包。

## License

MIT
