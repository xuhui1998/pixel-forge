# PixelForge - 像素风格图片处理工坊

> 🎨 **PixelForge** = Pixel + Forge（像素锻造）
>
> 项目技术栈：Vue 3 + TypeScript + Vite
> 项目目标：打造一个功能完善的 2D 像素风格图片处理在线工具站

## 🏷️ 品牌标识

| 项目 | 内容 |
|------|------|
| **中文名** | 像素锻造 |
| **英文名** | PixelForge |
| **品牌色** | `#f54e00`（Cursor Orange） |
| **Logo** | 像素风铁砧 + 火焰（`public/favicon.svg`） |
| **字体** | Press Start 2P（像素字体） |
| **风格** | 像素风 / 复古游戏机 / 8-bit |

**Logo 设计理念**：一个像素风格的铁砧（Anvil）上方燃烧着火焰，呼应 "Forge"（锻造）的品牌概念。铁砧代表工具和加工，火焰代表创意和活力。整个 Logo 由纯像素方块构成，完美契合项目的像素风格主题。

---

## 📋 目录

- [技术架构总览](#技术架构总览)
- [项目目录结构](#项目目录结构)
- [核心依赖与插件](#核心依赖与插件)
- [模块一：图片处理](#模块一图片处理)
- [模块二：精灵图处理](#模块二精灵图处理)
- [模块三：扩展功能（规划中）](#模块三扩展功能规划中)
- [UI/UX 像素风格方案](#uiux-像素风格方案)
- [开发计划与里程碑](#开发计划与里程碑)
- [参考文档与资源](#参考文档与资源)

---

## 技术架构总览

```
┌─────────────────────────────────────────────────┐
│                   Vue 3 + Vite                   │
├──────────────┬──────────────┬────────────────────┤
│  Vue Router  │    Pinia     │   Vue I18n (可选)   │
├──────────────┴──────────────┴────────────────────┤
│                 统一 Canvas 处理层                 │
├──────────┬──────────┬───────────┬────────────────┤
│ 图片处理  │ 精灵图处理 │ GIF 编解码 │ 文件导出下载   │
└──────────┴──────────┴───────────┴────────────────┘
```

所有图片处理核心逻辑基于 **HTML5 Canvas API**，不依赖后端服务，完全在浏览器端运行。

---

## 项目目录结构（建议）

```
src/
├── App.vue                     # 根组件
├── main.ts                     # 入口文件
├── style.css                   # 全局像素风格样式
├── router/
│   └── index.ts                # 路由配置
├── stores/
│   ├── image.ts                # 图片处理状态管理
│   └── sprite.ts               # 精灵图状态管理
├── composables/                # 组合式函数
│   ├── useCanvas.ts            # Canvas 通用操作
│   ├── useImageProcess.ts      # 图片处理逻辑
│   ├── useSpriteSheet.ts       # 精灵图处理逻辑
│   ├── useGifExport.ts         # GIF 导出逻辑
│   └── useFileDownload.ts      # 文件下载工具
├── utils/
│   ├── pixelate.ts             # 像素化算法
│   ├── color-replace.ts        # 颜色替换算法
│   ├── format-convert.ts       # 格式转换工具
│   ├── compress.ts             # 图片压缩工具
│   ├── resize.ts               # 尺寸调整工具
│   ├── sprite-utils.ts         # 精灵图工具函数
│   ├── tilemap.ts              # 瓦片地图切割工具函数
│   ├── palette.ts              # 调色板提取与映射算法
│   ├── dithering.ts            # 抖动处理算法（Floyd-Steinberg / Ordered / Atkinson）
│   ├── outline.ts              # 像素描边 / Outline 算法
│   ├── transform.ts            # 镜像翻转与旋转变换
│   ├── composite.ts            # 图片叠加与混合模式合成
│   ├── nine-slice.ts           # 九宫格切图（9-Slice）算法
│   └── mosaic.ts               # 马赛克打码工具
├── workers/
│   ├── bg-removal.worker.ts    # 背景移除 Web Worker
│   └── gif-encoder.worker.ts   # GIF 编码 Web Worker
├── components/
│   ├── common/
│   │   ├── PixelButton.vue     # 像素风格按钮
│   │   ├── PixelSlider.vue     # 像素风格滑块
│   │   ├── PixelModal.vue      # 像素风格弹窗
│   │   ├── PixelCard.vue       # 像素风格卡片
│   │   ├── PixelNavbar.vue     # 像素风格导航栏
│   │   ├── ImageUploader.vue   # 图片上传组件
│   │   ├── ImagePreview.vue    # 图片预览组件
│   │   ├── CanvasEditor.vue    # Canvas 编辑器组件
│   │   └── ColorPicker.vue     # 颜色选择器
│   ├── image/                  # 图片处理模块组件
│   │   ├── BgRemoval.vue       # 去除背景
│   │   ├── ImageCompress.vue   # 图片压缩
│   │   ├── AiCutout.vue        # AI 抠图
│   │   ├── Pixelate.vue        # 像素化处理
│   │   ├── FormatConvert.vue   # 格式转换
│   │   ├── ColorReplace.vue    # 像素颜色替换
│   │   ├── ResizeImage.vue     # 修改尺寸和分辨率
│   │   ├── PaletteMapper.vue   # 调色板提取与映射
│   │   ├── Dithering.vue       # 抖动处理
│   │   ├── PixelOutline.vue    # 像素描边
│   │   ├── MirrorFlip.vue      # 镜像翻转与旋转
│   │   ├── ImageComposite.vue  # 图片叠加合成
│   │   ├── NineSlice.vue       # 九宫格切图
│   │   ├── MosaicBlur.vue      # 马赛克打码
│   │   └── BatchProcess.vue    # 批量处理
│   └── sprite/                 # 精灵图模块组件
│       ├── SpriteSplitter.vue  # 精灵图拆帧
│       ├── SpriteMerger.vue    # 精灵图合并
│       └── TileMapCutter.vue   # TileMap 瓦片地图切割
│       ├── SpritePreview.vue   # 帧动画预览
│       ├── GifExporter.vue     # GIF 导出
│       └── GifImporter.vue     # GIF 导入拆解
├── views/
│   ├── HomeView.vue            # 首页
│   ├── ImageProcessView.vue    # 图片处理页
│   └── SpriteView.vue          # 精灵图处理页
├── assets/
│   ├── fonts/                  # 像素字体
│   └── icons/                  # 像素图标
└── types/
    ├── image.d.ts              # 图片相关类型定义
    └── sprite.d.ts             # 精灵图相关类型定义
```

---

## 核心依赖与插件

### 基础框架

| 包名 | 版本 | 用途 | 安装命令 |
|------|------|------|----------|
| `vue` | ^3.5 | 核心框架 | 已安装 |
| `vue-router` | ^4.x | 路由管理 | `pnpm add vue-router` |
| `pinia` | ^3.x | 状态管理 | `pnpm add pinia` |

### 图片处理核心

| 包名 | 版本 | 用途 | 安装命令 |
|------|------|------|----------|
| `@imgly/background-removal` | ^1.x | **AI 背景移除/抠图**（浏览器端运行，基于 ONNX 模型） | `pnpm add @imgly/background-removal` |
| `browser-image-compression` | ^2.x | **图片压缩**（支持尺寸/质量压缩） | `pnpm add browser-image-compression` |
| `pica` | ^9.x | **高质量图片缩放**（基于 Lanczos 滤镜，优于 Canvas 原生缩放） | `pnpm add pica` |

### GIF 处理

| 包名 | 版本 | 用途 | 安装命令 |
|------|------|------|----------|
| `gif.js` | ^0.2 | **GIF 编码**（将帧序列编码为 GIF 动画，支持 Web Worker） | `pnpm add gif.js` |
| `gifuct-js` | ^2.x | **GIF 解码**（解析 GIF 文件为帧序列，用于 GIF 预览和拆帧） | `pnpm add gifuct-js` |

> 💡 **GIF 替代方案**：如果 `gif.js` 在 Vite 环境下有 Worker 兼容问题，可以考虑使用 `modern-gif` 或 `@anthropic-ai/gif-encoder`。

### 文件与工具

| 包名 | 版本 | 用途 | 安装命令 |
|------|------|------|----------|
| `file-saver` | ^2.x | 文件下载保存 | `pnpm add file-saver` |
| `@types/file-saver` | ^2.x | FileSaver 类型定义 | `pnpm add -D @types/file-saver` |
| `@types/gif.js` | - | gif.js 类型定义（如无可手动声明） | - |

### UI 像素风格（可选）

| 包名 | 版本 | 用途 | 安装命令 |
|------|------|------|----------|
| `nes.css` | ^2.x | **NES 像素风格 CSS 框架**（提供像素风按钮、对话框、输入框等组件） | `pnpm add nes.css` |

> 🎮 `nes.css` 是一个专为复古像素风格设计的 CSS 挨框架，内置像素风格的按钮、容器、对话框等 UI 元素，非常适合本项目主题。也可以选择纯手写 CSS 实现像素风格。

### 开发依赖

| 包名 | 版本 | 用途 | 安装命令 |
|------|------|------|----------|
| `@types/pica` | - | pica 类型定义 | `pnpm add -D @types/pica` |
| `unplugin-vue-components` | ^0.27 | 组件自动导入（可选） | `pnpm add -D unplugin-vue-components` |

### 一键安装所有依赖

```bash
pnpm add vue-router pinia @imgly/background-removal browser-image-compression pica gif.js gifuct-js file-saver nes.css

pnpm add -D @types/file-saver @types/pica
```

---

## 模块一：图片处理

### 1.1 去除背景

**技术方案**：使用 `@imgly/background-removal`

```typescript
// 示例代码：utils/bg-removal.ts
import { removeBackground } from '@imgly/background-removal'

/**
 * 去除图片背景
 * @param imageFile 原始图片 File 对象
 * @returns 处理后的 Blob（PNG，含透明通道）
 */
export async function removeImageBackground(imageFile: File | Blob): Promise<Blob> {
  const blob = await removeBackground(imageFile, {
    model: 'medium',       // 'small' | 'medium' | 'large'，质量与速度权衡
    output: {
      format: 'image/png', // 输出 PNG 以保留透明度
      quality: 0.9,
    },
  })
  return blob
}
```

**关键点**：
- `@imgly/background-removal` 基于 ONNX Runtime Web，完全在浏览器端运行，无需后端
- 首次使用时会下载 AI 模型文件（约 30-80MB），需提示用户等待
- 模型文件会被浏览器缓存，后续使用无需重复下载
- 推荐使用 Web Worker 避免阻塞主线程

**参考文档**：[https://github.com/imgly/background-removal-js](https://github.com/imgly/background-removal-js)

---

### 1.2 图片压缩

**技术方案**：使用 `browser-image-compression`

```typescript
// 示例代码：utils/compress.ts
import imageCompression from 'browser-image-compression'

export interface CompressOptions {
  maxSizeMB?: number           // 目标最大文件大小（MB）
  maxWidthOrHeight?: number    // 最大宽高（px）
  quality?: number             // 压缩质量 0-1
  initialQuality?: number      // 初始质量
  fileType?: string            // 输出格式，如 'image/jpeg'
}

/**
 * 压缩图片
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    initialQuality: 0.8,
    ...options,
  }
  return await imageCompression(file, defaultOptions)
}
```

**关键点**：
- 支持 JPEG / PNG / WebP 格式压缩
- 可按文件大小或尺寸进行压缩
- 压缩过程异步进行，需提供进度回调

**参考文档**：[https://github.com/Donaldcwl/browser-image-compression](https://github.com/Donaldcwl/browser-image-compression)

---

### 1.3 AI 抠图

**技术方案**：复用 `@imgly/background-removal` + Canvas 手动交互

```typescript
// 示例代码：composables/useImageProcess.ts
// AI 抠图与去除背景使用相同的底层库，区别在于：
// 1. AI 抠图 = 背景移除 + 手动选区精修
// 2. 支持用户手动标注前景/背景区域进行微调

/**
 * AI 抠图工作流：
 * 1. 用户上传图片
 * 2. AI 自动移除背景，生成 mask
 * 3. 用户可在 Canvas 上手动擦除/恢复边缘区域
 * 4. 导出抠图结果（PNG 透明背景）
 */
```

**关键点**：
- 基础抠图直接复用 `removeBackground`
- 进阶功能：在 Canvas 上叠加 mask 层，允许用户手动笔刷编辑
- 可以提供「魔棒工具」（基于颜色相似度的 Flood Fill 算法）作为辅助

---

### 1.4 像素化处理

**技术方案**：Canvas API 缩小再放大

```typescript
// 示例代码：utils/pixelate.ts

/**
 * 像素化处理算法
 * 原理：将图片缩小到目标像素数，再放大回原尺寸（使用 nearest-neighbor 插值）
 * 
 * @param imageData 原始图片 ImageData
 * @param pixelSize 像素块大小（值越大，像素化越明显）
 * @returns 像素化后的 ImageData
 */
export function pixelate(
  sourceCanvas: HTMLCanvasElement,
  pixelSize: number
): HTMLCanvasElement {
  const { width, height } = sourceCanvas
  const tempCanvas = document.createElement('canvas')
  const tempCtx = tempCanvas.getContext('2d')!

  // Step 1: 缩小到低分辨率
  const smallW = Math.ceil(width / pixelSize)
  const smallH = Math.ceil(height / pixelSize)
  tempCanvas.width = smallW
  tempCanvas.height = smallH
  tempCtx.drawImage(sourceCanvas, 0, 0, smallW, smallH)

  // Step 2: 放大回原尺寸，关闭抗锯齿以保持像素块效果
  const resultCanvas = document.createElement('canvas')
  const resultCtx = resultCanvas.getContext('2d')!
  resultCanvas.width = width
  resultCanvas.height = height
  resultCtx.imageSmoothingEnabled = false // 关键：关闭平滑处理
  resultCtx.drawImage(tempCanvas, 0, 0, width, height)

  return resultCanvas
}
```

**关键点**：
- 核心是 `imageSmoothingEnabled = false`，确保放大时使用最近邻插值
- `pixelSize` 参数控制像素化粒度（建议范围 2-32）
- 可扩展：支持调色板量化（减少颜色数），使用中值切割或八叉树算法

---

### 1.5 格式互换

**技术方案**：Canvas API `toBlob()` / `toDataURL()`

```typescript
// 示例代码：utils/format-convert.ts

export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/bmp'

/**
 * 图片格式转换
 * 支持格式：PNG ↔ JPEG ↔ WebP ↔ BMP
 */
export async function convertFormat(
  canvas: HTMLCanvasElement,
  targetFormat: ImageFormat,
  quality: number = 0.92
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('格式转换失败'))
      },
      targetFormat,
      quality
    )
  })
}

/**
 * 从 File/Blob 加载到 Canvas
 */
export function loadImageToCanvas(file: File | Blob): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(img.src)
      resolve(canvas)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
```

**关键点**：
- Canvas `toBlob()` 支持输出 PNG / JPEG / WebP
- BMP 格式需手动编码（或使用第三方库如 `bmp-js`）
- JPEG 不支持透明通道，转换时需填充白色背景
- 支持批量格式转换

---

### 1.6 像素颜色替换

**技术方案**：Canvas `getImageData` / `putImageData` 像素级操作

```typescript
// 示例代码：utils/color-replace.ts

export interface ColorReplaceOptions {
  sourceColor: [number, number, number]      // 源颜色 RGB
  targetColor: [number, number, number]      // 目标颜色 RGB
  tolerance: number                          // 颜色容差 0-255
  preserveShading: boolean                   // 是否保留明暗关系（原风格）
}

/**
 * 像素颜色替换（保留原有明暗/阴影风格）
 * 
 * 算法原理：
 * 1. 将源颜色和目标颜色分别转为 HSL
 * 2. 对匹配的像素，保持明度(L)不变，替换色相(H)和饱和度(S)
 * 3. 这样可以保留像素画原有的明暗/高光/阴影层次
 */
export function replaceColor(
  imageData: ImageData,
  options: ColorReplaceOptions
): ImageData {
  const { data, width, height } = imageData
  const result = new ImageData(new Uint8ClampedArray(data), width, height)
  const [sr, sg, sb] = options.sourceColor
  const [tr, tg, tb] = options.targetColor

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
    if (a === 0) continue // 跳过透明像素

    const dist = Math.sqrt(
      (r - sr) ** 2 + (g - sg) ** 2 + (b - sb) ** 2
    )

    if (dist <= options.tolerance) {
      if (options.preserveShading) {
        // 保留明暗：计算原图亮度比例，应用到新颜色
        const srcLuminance = (0.299 * sr + 0.587 * sg + 0.114 * sb) / 255
        const pixelLuminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
        const ratio = srcLuminance > 0 ? pixelLuminance / srcLuminance : 1

        result.data[i]     = Math.min(255, Math.round(tr * ratio))
        result.data[i + 1] = Math.min(255, Math.round(tg * ratio))
        result.data[i + 2] = Math.min(255, Math.round(tb * ratio))
        result.data[i + 3] = a
      } else {
        result.data[i]     = tr
        result.data[i + 1] = tg
        result.data[i + 2] = tb
        result.data[i + 3] = a
      }
    }
  }

  return result
}
```

**关键点**：
- `tolerance` 参数允许匹配相近颜色，处理抗锯齿边缘
- `preserveShading` 模式通过亮度比例映射来保留原画的明暗关系
- 可扩展为调色板整体替换（如 NES 调色板映射）
- 像素画颜色数量有限，建议先提取调色板再批量替换

---

### 1.7 修改尺寸和分辨率

**技术方案**：使用 `pica` 高质量缩放

```typescript
// 示例代码：utils/resize.ts
import pica from 'pica'

/**
 * 高质量调整图片尺寸
 * pica 使用 Lanczos3 滤镜，效果远优于 Canvas 原生 drawImage 缩放
 */
export async function resizeImage(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  options: {
    quality?: number     // 0-3，pica 缩放质量
    unsharpAmount?: number // 锐化强度
    alpha?: boolean      // 是否保留透明通道
  } = {}
): Promise<HTMLCanvasElement> {
  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = targetWidth
  resultCanvas.height = targetHeight

  const picaInstance = pica()

  await picaInstance.resize(sourceCanvas, resultCanvas, {
    quality: options.quality ?? 3,
    alpha: options.alpha ?? true,
    unsharpAmount: options.unsharpAmount ?? 80,
    unsharpRadius: 0.6,
    unsharpThreshold: 2,
  })

  return resultCanvas
}
```

**关键点**：
- 像素画缩放时需注意：放大应使用最近邻插值（`imageSmoothingEnabled = false`），缩小使用 Lanczos
- 支持锁定宽高比
- 支持自定义 DPI（分辨率）设置（修改 PNG 元数据中的 pHYs chunk，可用 `png-chunk-text` 库）

**参考文档**：[https://github.com/nodeca/pica](https://github.com/nodeca/pica)

---

## 模块二：精灵图处理

### 2.1 精灵图拆帧

**技术方案**：Canvas API 按网格/自动检测拆分

```typescript
// 示例代码：utils/sprite-utils.ts

export interface SpriteFrame {
  index: number
  canvas: HTMLCanvasElement
  width: number
  height: number
  offsetX: number
  offsetY: number
}

export interface SplitOptions {
  columns: number           // 列数
  rows: number              // 行数
  frameWidth?: number       // 单帧宽（可选，优先于 columns/rows）
  frameHeight?: number      // 单帧高
  padding?: number          // 帧间距
}

/**
 * 精灵图拆帧 - 网格模式
 * 按照指定行列数或帧尺寸均匀拆分
 */
export function splitSpriteSheet(
  sourceCanvas: HTMLCanvasElement,
  options: SplitOptions
): SpriteFrame[] {
  const { width, height } = sourceCanvas
  const frames: SpriteFrame[] = []

  let frameW: number, frameH: number
  if (options.frameWidth && options.frameHeight) {
    frameW = options.frameWidth
    frameH = options.frameHeight
  } else {
    frameW = Math.floor(width / options.columns)
    frameH = Math.floor(height / options.rows)
  }

  const cols = options.frameWidth
    ? Math.floor(width / frameW)
    : options.columns
  const rows = options.frameHeight
    ? Math.floor(height / frameH)
    : options.rows

  const padding = options.padding ?? 0
  let index = 0

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = col * (frameW + padding)
      const offsetY = row * (frameH + padding)

      if (offsetX + frameW > width || offsetY + frameH > height) continue

      const frameCanvas = document.createElement('canvas')
      frameCanvas.width = frameW
      frameCanvas.height = frameH
      const ctx = frameCanvas.getContext('2d')!
      ctx.drawImage(
        sourceCanvas,
        offsetX, offsetY, frameW, frameH,  // 源裁剪区域
        0, 0, frameW, frameH                 // 目标绘制区域
      )

      frames.push({ index, canvas: frameCanvas, width: frameW, height: frameH, offsetX, offsetY })
      index++
    }
  }

  return frames
}

/**
 * 精灵图拆帧 - 自动检测模式（基于连通区域检测）
 * 适用于非均匀排列的精灵图
 * 
 * 算法：
 * 1. 扫描图片找到非透明像素的连通区域
 * 2. 计算每个区域的外接矩形
 * 3. 按位置排序，提取每个精灵帧
 */
export function autoSplitSpriteSheet(
  sourceCanvas: HTMLCanvasElement,
  options: { minArea?: number; padding?: number } = {}
): SpriteFrame[] {
  // 实现连通区域检测算法（Flood Fill / Connected Component Labeling）
  // ... 详细实现见后续开发
  return []
}
```

**关键点**：
- 支持两种模式：网格均匀拆分（按行列数）和自动检测（基于连通区域）
- 自动检测适用于非均匀排列的精灵图（间距不固定的 sheet）
- 拆帧后每帧保存为独立的 Canvas 对象，便于后续处理

---

### 2.2 合并精灵图帧

**技术方案**：Canvas API 拼接

```typescript
/**
 * 将多个帧合并为一张精灵图
 */
export function mergeFrames(
  frames: HTMLCanvasElement[],
  options: {
    columns?: number       // 每行帧数（默认自动计算接近正方形的排列）
    padding?: number       // 帧间距
    maxWidth?: number      // 最大宽度限制
  } = {}
): HTMLCanvasElement {
  const { padding = 0, maxWidth = 4096 } = options
  const frameW = frames[0].width
  const frameH = frames[0].height
  const totalFrames = frames.length

  const cols = options.columns ?? Math.ceil(Math.sqrt(totalFrames))
  const rows = Math.ceil(totalFrames / cols)

  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = cols * (frameW + padding) - padding
  resultCanvas.height = rows * (frameH + padding) - padding
  const ctx = resultCanvas.getContext('2d')!

  frames.forEach((frame, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const x = col * (frameW + padding)
    const y = row * (frameH + padding)
    ctx.drawImage(frame, x, y)
  })

  return resultCanvas
}
```

---

### 2.3 帧动画预览

**技术方案**：`requestAnimationFrame` + Canvas 逐帧渲染

```typescript
// 示例代码：composables/useSpriteSheet.ts
import { ref, onUnmounted } from 'vue'

export function useSpriteAnimation() {
  const currentFrameIndex = ref(0)
  const isPlaying = ref(false)
  const fps = ref(12)
  let animationId: number | null = null
  let lastTime = 0

  /**
   * 播放帧动画
   */
  function play(
    frames: HTMLCanvasElement[],
    targetCanvas: HTMLCanvasElement,
    options: { fps?: number; loop?: boolean; onComplete?: () => void } = {}
  ) {
    const ctx = targetCanvas.getContext('2d')!
    const frameDelay = 1000 / (options.fps ?? fps.value)
    let frameIndex = 0
    isPlaying.value = true

    function render(timestamp: number) {
      if (!isPlaying.value) return

      if (timestamp - lastTime >= frameDelay) {
        lastTime = timestamp

        // 清空并绘制当前帧
        ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height)
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(frames[frameIndex], 0, 0, targetCanvas.width, targetCanvas.height)

        currentFrameIndex.value = frameIndex
        frameIndex++

        if (frameIndex >= frames.length) {
          if (options.loop ?? true) {
            frameIndex = 0
          } else {
            isPlaying.value = false
            options.onComplete?.()
            return
          }
        }
      }

      animationId = requestAnimationFrame(render)
    }

    animationId = requestAnimationFrame(render)
  }

  function stop() {
    isPlaying.value = false
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
    }
  }

  onUnmounted(() => stop())

  return { currentFrameIndex, isPlaying, fps, play, stop }
}
```

---

### 2.4 GIF 导出

**技术方案**：使用 `gif.js` 编码

```typescript
// 示例代码：composables/useGifExport.ts
import GIF from 'gif.js'

/**
 * 将帧序列导出为 GIF 动画
 */
export function exportGif(
  frames: HTMLCanvasElement[],
  options: {
    fps?: number
    quality?: number     // 1-30，越小质量越高
    repeat?: number      // 0=无限循环
    width?: number
    height?: number
    onProgress?: (progress: number) => void
  } = {}
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality: options.quality ?? 10,
      width: options.width ?? frames[0].width,
      height: options.height ?? frames[0].height,
      workerScript: '/gif.worker.js', // 需要将 gif.worker.js 复制到 public/
      repeat: options.repeat ?? 0,
    })

    const delay = Math.round(1000 / (options.fps ?? 12))

    frames.forEach((frame) => {
      gif.addFrame(frame, { delay, copy: true })
    })

    gif.on('progress', (progress: number) => {
      options.onProgress?.(progress)
    })

    gif.on('finished', (blob: Blob) => {
      resolve(blob)
    })

    gif.on('abort', () => {
      reject(new Error('GIF 编码被中断'))
    })

    gif.render()
  })
}
```

**⚠️ gif.js 在 Vite 中的配置注意**：

```bash
# 需要手动将 gif.worker.js 复制到 public 目录
cp node_modules/gif.js/dist/gif.worker.js public/
```

```typescript
// vite.config.ts 中可能需要配置
export default defineConfig({
  plugins: [vue()],
  optimizeDeps: {
    include: ['gif.js'],
  },
})
```

**参考文档**：
- [gif.js - https://github.com/jnordberg/gif.js](https://github.com/jnordberg/gif.js)
- [gifuct-js - https://github.com/matt-way/gifuct-js](https://github.com/matt-way/gifuct-js)

---

### 2.5 GIF 导入拆解

**技术方案**：使用 `gifuct-js` 解码 GIF，提取为帧序列

```typescript
// 示例代码：utils/gif-import.ts
import { parseGIF, decompressFrames } from 'gifuct-js'

export interface GifFrame {
  index: number
  canvas: HTMLCanvasElement
  delay: number           // 帧延迟（ms）
  disposalMethod: number  // 处置方式
  dims: {
    width: number
    height: number
    top: number
    left: number
  }
}

/**
 * 解析 GIF 文件为帧序列
 * 支持全量帧和差异帧两种模式
 */
export async function parseGifToFrames(
  gifFile: File | Blob
): Promise<{ frames: GifFrame[]; width: number; height: number }> {
  const buffer = await gifFile.arrayBuffer()
  const gif = parseGIF(buffer)
  const rawFrames = decompressFrames(gif, true)

  const width = gif.lsd.width
  const height = gif.lsd.height

  const frames: GifFrame[] = []
  // 用于累积差异帧的全局画布
  const compositeCanvas = document.createElement('canvas')
  compositeCanvas.width = width
  compositeCanvas.height = height
  const compositeCtx = compositeCanvas.getContext('2d')!

  // 清空为透明
  compositeCtx.clearRect(0, 0, width, height)

  for (let i = 0; i < rawFrames.length; i++) {
    const frame = rawFrames[i]
    const { width: fw, height: fh, top, left } = frame.dims

    // 创建单帧 ImageData
    const frameImageData = new ImageData(
      new Uint8ClampedArray(frame.patch),
      fw,
      fh
    )

    // 根据 disposalMethod 处理上一帧
    if (i > 0) {
      const prevFrame = rawFrames[i - 1]
      if (prevFrame.disposalMethod === 2) {
        // 恢复为背景色（透明）
        compositeCtx.clearRect(
          prevFrame.dims.left, prevFrame.dims.top,
          prevFrame.dims.width, prevFrame.dims.height
        )
      } else if (prevFrame.disposalMethod === 3) {
        // 恢复为前一帧（需保存快照）
        // ... 简化处理
      }
    }

    // 将差异帧绘制到合成画布
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = fw
    tempCanvas.height = fh
    tempCanvas.getContext('2d')!.putImageData(frameImageData, 0, 0)

    compositeCtx.drawImage(tempCanvas, left, top)

    // 导出完整帧
    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = width
    exportCanvas.height = height
    exportCanvas.getContext('2d')!.drawImage(compositeCanvas, 0, 0)

    frames.push({
      index: i,
      canvas: exportCanvas,
      delay: frame.delay || 100,
      disposalMethod: frame.disposalMethod,
      dims: { width: fw, height: fh, top, left },
    })
  }

  return { frames, width, height }
}
```

**关键点**：
- `gifuct-js` 返回的是差异帧（delta frames），需要手动合成完整帧
- `disposalMethod` 决定了上一帧的处理方式：0=不处理，1=保留，2=恢复背景，3=恢复前帧
- 解析后可直接接入精灵图拆帧/预览/合并工作流
- 可统计 GIF 总帧数、总时长、平均帧率等信息展示给用户

**使用场景**：
1. 导入 GIF 动画 → 拆解为帧序列 → 编辑修改 → 重新导出 GIF
2. GIF → Sprite Sheet 转换
3. 提取 GIF 中某一帧作为静态图使用

---

### 2.6 TileMap 切割

**🌟 亮点等级：★★★★☆（游戏开发高频需求）**

**功能描述**：将一张瓦片地图素材图（Tilemap / Tileset）按网格切割为独立的小瓦片（Tile），自动去重，并支持导出为去重后的瓦片集和 JSON 索引数据。

**技术方案**：Canvas API 网格切割 + 像素级哈希去重

```typescript
// 示例代码：utils/tilemap.ts

export interface TileInfo {
  index: number              // 瓦片在原图中的位置索引
  canvas: HTMLCanvasElement  // 瓦片 Canvas
  hash: string               // 像素级哈希（用于去重）
  offsetX: number            // 在原图中的 X 偏移
  offsetY: number            // 在原图中的 Y 偏移
  col: number                // 列号
  row: number                // 行号
}

export interface TileMapResult {
  /** 所有切割出的瓦片（含重复） */
  allTiles: TileInfo[]
  /** 去重后的唯一瓦片 */
  uniqueTiles: TileInfo[]
  /** 瓦片索引映射表：allTiles[i].index → uniqueTiles 中的索引 */
  indexMap: number[]
  /** 统计信息 */
  stats: {
    totalTiles: number
    uniqueCount: number
    duplicateCount: number
    tileWidth: number
    tileHeight: number
    columns: number
    rows: number
  }
}

export interface TileMapSplitOptions {
  tileWidth: number          // 瓦片宽（px）
  tileHeight: number         // 瓦片高（px）
  padding?: number           // 瓦片间距（px），默认 0
  margin?: number            // 外边距（px），默认 0
}

/**
 * 切割瓦片地图
 * 按指定瓦片尺寸将整张 tileset 图均匀切割
 */
export function splitTileMap(
  sourceCanvas: HTMLCanvasElement,
  options: TileMapSplitOptions
): TileMapResult {
  const { tileWidth, tileHeight, padding = 0, margin = 0 } = options
  const { width, height } = sourceCanvas

  const cols = Math.floor((width - margin * 2 + padding) / (tileWidth + padding))
  const rows = Math.floor((height - margin * 2 + padding) / (tileHeight + padding))

  const allTiles: TileInfo[] = []
  const hashToUnique = new Map<string, TileInfo>()
  const uniqueTiles: TileInfo[] = []
  const indexMap: number[] = []
  let uniqueIndex = 0

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = margin + col * (tileWidth + padding)
      const offsetY = margin + row * (tileHeight + padding)

      if (offsetX + tileWidth > width || offsetY + tileHeight > height) continue

      const tileCanvas = document.createElement('canvas')
      tileCanvas.width = tileWidth
      tileCanvas.height = tileHeight
      const ctx = tileCanvas.getContext('2d')!
      ctx.drawImage(sourceCanvas, offsetX, offsetY, tileWidth, tileHeight, 0, 0, tileWidth, tileHeight)

      const hash = computeTileHash(tileCanvas)
      const flatIndex = row * cols + col

      const tile: TileInfo = {
        index: flatIndex,
        canvas: tileCanvas,
        hash,
        offsetX,
        offsetY,
        col,
        row,
      }

      allTiles.push(tile)

      // 去重
      if (!hashToUnique.has(hash)) {
        hashToUnique.set(hash, tile)
        uniqueTiles.push(tile)
        indexMap.push(uniqueIndex)
        uniqueIndex++
      } else {
        const existing = hashToUnique.get(hash)!
        indexMap.push(existing.index)
      }
    }
  }

  return {
    allTiles,
    uniqueTiles,
    indexMap,
    stats: {
      totalTiles: allTiles.length,
      uniqueCount: uniqueTiles.length,
      duplicateCount: allTiles.length - uniqueTiles.length,
      tileWidth,
      tileHeight,
      columns: cols,
      rows: rows,
    },
  }
}

/**
 * 计算瓦片的像素级哈希
 * 用于判断两个瓦片是否完全相同（快速去重）
 */
function computeTileHash(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  // 简单高效：使用 FNV-1a 哈希
  let hash = 2166136261 // FNV offset basis
  for (let i = 0; i < data.length; i += 4) {
    hash ^= data[i]
    hash = (hash * 16777619) >>> 0
    hash ^= data[i + 1]
    hash = (hash * 16777619) >>> 0
    hash ^= data[i + 2]
    hash = (hash * 16777619) >>> 0
    hash ^= data[i + 3]
    hash = (hash * 16777619) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

/**
 * 导出瓦片集为单张精灵图（去重后）
 */
export function exportTileset(
  uniqueTiles: TileInfo[],
  tileWidth: number,
  tileHeight: number,
  options: { columns?: number; padding?: number } = {}
): HTMLCanvasElement {
  const { columns, padding = 0 } = options
  const cols = columns ?? Math.ceil(Math.sqrt(uniqueTiles.length))
  const rows = Math.ceil(uniqueTiles.length / cols)

  const canvas = document.createElement('canvas')
  canvas.width = cols * (tileWidth + padding) - padding
  canvas.height = rows * (tileHeight + padding) - padding
  const ctx = canvas.getContext('2d')!

  uniqueTiles.forEach((tile, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    ctx.drawImage(tile.canvas, col * (tileWidth + padding), row * (tileHeight + padding))
  })

  return canvas
}

/**
 * 导出瓦片索引为 JSON 数据
 * 可用于游戏引擎还原地图
 */
export function exportTileMapJSON(
  result: TileMapResult,
  options: { mapName?: string } = {}
): string {
  const { columns } = result.stats
  const rows = Math.ceil(result.indexMap.length / columns)

  // 构建 2D 地图数组
  const map: number[][] = []
  for (let r = 0; r < rows; r++) {
    const row: number[] = []
    for (let c = 0; c < columns; c++) {
      const idx = r * columns + c
      row.push(idx < result.indexMap.length ? result.indexMap[idx] : -1)
    }
    map.push(row)
  }

  return JSON.stringify({
    name: options.mapName || 'TileMap',
    tileWidth: result.stats.tileWidth,
    tileHeight: result.stats.tileHeight,
    columns: result.stats.columns,
    rows: result.stats.rows,
    uniqueTileCount: result.stats.uniqueCount,
    totalTiles: result.stats.totalTiles,
    map,
  }, null, 2)
}
```

**UI 交互设计**：

```
┌──────────────────────────────────────────────────────────┐
│  TileMap 切割                                             │
├──────────────┬───────────────────────────────────────────┤
│  上传瓦片地图  │  ┌─────────────────────────────────────┐  │
│              │  │        原图预览 + 网格叠加             │  │
│  瓦片宽 [16]  │  │    (SVG 叠加显示切割网格线)          │  │
│  瓦片高 [16]  │  │                                     │  │
│  间距   [0]   │  └─────────────────────────────────────┘  │
│  边距   [0]   │                                          │
│              │  ┌─────────────────────────────────────┐  │
│  [开始切割]   │  │     去重后的瓦片预览网格              │  │
│              │  │  ┌──┬──┬──┬──┐                       │  │
│  统计:        │  │  │01│02│03│04│  (可点击查看大图)     │  │
│  总计: 256    │  │  ├──┼──┼──┼──┤                       │  │
│  唯一: 48     │  │  │05│06│07│08│                       │  │
│  重复: 208    │  │  └──┴──┴──┴──┘                       │  │
│              │  └─────────────────────────────────────┘  │
│  [下载瓦片集]  │                                          │
│  [下载JSON]   │  ┌─────────────────────────────────────┐  │
│              │  │       选中瓦片详情 / 大图预览          │  │
│              │  └─────────────────────────────────────┘  │
└──────────────┴───────────────────────────────────────────┘
```

**关键点**：
- 瓦片地图素材在 2D 像素游戏开发中极为常见（如 RPG Maker、Tiled 地图编辑器导出的素材）
- 核心功能：按固定尺寸网格切割 + 自动去重（像素级哈希比对）
- 切割后在原图上叠加网格线 SVG 预览，方便用户确认切割参数
- 去重后的瓦片集可导出为精灵图（PNG）+ JSON 索引，直接用于游戏引擎
- 支持 padding（瓦片间距）和 margin（外边距），适配不同格式的 tileset
- 可扩展：支持自动检测瓦片尺寸（分析图片中重复模式），支持 Tiled TSX 格式导入/导出

**使用场景**：
1. 导入一张 tileset 素材图 → 切割为独立瓦片 → 去重 → 导出精简后的瓦片集
2. 分析瓦片使用频率，优化素材包大小
3. 将 tileset 转换为 JSON 格式，供游戏引擎（Phaser / PixiJS / Godot 等）直接加载
4. 可视化检查瓦片地图的切割效果

---

## 模块三：扩展功能（规划中）

> 以下功能高度契合像素风格 / 游戏开发工作流，建议在核心功能完成后逐步实现。

### 3.1 调色板提取与映射

**🌟 亮点等级：★★★★★（核心特色功能）**

**技术方案**：Median Cut / K-Means 颜色量化 + 经典游戏调色板映射

```typescript
// 示例代码：utils/palette.ts

export interface PaletteColor {
  r: number; g: number; b: number
  hex: string
  count: number     // 该颜色在图片中出现的次数
  percentage: number // 占比
}

export interface Palette {
  name: string
  colors: [number, number, number][]
}

/**
 * 预置经典游戏调色板
 */
export const PRESET_PALETTES: Record<string, Palette> = {
  'gameboy': {
    name: 'GameBoy (4色)',
    colors: [[15, 56, 15], [48, 98, 48], [139, 172, 15], [155, 188, 15]],
  },
  'nes': {
    name: 'NES (54色)',
    colors: [/* NES 经典 54 色调色板 */],
  },
  'pico8': {
    name: 'PICO-8 (16色)',
    colors: [
      [0,0,0], [29,43,83], [126,37,83], [0,135,81],
      [171,82,54], [95,87,79], [194,195,199], [255,241,232],
      [255,0,77], [255,163,0], [255,236,39], [0,228,54],
      [41,173,255], [131,118,156], [255,119,168], [255,204,170],
    ],
  },
  'cga': {
    name: 'CGA (4色)',
    colors: [[0,0,0], [85,255,255], [255,85,255], [255,255,255]],
  },
  'grayscale': {
    name: '灰度 (4色)',
    colors: [[0,0,0], [85,85,85], [170,170,170], [255,255,255]],
  },
}

/**
 * 使用 Median Cut 算法提取图片调色板
 * 
 * 原理：
 * 1. 将图片所有像素投射到 RGB 色彩空间
 * 2. 找到颜色分布范围最大的通道（R/G/B）
 * 3. 沿该通道中位数将像素集合一分为二
 * 4. 递归分割直到达到目标颜色数
 * 5. 每个分区取平均值作为调色板颜色
 */
export function extractPalette(
  imageData: ImageData,
  maxColors: number = 16,
  options: {
    skipTransparent?: boolean   // 跳过透明像素（默认 true）
    minAlpha?: number           // 最低透明度阈值
  } = {}
): PaletteColor[] {
  const { data } = imageData
  const skipTransparent = options.skipTransparent ?? true
  const minAlpha = options.minAlpha ?? 128

  // 收集所有有效像素
  const pixels: [number, number, number][] = []
  for (let i = 0; i < data.length; i += 4) {
    if (skipTransparent && data[i + 3] < minAlpha) continue
    pixels.push([data[i], data[i + 1], data[i + 2]])
  }

  // Median Cut 递归分割
  function medianCut(
    colors: [number, number, number][],
    depth: number
  ): [number, number, number][] {
    if (depth <= 0 || colors.length === 0) {
      // 返回分区中心颜色
      const avg: [number, number, number] = [0, 0, 0]
      colors.forEach(c => { avg[0] += c[0]; avg[1] += c[1]; avg[2] += c[2] })
      const n = colors.length || 1
      return [[Math.round(avg[0]/n), Math.round(avg[1]/n), Math.round(avg[2]/n)]]
    }

    // 找到颜色范围最大的通道
    let maxRange = 0, channel = 0
    for (let ch = 0; ch < 3; ch++) {
      const values = colors.map(c => c[ch])
      const range = Math.max(...values) - Math.min(...values)
      if (range > maxRange) { maxRange = range; channel = ch }
    }

    // 按该通道排序，从中位数处分割
    colors.sort((a, b) => a[channel] - b[channel])
    const mid = Math.floor(colors.length / 2)

    return [
      ...medianCut(colors.slice(0, mid), depth - 1),
      ...medianCut(colors.slice(mid), depth - 1),
    ]
  }

  const depth = Math.ceil(Math.log2(maxColors))
  const paletteColors = medianCut(pixels, depth)

  // 统计每个颜色的出现次数和占比
  return paletteColors.map(([r, g, b]) => {
    const count = pixels.filter(p => 
      Math.abs(p[0] - r) < 16 && Math.abs(p[1] - g) < 16 && Math.abs(p[2] - b) < 16
    ).length
    return {
      r, g, b,
      hex: `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`,
      count,
      percentage: count / pixels.length,
    }
  }).sort((a, b) => b.count - a.count)
}

/**
 * 调色板映射 - 将图片颜色映射到目标调色板
 * 
 * 算法：对每个像素，在目标调色板中找到欧氏距离最近的颜色替换
 */
export function mapToPalette(
  imageData: ImageData,
  palette: [number, number, number][],
  options: {
    dithering?: boolean   // 是否启用抖动（建议配合 3.2 抖动处理使用）
  } = {}
): ImageData {
  const { data, width, height } = imageData
  const result = new ImageData(new Uint8ClampedArray(data), width, height)

  // 预计算调色板的查找表（加速最近颜色搜索）
  function findNearest(r: number, g: number, b: number): [number, number, number] {
    let minDist = Infinity
    let nearest: [number, number, number] = palette[0]
    for (const color of palette) {
      const dist = (r - color[0]) ** 2 + (g - color[1]) ** 2 + (b - color[2]) ** 2
      if (dist < minDist) {
        minDist = dist
        nearest = color
      }
    }
    return nearest
  }

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue // 保留透明像素
    const [nr, ng, nb] = findNearest(data[i], data[i + 1], data[i + 2])
    result.data[i]     = nr
    result.data[i + 1] = ng
    result.data[i + 2] = nb
    result.data[i + 3] = data[i + 3]
  }

  return result
}

/**
 * 导出调色板为文件
 * 支持 ASE (Adobe Swatch Exchange)、GPL (GIMP Palette)、TXT 格式
 */
export function exportPalette(
  palette: PaletteColor[],
  format: 'ase' | 'gpl' | 'txt' | 'json'
): string | Blob {
  switch (format) {
    case 'gpl':
      return [
        'GIMP Palette',
        `Name: PixelForge Export`,
        `Columns: ${Math.min(palette.length, 8)}`,
        '',
        ...palette.map(c => `${c.r}\t${c.g}\t${c.b}\t${c.hex}`),
      ].join('\n')

    case 'json':
      return JSON.stringify(palette, null, 2)

    case 'txt':
      return palette.map(c => c.hex).join('\n')

    default:
      return palette.map(c => c.hex).join(', ')
  }
}
```

**关键点**：
- Median Cut 是最常用的调色板提取算法，复杂度适中，效果优秀
- 可扩展使用 K-Means 或 Octree（八叉树）算法获得更精确的结果
- 预置 5+ 经典游戏调色板，一键映射出复古效果
- 调色板可导出为 GPL（GIMP/Aseprite 通用格式），直接用于像素画工具
- 可与抖动处理（3.2）联动，减少减色后的色带问题

**参考资源**：
- [Lospec Palette List](https://lospec.com/palette-list) — 海量像素画调色板资源
- [Median Cut Algorithm](https://en.wikipedia.org/wiki/Median_cut) — 中值切割算法

---

### 3.2 抖动处理 (Dithering)

**🌟 亮点等级：★★★★★（核心特色功能）**

**技术方案**：Floyd-Steinberg / Ordered / Atkinson 三种经典抖动算法

```typescript
// 示例代码：utils/dithering.ts

export type DitherAlgorithm = 'floyd-steinberg' | 'ordered' | 'atkinson' | 'none'

export interface DitherOptions {
  algorithm: DitherAlgorithm
  palette?: [number, number, number][]  // 目标调色板（可选，不传则使用 1-bit 黑白）
  levels?: number                       // 颜色级数（用于灰度/通道量化）
  bayerMatrixSize?: 4 | 8              // Bayer 矩阵尺寸（仅 Ordered 模式）
}

/**
 * Floyd-Steinberg 抖动算法
 * 
 * 经典误差扩散抖动，将量化误差按一定权重扩散到相邻像素
 * 误差扩散权重分布：
 *        当前像素  →  7/16
 *  3/16  ↓ 5/16   ↓ 1/16
 * 
 * 效果：过渡自然，是最常用的抖动算法
 */
export function floydSteinbergDither(
  imageData: ImageData,
  palette: [number, number, number][]
): ImageData {
  const { width, height } = imageData
  // 使用 Float32Array 存储像素以支持负误差值
  const pixels = new Float32Array(width * height * 3)
  for (let i = 0; i < imageData.data.length; i += 4) {
    pixels[i]     = imageData.data[i]
    pixels[i + 1] = imageData.data[i + 1]
    pixels[i + 2] = imageData.data[i + 2]
  }

  function getIndex(x: number, y: number): number {
    return (y * width + x) * 3
  }

  function findNearestPaletteColor(r: number, g: number, b: number): [number, number, number] {
    let minDist = Infinity
    let nearest = palette[0]
    for (const color of palette) {
      const dist = (r - color[0]) ** 2 + (g - color[1]) ** 2 + (b - color[2]) ** 2
      if (dist < minDist) { minDist = dist; nearest = color }
    }
    return nearest
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = getIndex(x, y)
      const oldR = pixels[idx], oldG = pixels[idx + 1], oldB = pixels[idx + 2]
      const [newR, newG, newB] = findNearestPaletteColor(oldR, oldG, oldB)

      pixels[idx]     = newR
      pixels[idx + 1] = newG
      pixels[idx + 2] = newB

      const errR = oldR - newR, errG = oldG - newG, errB = oldB - newB

      // 扩散误差到相邻像素
      const spread = [
        [x + 1, y,     7/16],
        [x - 1, y + 1, 3/16],
        [x,     y + 1, 5/16],
        [x + 1, y + 1, 1/16],
      ] as const

      for (const [sx, sy, weight] of spread) {
        if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
          const sIdx = getIndex(sx, sy)
          pixels[sIdx]     += errR * weight
          pixels[sIdx + 1] += errG * weight
          pixels[sIdx + 2] += errB * weight
        }
      }
    }
  }

  const result = new ImageData(width, height)
  for (let i = 0; i < pixels.length; i += 3) {
    result.data[i]     = Math.round(Math.max(0, Math.min(255, pixels[i])))
    result.data[i + 1] = Math.round(Math.max(0, Math.min(255, pixels[i + 1])))
    result.data[i + 2] = Math.round(Math.max(0, Math.min(255, pixels[i + 2])))
    result.data[i + 3] = imageData.data[i + 3] // 保留原始 Alpha
  }
  return result
}

/**
 * Ordered (Bayer) 抖动算法
 * 
 * 使用 Bayer 矩阵进行阈值抖动
 * 特点：产生规则的网格状纹理，经典 GameBoy 风格
 */
export function orderedDither(
  imageData: ImageData,
  palette: [number, number, number][],
  matrixSize: 4 | 8 = 4
): ImageData {
  // 4x4 Bayer 矩阵
  const bayer4x4 = [
    [0,  8,  2, 10],
    [12, 4, 14,  6],
    [3, 11,  1,  9],
    [15, 7, 13,  5],
  ]
  const matrix = matrixSize === 4 ? bayer4x4 : /* 8x8 Bayer 矩阵 */ bayer4x4

  const { width, height, data } = imageData
  const result = new ImageData(new Uint8ClampedArray(data), width, height)

  function findNearestPaletteColor(r: number, g: number, b: number): [number, number, number] {
    let minDist = Infinity
    let nearest = palette[0]
    for (const color of palette) {
      const dist = (r - color[0]) ** 2 + (g - color[1]) ** 2 + (b - color[2]) ** 2
      if (dist < minDist) { minDist = dist; nearest = color }
    }
    return nearest
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const threshold = (matrix[y % matrixSize][x % matrixSize] / 16 - 0.5) * 64

      const r = Math.max(0, Math.min(255, data[i] + threshold))
      const g = Math.max(0, Math.min(255, data[i + 1] + threshold))
      const b = Math.max(0, Math.min(255, data[i + 2] + threshold))

      const [nr, ng, nb] = findNearestPaletteColor(r, g, b)
      result.data[i]     = nr
      result.data[i + 1] = ng
      result.data[i + 2] = nb
      result.data[i + 3] = data[i + 3]
    }
  }

  return result
}

/**
 * Atkinson 抖动算法
 * 
 * 由 Apple Macintosh 开发者 Bill Atkinson 设计
 * 只扩散 6/8 的误差（而非 Floyd-Steinberg 的 16/16），产生高对比度效果
 * 非常适合像素画风格的图片处理
 */
export function atkinsonDither(
  imageData: ImageData,
  palette: [number, number, number][]
): ImageData {
  const { width, height } = imageData
  const pixels = new Float32Array(width * height * 3)
  for (let i = 0; i < imageData.data.length; i += 4) {
    pixels[i]     = imageData.data[i]
    pixels[i + 1] = imageData.data[i + 1]
    pixels[i + 2] = imageData.data[i + 2]
  }

  function getIndex(x: number, y: number) { return (y * width + x) * 3 }
  function findNearestPaletteColor(r: number, g: number, b: number): [number, number, number] {
    let minDist = Infinity, nearest = palette[0]
    for (const c of palette) {
      const d = (r-c[0])**2 + (g-c[1])**2 + (b-c[2])**2
      if (d < minDist) { minDist = d; nearest = c }
    }
    return nearest
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = getIndex(x, y)
      const oldR = pixels[idx], oldG = pixels[idx+1], oldB = pixels[idx+2]
      const [newR, newG, newB] = findNearestPaletteColor(oldR, oldG, oldB)
      pixels[idx] = newR; pixels[idx+1] = newG; pixels[idx+2] = newB

      // Atkinson 只扩散 1/8 误差到 6 个相邻像素（共 6/8 = 75%）
      const errR = (oldR - newR) / 8
      const errG = (oldG - newG) / 8
      const errB = (oldB - newB) / 8

      const targets = [[x+1,y], [x+2,y], [x-1,y+1], [x,y+1], [x+1,y+1], [x,y+2]]
      for (const [tx, ty] of targets) {
        if (tx >= 0 && tx < width && ty >= 0 && ty < height) {
          const ti = getIndex(tx as number, ty as number)
          pixels[ti]   += errR
          pixels[ti+1] += errG
          pixels[ti+2] += errB
        }
      }
    }
  }

  const result = new ImageData(width, height)
  for (let i = 0; i < pixels.length; i += 3) {
    result.data[i]     = Math.round(Math.max(0, Math.min(255, pixels[i])))
    result.data[i + 1] = Math.round(Math.max(0, Math.min(255, pixels[i + 1])))
    result.data[i + 2] = Math.round(Math.max(0, Math.min(255, pixels[i + 2])))
    result.data[i + 3] = imageData.data[i + 3]
  }
  return result
}
```

**关键点**：
- Floyd-Steinberg：最通用的抖动算法，过渡自然，适合照片转像素风
- Ordered (Bayer)：产生规则的点阵纹理，复古游戏机风格，适合 GameBoy / CGA 效果
- Atkinson：高对比度、细节保留好，经典 Mac 风格，非常适合像素画
- 应与调色板映射（3.1）联动使用：先选调色板，再选抖动算法
- 可视化对比：建议支持分屏对比预览不同抖动算法的效果

**参考资源**：
- [Dithering 算法对比](https://tannerhelland.com/2012/12/28/dithering-eleven-algorithms-source-code.html)
- [Floyd-Steinberg Wikipedia](https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering)

---

### 3.3 像素描边 / Outline

**🌟 亮点等级：★★★★☆（游戏开发刚需）**

**技术方案**：Canvas 像素扫描 + 膨胀算法

```typescript
// 示例代码：utils/outline.ts

export interface OutlineOptions {
  color: [number, number, number, number]  // 描边颜色 RGBA
  width: number                            // 描边宽度（像素）
  style: 'full' | 'inner' | 'outer'       // 描边样式：完整/内描边/外描边
}

/**
 * 像素描边算法
 * 
 * 用途：给精灵图角色添加像素描边，让角色在复杂背景上更加突出
 * 
 * 算法（外描边 full/outer）：
 * 1. 扫描所有像素，找到非透明像素的边缘
 * 2. 在边缘外围的透明区域绘制描边颜色
 * 3. 使用曼哈顿距离或棋盘距离控制描边宽度
 * 
 * 算法（内描边 inner）：
 * 1. 从边缘向内收缩指定像素宽度
 * 2. 将收缩区域内的像素替换为描边颜色
 */
export function addPixelOutline(
  sourceCanvas: HTMLCanvasElement,
  options: OutlineOptions
): HTMLCanvasElement {
  const { width, height } = sourceCanvas
  const ctx = sourceCanvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, width, height)
  const { data } = imageData

  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = width
  resultCanvas.height = height
  const resultCtx = resultCanvas.getContext('2d')!

  // 先绘制描边（底层）
  const [or, og, ob, oa] = options.color
  const outlineWidth = options.width

  // 标记非透明像素
  const isOpaque = (x: number, y: number): boolean => {
    if (x < 0 || x >= width || y < 0 || y >= height) return false
    return data[(y * width + x) * 4 + 3] > 0
  }

  // 检查像素是否在边缘附近
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      if (data[idx + 3] > 0) continue // 跳过已有像素

      // 检查周围是否有非透明像素
      let isEdge = false
      for (let dy = -outlineWidth; dy <= outlineWidth && !isEdge; dy++) {
        for (let dx = -outlineWidth; dx <= outlineWidth && !isEdge; dx++) {
          if (Math.abs(dx) + Math.abs(dy) <= outlineWidth) { // 曼哈顿距离
            if (isOpaque(x + dx, y + dy)) {
              isEdge = true
            }
          }
        }
      }

      if (isEdge) {
        const rIdx = (y * width + x) * 4
        data[rIdx]     = or
        data[rIdx + 1] = og
        data[rIdx + 2] = ob
        data[rIdx + 3] = oa
      }
    }
  }

  resultCtx.putImageData(imageData, 0, 0)
  return resultCanvas
}
```

**关键点**：
- 使用曼哈顿距离（|dx|+|dy|）控制描边宽度，产生 45° 斜角的像素描边效果
- 也可以使用切比雪夫距离（max(|dx|,|dy|)）产生正方形描边
- 支持 full（完整描边）、inner（内描边）、outer（外描边）三种模式
- 游戏开发中极常用：让角色在深色/浅色背景上都清晰可见
- 可扩展：支持渐变描边、发光描边（Glow Outline）效果

---

### 3.4 镜像翻转与旋转

**🌟 亮点等级：★★★★☆（精灵图工作流必备）**

**技术方案**：Canvas `transform` API

```typescript
// 示例代码：utils/transform.ts

export type FlipDirection = 'horizontal' | 'vertical'
export type RotateAngle = 90 | 180 | 270

/**
 * 镜像翻转
 */
export function flipCanvas(
  sourceCanvas: HTMLCanvasElement,
  direction: FlipDirection
): HTMLCanvasElement {
  const { width, height } = sourceCanvas
  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = width
  resultCanvas.height = height
  const ctx = resultCanvas.getContext('2d')!

  ctx.save()
  if (direction === 'horizontal') {
    ctx.translate(width, 0)
    ctx.scale(-1, 1)
  } else {
    ctx.translate(0, height)
    ctx.scale(1, -1)
  }
  ctx.drawImage(sourceCanvas, 0, 0)
  ctx.restore()

  return resultCanvas
}

/**
 * 旋转（90° / 180° / 270°）
 */
export function rotateCanvas(
  sourceCanvas: HTMLCanvasElement,
  angle: RotateAngle
): HTMLCanvasElement {
  const { width, height } = sourceCanvas
  const resultCanvas = document.createElement('canvas')
  const ctx = resultCanvas.getContext('2d')!

  if (angle === 90 || angle === 270) {
    resultCanvas.width = height
    resultCanvas.height = width
  } else {
    resultCanvas.width = width
    resultCanvas.height = height
  }

  ctx.save()
  ctx.translate(resultCanvas.width / 2, resultCanvas.height / 2)
  ctx.rotate((angle * Math.PI) / 180)
  ctx.drawImage(sourceCanvas, -width / 2, -height / 2)
  ctx.restore()

  return resultCanvas
}

/**
 * 批量翻转帧序列（生成四方向行走动画）
 * 常用场景：只有朝右的精灵帧 → 自动生成朝左的帧
 */
export function flipFrames(
  frames: HTMLCanvasElement[],
  direction: FlipDirection = 'horizontal'
): HTMLCanvasElement[] {
  return frames.map(frame => flipCanvas(frame, direction))
}
```

**关键点**：
- 像素画/精灵图开发中极度常用：通常只画一个方向，翻转生成反方向
- 支持批量操作帧序列，一键生成四方向精灵帧
- Canvas transform 性能极高，实时预览无压力

---

### 3.5 图片叠加与合成

**🌟 亮点等级：★★★☆☆**

**技术方案**：Canvas `globalCompositeOperation` 混合模式

```typescript
// 示例代码：utils/composite.ts

export type BlendMode =
  | 'source-over'      // 正常（默认）
  | 'multiply'         // 正片叠底
  | 'screen'           // 滤色
  | 'overlay'          // 叠加
  | 'darken'           // 变暗
  | 'lighten'          // 变亮
  | 'color-dodge'      // 颜色减淡
  | 'color-burn'       // 颜色加深
  | 'hard-light'       // 强光
  | 'soft-light'       // 柔光
  | 'difference'       // 差值
  | 'exclusion'        // 排除
  | 'hue'              // 色相
  | 'saturation'       // 饱和度
  | 'color'            // 颜色
  | 'luminosity'       // 明度

export interface CompositeOptions {
  blendMode: BlendMode
  opacity: number          // 叠加层透明度 0-1
  offsetX: number          // 叠加层 X 偏移
  offsetY: number          // 叠加层 Y 偏移
}

/**
 * 图片叠加合成
 * 支持所有 Canvas 原生混合模式
 */
export function compositeImages(
  baseCanvas: HTMLCanvasElement,
  overlayCanvas: HTMLCanvasElement,
  options: CompositeOptions
): HTMLCanvasElement {
  const { width, height } = baseCanvas
  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = width
  resultCanvas.height = height
  const ctx = resultCanvas.getContext('2d')!

  // 绘制底图
  ctx.drawImage(baseCanvas, 0, 0)

  // 设置混合模式并绘制叠加层
  ctx.globalCompositeOperation = options.blendMode
  ctx.globalAlpha = options.opacity
  ctx.drawImage(overlayCanvas, options.offsetX, options.offsetY)

  // 恢复默认
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1

  return resultCanvas
}
```

**关键点**：
- Canvas 原生支持 16+ 种混合模式，无需第三方库
- 常用场景：叠加纹理/噪点效果、光照叠加、阴影叠加
- 可扩展为多图层合成编辑器

---

### 3.6 九宫格切图 (9-Slice)

**🌟 亮点等级：★★★☆☆（游戏 UI 开发必备）**

**技术方案**：Canvas 按九宫格区域切割 + 可视化标注

```typescript
// 示例代码：utils/nine-slice.ts

export interface NineSliceConfig {
  // 四条切割线的位置（距离边缘的像素数）
  top: number
  bottom: number
  left: number
  right: number
}

export interface NineSliceResult {
  // 九个区域的 Canvas
  slices: {
    'top-left': HTMLCanvasElement
    'top-center': HTMLCanvasElement
    'top-right': HTMLCanvasElement
    'middle-left': HTMLCanvasElement
    'middle-center': HTMLCanvasElement    // 内容区域
    'middle-right': HTMLCanvasElement
    'bottom-left': HTMLCanvasElement
    'bottom-center': HTMLCanvasElement
    'bottom-right': HTMLCanvasElement
  }
  config: NineSliceConfig
  originalSize: { width: number; height: number }
}

/**
 * 九宫格切图
 * 
 * 将一张图片按 4 条切割线分成 9 个区域：
 * ┌─────┬──────────────┬─────┐
 * │ TL  │     TC       │ TR  │  ← 上边缘（不拉伸）
 * ├─────┼──────────────┼─────┤
 * │ ML  │     MC       │ MR  │  ← 中间（可拉伸）
 * ├─────┼──────────────┼─────┤
 * │ BL  │     BC       │ BR  │  ← 下边缘（不拉伸）
 * └─────┴──────────────┴─────┘
 * 
 * 四角(TL/TR/BL/BR)固定不拉伸
 * 四边(TC/BC/ML/MR)单方向拉伸
 * 中心(MC)两个方向拉伸
 */
export function nineSlice(
  sourceCanvas: HTMLCanvasElement,
  config: NineSliceConfig
): NineSliceResult {
  const { width, height } = sourceCanvas
  const ctx = sourceCanvas.getContext('2d')!
  const { top, bottom, left, right } = config

  const regions = [
    ['top-left',     0,      0,      left,         top],
    ['top-center',   left,   0,      width - right - left, top],
    ['top-right',    width - right,  0,      right, top],
    ['middle-left',  0,      top,    left,         height - top - bottom],
    ['middle-center',left,   top,    width - right - left, height - top - bottom],
    ['middle-right', width - right,  top,    right, height - top - bottom],
    ['bottom-left',  0,      height - bottom, left, bottom],
    ['bottom-center',left,   height - bottom, width - right - left, bottom],
    ['bottom-right', width - right, height - bottom, right, bottom],
  ] as const

  const slices = {} as NineSliceResult['slices']

  for (const [name, sx, sy, sw, sh] of regions) {
    const sliceCanvas = document.createElement('canvas')
    sliceCanvas.width = sw
    sliceCanvas.height = sh
    const sliceCtx = sliceCanvas.getContext('2d')!
    sliceCtx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, sw, sh)
    slices[name as keyof typeof slices] = sliceCanvas
  }

  return {
    slices,
    config,
    originalSize: { width, height },
  }
}

/**
 * 使用九宫格规则将图片绘制到指定尺寸
 * 模拟游戏引擎中的 9-Slice 渲染
 */
export function drawNineSlice(
  nineSliceResult: NineSliceResult,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  const { slices, config, originalSize } = nineSliceResult
  const canvas = document.createElement('canvas')
  canvas.width = targetWidth
  canvas.height = targetHeight
  const ctx = canvas.getContext('2d')!

  const { top, bottom, left, right } = config
  const innerW = targetWidth - left - right
  const innerH = targetHeight - top - bottom

  ctx.imageSmoothingEnabled = false

  // 四角（固定）
  ctx.drawImage(slices['top-left'], 0, 0)
  ctx.drawImage(slices['top-right'], targetWidth - right, 0)
  ctx.drawImage(slices['bottom-left'], 0, targetHeight - bottom)
  ctx.drawImage(slices['bottom-right'], targetWidth - right, targetHeight - bottom)

  // 四边（单方向拉伸）
  ctx.drawImage(slices['top-center'], left, 0, innerW, top)
  ctx.drawImage(slices['bottom-center'], left, targetHeight - bottom, innerW, bottom)
  ctx.drawImage(slices['middle-left'], 0, top, left, innerH)
  ctx.drawImage(slices['middle-right'], targetWidth - right, top, right, innerH)

  // 中心（双方向拉伸）
  ctx.drawImage(slices['middle-center'], left, top, innerW, innerH)

  return canvas
}
```

**关键点**：
- 九宫格是游戏 UI 开发中的基础技术，用于制作可缩放的按钮/面板/对话框
- 应提供可视化的切割线编辑器（可拖拽的 4 条线）
- 支持实时预览不同尺寸下的拉伸效果
- 可导出切割配置（JSON），方便在游戏引擎中使用

---

### 3.7 马赛克打码

**🌟 亮点等级：★★★☆☆**

**技术方案**：复用像素化算法 + 选区功能

```typescript
// 示例代码：utils/mosaic.ts

export interface MosaicOptions {
  blockSize: number                   // 马赛克块大小
  region?: {                          // 打码区域（不传则全图）
    x: number; y: number
    width: number; height: number
  }
}

/**
 * 马赛克打码
 * 
 * 与像素化原理类似，但支持选区打码
 * 可用于隐私保护（遮挡面部、车牌号、敏感信息等）
 */
export function applyMosaic(
  sourceCanvas: HTMLCanvasElement,
  options: MosaicOptions
): HTMLCanvasElement {
  const { width, height } = sourceCanvas
  const resultCanvas = document.createElement('canvas')
  resultCanvas.width = width
  resultCanvas.height = height
  const ctx = resultCanvas.getContext('2d')!

  // 先绘制原图
  ctx.drawImage(sourceCanvas, 0, 0)

  // 如果没有指定区域则全图打码
  const region = options.region ?? { x: 0, y: 0, width, height }
  const { blockSize } = options

  const imageData = ctx.getImageData(region.x, region.y, region.width, region.height)
  const { data } = imageData

  // 按块取平均颜色
  for (let y = 0; y < region.height; y += blockSize) {
    for (let x = 0; x < region.width; x += blockSize) {
      let totalR = 0, totalG = 0, totalB = 0, count = 0

      // 计算块内平均颜色
      for (let dy = 0; dy < blockSize && y + dy < region.height; dy++) {
        for (let dx = 0; dx < blockSize && x + dx < region.width; dx++) {
          const idx = ((y + dy) * region.width + (x + dx)) * 4
          totalR += data[idx]
          totalG += data[idx + 1]
          totalB += data[idx + 2]
          count++
        }
      }

      const avgR = Math.round(totalR / count)
      const avgG = Math.round(totalG / count)
      const avgB = Math.round(totalB / count)

      // 用平均颜色填充整个块
      for (let dy = 0; dy < blockSize && y + dy < region.height; dy++) {
        for (let dx = 0; dx < blockSize && x + dx < region.width; dx++) {
          const idx = ((y + dy) * region.width + (x + dx)) * 4
          data[idx]     = avgR
          data[idx + 1] = avgG
          data[idx + 2] = avgB
        }
      }
    }
  }

  ctx.putImageData(imageData, region.x, region.y)
  return resultCanvas
}
```

**关键点**：
- 与像素化的区别：支持矩形选区打码，不影响选区外的图片内容
- 建议提供可拖拽的选区矩形框
- 可扩展：支持高斯模糊打码、纯色覆盖打码等模式

---

### 3.8 批量处理

**🌟 亮点等级：★★★☆☆（提升工具实用性）**

**技术方案**：异步队列 + Web Worker 并行处理

```typescript
// 示例代码：composables/useBatchProcess.ts

export type BatchOperation =
  | { type: 'compress'; options: CompressOptions }
  | { type: 'format'; targetFormat: ImageFormat; quality: number }
  | { type: 'resize'; width: number; height: number }
  | { type: 'pixelate'; pixelSize: number }
  | { type: 'palette'; paletteName: string; dithering: DitherAlgorithm }

export interface BatchTask {
  id: string
  file: File
  status: 'pending' | 'processing' | 'done' | 'error'
  progress: number    // 0-100
  result?: Blob
  error?: string
}

/**
 * 批量处理管道
 * 支持对多个文件执行相同的操作序列
 */
export async function batchProcess(
  files: File[],
  operations: BatchOperation[],
  options: {
    concurrency?: number                // 并发数（默认 3）
    onProgress?: (task: BatchTask) => void
    onComplete?: (tasks: BatchTask[]) => void
  } = {}
): Promise<BatchTask[]> {
  const concurrency = options.concurrency ?? 3
  const tasks: BatchTask[] = files.map((file, i) => ({
    id: `task-${i}`,
    file,
    status: 'pending',
    progress: 0,
  }))

  // 处理单个文件
  async function processTask(task: BatchTask): Promise<void> {
    task.status = 'processing'
    options.onProgress?.(task)

    try {
      let current: Blob | CanvasElement = task.file

      for (const op of operations) {
        // 根据操作类型依次处理
        switch (op.type) {
          case 'compress':
            current = await compressImage(current as File, op.options)
            break
          case 'format':
            const canvas = await loadImageToCanvas(current as Blob)
            current = await convertFormat(canvas, op.targetFormat, op.quality)
            break
          // ... 其他操作
        }
      }

      task.result = current as Blob
      task.status = 'done'
      task.progress = 100
    } catch (err) {
      task.status = 'error'
      task.error = (err as Error).message
    }

    options.onProgress?.(task)
  }

  // 并发控制
  const executing: Promise<void>[] = []
  for (const task of tasks) {
    const promise = processTask(task)
    executing.push(promise)

    if (executing.length >= concurrency) {
      await Promise.race(executing)
      executing.splice(executing.findIndex(p => p === promise), 1)
    }
  }

  await Promise.all(executing)
  options.onComplete?.(tasks)
  return tasks
}
```

**关键点**：
- 支持拖拽上传多个文件，一键执行相同操作
- 并发控制避免浏览器内存溢出
- 支持进度展示、错误处理、失败重试
- 常用场景：批量压缩、批量格式转换、批量添加水印

---

### 3.9 图片信息查看

**🌟 亮点等级：★★☆☆☆（辅助工具）**

**技术方案**：Canvas 像素统计 + EXIF 解析（`exifr` 库）

```typescript
// 示例代码：utils/image-info.ts

export interface ImageInfo {
  // 基础信息
  width: number
  height: number
  aspectRatio: string
  fileSize: number
  fileType: string
  bitDepth: number
  // 颜色统计
  colorCount: number         // 唯一颜色数
  dominantColor: string      // 主色调
  averageColor: string       // 平均颜色
  transparency: boolean      // 是否含透明通道
  transparentPixels: number  // 透明像素占比
  // 直方图数据
  histogram: {
    r: number[]              // 256 级红色通道分布
    g: number[]
    b: number[]
    a: number[]
    luminance: number[]      // 亮度分布
  }
  // EXIF 数据（如有）
  exif?: Record<string, unknown>
}

/**
 * 分析图片信息
 */
export function analyzeImageInfo(
  imageData: ImageData,
  file: File
): ImageInfo {
  const { data, width, height } = imageData
  const colorSet = new Set<string>()
  const histogram = { r: new Array(256).fill(0), g: new Array(256).fill(0), b: new Array(256).fill(0), a: new Array(256).fill(0), luminance: new Array(256).fill(0) }
  let totalR = 0, totalG = 0, totalB = 0
  let transparentCount = 0

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3]
    colorSet.add(`${r},${g},${b}`)
    histogram.r[r]++
    histogram.g[g]++
    histogram.b[b]++
    histogram.a[a]++
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
    histogram.luminance[lum]++
    totalR += r; totalG += g; totalB += b
    if (a === 0) transparentCount++
  }

  const pixelCount = width * height
  return {
    width, height,
    aspectRatio: `${width}:${height}`,
    fileSize: file.size,
    fileType: file.type,
    bitDepth: file.type === 'image/png' ? 8 : 8, // 简化
    colorCount: colorSet.size,
    dominantColor: '', // 需调色板提取
    averageColor: `rgb(${Math.round(totalR/pixelCount)},${Math.round(totalG/pixelCount)},${Math.round(totalB/pixelCount)})`,
    transparency: transparentCount > 0,
    transparentPixels: transparentCount / pixelCount,
    histogram,
  }
}
```

**关键点**：
- 可视化颜色直方图，帮助用户了解图片色彩分布
- 统计唯一颜色数，对像素画特别有用（判断是否符合目标色数限制）
- 需安装 `exifr` 库解析 EXIF 元数据

---

## UI/UX 像素风格方案

### 方案一：使用 NES.css（推荐）

```bash
pnpm add nes.css
```

```typescript
// main.ts
import 'nes.css/css/nes.min.css'
```

NES.css 提供：
- 像素风按钮（`nes-btn`）
- 像素风容器/面板（`nes-container`）
- 像素风对话框（`nes-dialog`）
- 像素风输入框、滑块、进度条等
- 复古游戏机风格的 UI 元素

### 方案二：手写像素 CSS

```css
/* 像素风格基础样式参考 */
:root {
  --pixel-border: 4px;
  --pixel-shadow: #212529;
  --pixel-font: 'Press Start 2P', monospace;
}

/* 像素边框效果 */
.pixel-border {
  border: var(--pixel-border) solid #212529;
  box-shadow:
    /* 外边框 */
    inset -4px -4px 0px 0px var(--pixel-shadow),
    inset 4px 4px 0px 0px #adb5bd;
}

/* 像素按钮 */
.pixel-button {
  font-family: var(--pixel-font);
  font-size: 12px;
  padding: 8px 16px;
  border: none;
  cursor: pointer;
  image-rendering: pixelated;
}
```

### 像素字体

推荐使用 Google Fonts 中的像素字体：

```html
<!-- 在 index.html 中引入 -->
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet">
```

常用像素字体：
- **Press Start 2P** — 经典 8-bit 像素字体（推荐）
- **Silkscreen** — 清晰易读的像素字体
- **VT323** — 终端风格像素字体
- **Pixelify Sans** — 现代感像素字体

---

## 开发计划与里程碑

### Phase 1：基础架构搭建（1-2 天）
- [x] 初始化 Vue 3 + Vite + TypeScript 项目
- [ ] 安装核心依赖
- [ ] 搭建路由系统（首页、图片处理、精灵图处理）
- [ ] 实现 Pinia Store
- [ ] 搭建像素风 UI 基础组件
- [ ] 实现图片上传和预览组件

### Phase 2：图片处理 - 核心功能（3-5 天）
- [ ] 像素化处理（Canvas 核心）
- [ ] 格式互换
- [ ] 图片压缩
- [ ] 修改尺寸和分辨率
- [ ] 像素颜色替换
- [ ] AI 去除背景
- [ ] AI 抠图（含手动精修）

### Phase 3：图片处理 - 特色功能（3-5 天）
- [ ] 🌟 调色板提取与映射（Median Cut + 经典游戏调色板）
- [ ] 🌟 抖动处理（Floyd-Steinberg / Ordered / Atkinson 三种算法）
- [ ] 像素描边 / Outline
- [ ] 镜像翻转与旋转
- [ ] 图片叠加与合成（混合模式）
- [ ] 九宫格切图（9-Slice）
- [ ] 马赛克打码

### Phase 4：精灵图功能（3-4 天）
- [ ] 精灵图网格拆帧
- [ ] 帧动画播放预览
- [ ] 精灵图合并
- [ ] GIF 导出
- [ ] GIF 导入/解码预览
- [ ] GIF 导入拆解为帧序列

### Phase 5：扩展与完善（2-3 天）
- [ ] 批量处理（多文件并发处理管道）
- [ ] 图片信息查看（颜色直方图、EXIF、调色板分析）
- [ ] Web Worker 性能优化
- [ ] 大文件处理优化（分片、流式处理）
- [ ] 响应式布局适配
- [ ] 快捷键支持
- [ ] 操作历史记录（撤销/重做）
- [ ] 暗色/亮色主题切换

---

## 参考文档与资源

### 官方文档

| 技术 | 链接 |
|------|------|
| Vue 3 文档 | [https://cn.vuejs.org/](https://cn.vuejs.org/) |
| Vite 文档 | [https://cn.vitejs.dev/](https://cn.vitejs.dev/) |
| Canvas API | [https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API](https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API) |
| Pinia | [https://pinia.vuejs.org/zh/](https://pinia.vuejs.org/zh/) |
| Vue Router | [https://router.vuejs.org/zh/](https://router.vuejs.org/zh/) |

### 核心库文档

| 库 | 链接 | 说明 |
|----|------|------|
| @imgly/background-removal | [GitHub](https://github.com/imgly/background-removal-js) | 浏览器端 AI 背景移除 |
| browser-image-compression | [GitHub](https://github.com/Donaldcwl/browser-image-compression) | 浏览器端图片压缩 |
| pica | [GitHub](https://github.com/nodeca/pica) | 高质量图片缩放 |
| gif.js | [GitHub](https://github.com/jnordberg/gif.js) | GIF 动画编码器 |
| gifuct-js | [GitHub](https://github.com/matt-way/gifuct-js) | GIF 文件解析器 |
| NES.css | [GitHub](https://github.com/nicgord/nes.css) | 像素风 CSS 框架 |
| file-saver | [GitHub](https://github.com/nicgord/nicgord) | 文件下载保存 |

### 学习资源

- **像素画颜色量化算法**：[Median Cut Algorithm](https://en.wikipedia.org/wiki/Median_cut)
- **抖动算法大全**：[Dithering - Eleven Algorithms (Source Code)](https://tannerhelland.com/2012/12/28/dithering-eleven-algorithms-source-code.html)
- **Floyd-Steinberg 抖动**：[Wikipedia](https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering)
- **Atkinson 抖动**：[原理解析](https://beyondloom.com/blog/dither.html)
- **精灵图自动拆分**：[Connected Component Labeling](https://en.wikipedia.org/wiki/Connected-component_labeling)
- **GIF 格式规范**：[GIF89a Specification](https://www.w3.org/Graphics/GIF/spec-gif89a.txt)
- **像素艺术调色板**：[Lospec Palette List](https://lospec.com/palette-list)
- **Canvas 像素操作**：[MDN - ImageData](https://developer.mozilla.org/zh-CN/docs/Web/API/ImageData)
- **Canvas 混合模式**：[MDN - globalCompositeOperation](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation)
- **九宫格切图原理**：[9-Slice Scaling](https://docs.unity3d.com/Manual/9SliceSprites.html)
- **EXIF 解析库**：[exifr](https://github.com/MikeKovarik/exifr)
- **K-Means 颜色聚类**：[Color Quantization](https://en.wikipedia.org/wiki/Color_quantization)

### 设计灵感

- [Piskel](https://www.piskelapp.com/) — 在线像素画编辑器
- [Aseprite](https://www.aseprite.org/) — 专业像素画工具
- [Pixel Editor](https://pixelcraft.web.app/) — Web 端像素编辑器
- [ sprite-sheet-editor](https://github.com/) — 精灵图编辑参考
- [Dithermark](https://app.dithermark.com/) — 在线抖动效果生成器
- [Lospec](https://lospec.com/) — 像素画资源社区（调色板、教程、工具）

---

> 📝 本文档会随项目开发持续更新。建议使用 Markdown 编辑器（如 VS Code 的 Markdown Preview）查看完整格式。
