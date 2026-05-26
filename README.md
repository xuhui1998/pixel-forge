<div align="center">

# 🔥 PixelForge

**像素风格图片处理 & 精灵图工具工坊**

一个完全运行在浏览器端的像素风格图片处理工具集，所有处理均在本地完成，无需上传服务器，隐私安全。

[在线体验](https://xuhui1998.github.io/pixel-forge/) · [功能反馈](https://github.com/xuhui1998/pixel-forge/issues)

</div>

---

## 🤖 关于项目

这是一个 **Vibe Coding** 项目 —— 全部代码由 AI（GitHub Copilot / Claude）辅助生成，人类负责提供想法、设计方向和功能验收。从项目架构、UI 组件到核心算法，AI 参与了每个环节的开发。

## 🛠 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | [Vue 3](https://vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) |
| 构建工具 | [Vite](https://vite.dev/) |
| 路由 | [Vue Router](https://router.vuejs.org/) |
| 状态管理 | [Pinia](https://pinia.vuejs.org/) |
| UI 组件库 | [@mmt817/pixel-ui](https://www.npmjs.com/package/@mmt817/pixel-ui) — 像素风格 UI 组件 |
| 图标 | [Lucide Icons](https://lucide.dev/) + [@hackernoon/pixel-icon-library](https://www.npmjs.com/package/@hackernoon/pixel-icon-library) |
| 图片处理 | Canvas API + [browser-image-compression](https://www.npmjs.com/package/browser-image-compression) + [pica](https://www.npmjs.com/package/pica) |
| GIF 处理 | [gif.js](https://www.npmjs.com/package/gif.js) + [gifuct-js](https://www.npmjs.com/package/gifuct-js) |
| 文件下载 | [file-saver](https://www.npmjs.com/package/file-saver) |

## ✨ 功能一览

### 📸 图片处理（16 个工具）

| 功能 | 说明 |
|------|------|
| 像素化 | 将图片转换为像素风格 |
| 格式转换 | PNG / JPG / WebP / BMP 等格式互转 |
| 图片压缩 | 高质量压缩，可调节质量参数 |
| 调整尺寸 | 自定义宽高，支持等比缩放 |
| 颜色替换 | 精准替换图片中的指定颜色 |
| 去除背景 | 一键移除图片背景（色度 Key） |
| AI 抠图 | 浏览器端本地 AI 智能抠图 |
| 调色板映射 | 将图片颜色映射到指定调色板 |
| 抖动处理 | Floyd-Steinberg 等多种抖动算法 |
| 轮廓描边 | 为像素图生成精确轮廓描边 |
| 镜像翻转 | 水平或垂直翻转图片 |
| 图片合成 | 多张图片叠加合成 |
| 九宫格切片 | 9-Slice 拉伸切片，UI 适配利器 |
| 马赛克模糊 | 局部马赛克或高斯模糊 |
| 批量处理 | 批量应用同一处理流程 |
| 水印 | 添加文字或图片水印 |

### 🎬 精灵图工具（3 个工具）

| 功能 | 说明 |
|------|------|
| 拆帧 & GIF | 精灵图逐帧拆分，支持 GIF 动画导出 |
| 精灵图合并 | 多张图片合并为精灵图 |
| TileMap 切割 | 从 TileMap 地图中切割瓦片 |

### 🎨 图片编辑

| 功能 | 说明 |
|------|------|
| 瓦片编辑 | 像素风格瓦片编辑器，支持实时预览 |

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/xuhui1998/pixel-forge.git
cd pixel-forge

# 安装依赖（推荐 pnpm）
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

## 📁 项目结构

```
src/
├── assets/             # 静态资源
├── components/
│   ├── common/         # 通用组件（导航栏、上传器等）
│   ├── editor/         # 图片编辑组件
│   ├── icons/          # 自定义图标
│   ├── image/          # 图片处理功能组件（16 个）
│   ├── sprite/         # 精灵图功能组件
│   └── ui/             # 基础 UI 组件
├── router/             # 路由配置
├── stores/             # Pinia 状态管理
├── styles/             # 全局样式 & CSS 变量
├── types/              # TypeScript 类型声明
├── utils/              # 工具函数（Canvas、压缩、像素化等）
└── views/              # 页面视图
```

## 📄 License

[MIT](./LICENSE)
