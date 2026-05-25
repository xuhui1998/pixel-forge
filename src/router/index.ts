import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/image',
    name: 'ImageProcess',
    component: () => import('../views/ImageProcessView.vue'),
    children: [
      {
        path: '',
        redirect: '/image/pixelate',
      },
      {
        path: 'pixelate',
        name: 'Pixelate',
        component: () => import('../components/image/Pixelate.vue'),
      },
      {
        path: 'format',
        name: 'FormatConvert',
        component: () => import('../components/image/FormatConvert.vue'),
      },
      {
        path: 'compress',
        name: 'Compress',
        component: () => import('../components/image/ImageCompress.vue'),
      },
      {
        path: 'resize',
        name: 'Resize',
        component: () => import('../components/image/ResizeImage.vue'),
      },
      {
        path: 'color-replace',
        name: 'ColorReplace',
        component: () => import('../components/image/ColorReplace.vue'),
      },
      {
        path: 'bg-remove',
        name: 'BgRemoval',
        component: () => import('../components/image/BgRemoval.vue'),
      },
      {
        path: 'cutout',
        name: 'AiCutout',
        component: () => import('../components/image/AiCutout.vue'),
      },
      {
        path: 'palette',
        name: 'PaletteMapper',
        component: () => import('../components/image/PaletteMapper.vue'),
      },
      {
        path: 'dithering',
        name: 'Dithering',
        component: () => import('../components/image/Dithering.vue'),
      },
      {
        path: 'outline',
        name: 'PixelOutline',
        component: () => import('../components/image/PixelOutline.vue'),
      },
      {
        path: 'mirror-flip',
        name: 'MirrorFlip',
        component: () => import('../components/image/MirrorFlip.vue'),
      },
      {
        path: 'composite',
        name: 'ImageComposite',
        component: () => import('../components/image/ImageComposite.vue'),
      },
      {
        path: 'nine-slice',
        name: 'NineSlice',
        component: () => import('../components/image/NineSlice.vue'),
      },
      {
        path: 'mosaic',
        name: 'MosaicBlur',
        component: () => import('../components/image/MosaicBlur.vue'),
      },
      {
        path: 'batch',
        name: 'BatchProcess',
        component: () => import('../components/image/BatchProcess.vue'),
      },
      {
        path: 'watermark',
        name: 'Watermark',
        component: () => import('../components/image/Watermark.vue'),
      },

    ],
  },
  {
    path: '/sprite',
    name: 'Sprite',
    component: () => import('../views/SpriteView.vue'),
    children: [
      {
        path: '',
        redirect: '/sprite/split',
      },
      {
        path: 'split',
        name: 'SpriteSplit',
        component: () => import('../components/sprite/SpriteSplitter.vue'),
      },
      {
        path: 'merge',
        name: 'SpriteMerge',
        component: () => import('../components/sprite/SpriteMerger.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
