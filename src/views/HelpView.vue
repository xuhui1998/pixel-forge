<template>
  <div class="help-page">
    <div class="help-header">
      <h1>使用帮助</h1>
      <p>了解 PixelForge 每个功能的用途和操作方式</p>
    </div>

    <div class="help-content">
      <!-- 图片处理 -->
      <section class="help-section">
        <h2>
          <Image :size="20" :stroke-width="1.5" />
          图片处理
        </h2>

        <div class="help-cards">
          <div class="help-card">
            <h3>像素化</h3>
            <p>将普通图片转换为像素风格。上传图片后，调整像素块大小即可预览效果。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传图片 → 调整像素大小 → 导出 PNG</span>
            </div>
          </div>

          <div class="help-card">
            <h3>格式转换</h3>
            <p>在 PNG、JPEG、WebP、BMP 格式之间互转，支持设置 JPEG/WebP 质量。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传图片 → 选择目标格式 → 调整质量 → 下载</span>
            </div>
          </div>

          <div class="help-card">
            <h3>图片压缩</h3>
            <p>减小图片文件体积，支持多级压缩质量和目标大小限制。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传图片 → 拖动质量滑块 → 查看压缩前后对比 → 下载</span>
            </div>
          </div>

          <div class="help-card">
            <h3>调整尺寸</h3>
            <p>等比或自由缩放图片尺寸，支持锁定宽高比。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传图片 → 输入目标宽高 → 选择缩放算法 → 下载</span>
            </div>
          </div>

          <div class="help-card">
            <h3>颜色替换</h3>
            <p>将图片中某种颜色替换为另一种颜色，支持容差调节和实时预览。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传图片 → 点击拾取源颜色 → 选择目标颜色 → 调整容差 → 下载</span>
            </div>
          </div>

          <div class="help-card">
            <h3>背景移除</h3>
            <p>自动移除图片中的纯色背景（如白底、绿幕），支持容差调节。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传图片 → 选择背景颜色（或点击拾取） → 调整容差 → 下载透明 PNG</span>
            </div>
          </div>

          <div class="help-card">
            <h3>智能抠图</h3>
            <p>手动涂抹标记前景/背景区域进行抠图。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传图片 → 用画笔标记前景 → 生成抠图结果 → 下载</span>
            </div>
          </div>

          <div class="help-card">
            <h3>调色板映射</h3>
            <p>将图片颜色映射到指定的调色板，生成限定配色的像素图。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传图片 → 选择或自定义调色板 → 导出</span>
            </div>
          </div>

          <div class="help-card">
            <h3>抖动算法</h3>
            <p>对图片应用 Floyd-Steinberg 等抖动算法，让低色彩图片过渡更自然。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传图片 → 选择抖动算法 → 调整参数 → 导出</span>
            </div>
          </div>

          <div class="help-card">
            <h3>像素描边</h3>
            <p>为图片中的角色/物体自动生成像素风描边。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传图片 → 选择描边颜色和宽度 → 导出</span>
            </div>
          </div>

          <div class="help-card">
            <h3>镜像翻转</h3>
            <p>水平或垂直翻转图片。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传图片 → 选择水平/垂直翻转 → 下载</span>
            </div>
          </div>

          <div class="help-card">
            <h3>图片合成</h3>
            <p>将多张图片叠加合成一张，支持调整位置、大小和透明度。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传多张图片 → 拖拽调整位置 → 导出合成图</span>
            </div>
          </div>

          <div class="help-card">
            <h3>九宫格切图</h3>
            <p>将图片按九宫格方式切割，适用于可拉伸 UI 素材制作。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传图片 → 拖动切割线位置 → 导出九宫格切片</span>
            </div>
          </div>

          <div class="help-card">
            <h3>马赛克模糊</h3>
            <p>对图片指定区域进行马赛克/模糊处理。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传图片 → 框选区域 → 调整模糊强度 → 导出</span>
            </div>
          </div>

          <div class="help-card">
            <h3>批量处理</h3>
            <p>一次性对多张图片执行相同的处理操作。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传多张图片 → 选择处理类型 → 统一设置参数 → 批量下载</span>
            </div>
          </div>

          <div class="help-card">
            <h3>水印</h3>
            <p>为图片添加文字或图片水印，支持位置和透明度设置。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传图片 → 输入水印文字/上传水印图 → 调整位置和透明度 → 导出</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 精灵图 -->
      <section class="help-section">
        <h2>
          <Film :size="20" :stroke-width="1.5" />
          精灵图
        </h2>

        <div class="help-cards">
          <div class="help-card">
            <h3>精灵图拆分</h3>
            <p>将合成的精灵图（Sprite Sheet）拆分为独立的帧图片，支持按行列数或固定尺寸切割。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传精灵图 → 设置行/列数或单帧尺寸 → 预览 → 批量下载</span>
            </div>
          </div>

          <div class="help-card">
            <h3>精灵图合并</h3>
            <p>将多张独立帧图片合并为一张精灵图，支持自定义行列排布。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传多张帧图片 → 设置排布方式 → 预览 → 下载精灵图</span>
            </div>
          </div>

          <div class="help-card">
            <h3>瓦片地图切割</h3>
            <p>从瓦片地图中自动识别并提取去重后的独立瓦片，生成瓦片集和地图数据。</p>
            <div class="help-card__tips">
              <span class="tip-label">操作：</span>
              <span>上传瓦片地图 → 设置瓦片大小 → 自动识别去重 → 导出瓦片集 PNG + JSON 地图数据</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 图片编辑 -->
      <section class="help-section">
        <h2>
          <PenTool :size="20" :stroke-width="1.5" />
          图片编辑
        </h2>

        <div class="help-cards">
          <div class="help-card help-card--highlight">
            <h3>瓦片编辑器</h3>
            <p>上传一张瓦片集素材，在网格覆盖的源图上直接拖拽方块到目标位置，拼合出新的瓦片地图。支持单格拖拽和批量框选拖拽。</p>
            <div class="help-card__detail">
              <h4>快捷键与交互</h4>
              <table class="help-table">
                <thead>
                  <tr>
                    <th>操作</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><kbd>左键拖拽</kbd> 源图方块</td>
                    <td>从源图上提取一个网格方块，拖到画布目标位置放置</td>
                  </tr>
                  <tr>
                    <td><kbd>Shift</kbd> + <kbd>左键拖拽</kbd> 源图</td>
                    <td>橡皮筋框选多个连续瓦片，松开后拖拽整块区域到目标位置</td>
                  </tr>
                  <tr>
                    <td><kbd>左键拖拽</kbd> 已放置图层</td>
                    <td>移动已放置的瓦片图层位置</td>
                  </tr>
                  <tr>
                    <td><kbd>右键拖拽</kbd></td>
                    <td>平移画布视口</td>
                  </tr>
                  <tr>
                    <td><kbd>中键拖拽</kbd></td>
                    <td>平移画布视口</td>
                  </tr>
                  <tr>
                    <td><kbd>空格</kbd> + <kbd>左键拖拽</kbd></td>
                    <td>平移画布视口</td>
                  </tr>
                  <tr>
                    <td><kbd>滚轮</kbd></td>
                    <td>缩放画布</td>
                  </tr>
                  <tr>
                    <td><kbd>Delete</kbd> / <kbd>Backspace</kbd></td>
                    <td>删除选中的图层</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="help-card__detail">
              <h4>单格拖拽流程</h4>
              <ol class="help-steps">
                <li>在右侧面板点击或拖拽上传一张瓦片集素材图片</li>
                <li>在「网格设置」中调整网格/瓦片大小（如 16px、32px）</li>
                <li>源图会以半透明方式显示在画布上，并叠加网格线</li>
                <li>鼠标悬停在源图上会高亮当前格子</li>
                <li><strong>左键按住源图上的格子拖拽</strong>到目标位置松开，即可放置一个瓦片</li>
                <li>开启「吸附到网格」可以让放置位置自动对齐网格</li>
              </ol>
            </div>
            <div class="help-card__detail">
              <h4>批量框选流程</h4>
              <ol class="help-steps">
                <li>在源图上<strong>按住 Shift + 左键拖拽</strong>，出现橙色虚线选区框</li>
                <li>选区会自动对齐网格，右上角显示选区尺寸（如 3×2）</li>
                <li>松开鼠标后，选区内容变为批量拖拽预览</li>
                <li><strong>继续拖动到目标位置松开</strong>，所有瓦片将按相对位置依次放置</li>
                <li>每个瓦片会成为独立图层，可在右侧图层列表中单独管理</li>
              </ol>
            </div>
            <div class="help-card__detail">
              <h4>后续管理</h4>
              <ol class="help-steps">
                <li>在右侧图层列表中管理已放置的瓦片（显隐、锁定、删除）</li>
                <li>完成后点击「导出合成图 PNG」下载最终结果</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <!-- 通用说明 -->
      <section class="help-section">
        <h2>
          <Info :size="20" :stroke-width="1.5" />
          通用说明
        </h2>

        <div class="help-cards">
          <div class="help-card">
            <h3>上传图片</h3>
            <p>所有功能都支持点击上传和拖拽上传两种方式，支持 PNG、JPEG、WebP、BMP、GIF 等常见格式。</p>
          </div>
          <div class="help-card">
            <h3>处理方式</h3>
            <p>所有图片处理均在浏览器本地完成，不会上传到服务器，保护你的隐私和数据安全。</p>
          </div>
          <div class="help-card">
            <h3>主题切换</h3>
            <p>导航栏右侧可以切换日间/夜间/跟随系统三种主题模式。</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Image, Film, PenTool, Info } from 'lucide-vue-next'
</script>

<style scoped>
.help-page {
  max-width: 960px;
  margin: 0 auto;
  padding: var(--space-lg) var(--space-lg) var(--space-xl);
}

.help-header {
  margin-bottom: var(--space-xl);
}
.help-header h1 {
  font-size: var(--text-2xl);
  font-weight: var(--weight-bold);
  color: var(--color-ink);
  margin-bottom: var(--space-xs);
}
.help-header p {
  font-size: var(--text-base);
  color: var(--color-body);
}

.help-section {
  margin-bottom: var(--space-xl);
}
.help-section h2 {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  color: var(--color-ink);
  margin-bottom: var(--space-base);
  padding-bottom: var(--space-xs);
  border-bottom: 2px solid var(--color-hairline);
}

.help-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-base);
}

.help-card {
  background: var(--color-surface-card);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-lg);
  padding: var(--space-base);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
.help-card--highlight {
  grid-column: 1 / -1;
  border-color: var(--color-primary);
  border-width: 2px;
}

.help-card h3 {
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--color-ink);
}
.help-card > p {
  font-size: var(--text-sm);
  color: var(--color-body);
  line-height: var(--leading-relaxed);
}

.help-card__tips {
  margin-top: auto;
  padding-top: var(--space-xs);
  font-size: var(--text-xs);
  color: var(--color-muted);
}
.tip-label {
  color: var(--color-primary);
  font-weight: var(--weight-medium);
  margin-right: 4px;
}

.help-card__detail {
  margin-top: var(--space-sm);
}
.help-card__detail h4 {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  color: var(--color-ink);
  margin-bottom: var(--space-xs);
}

.help-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
  margin-bottom: var(--space-base);
}
.help-table th {
  text-align: left;
  padding: var(--space-xxs) var(--space-xs);
  background: var(--color-canvas);
  font-weight: var(--weight-medium);
  color: var(--color-body);
  border-bottom: 1px solid var(--color-hairline);
}
.help-table td {
  padding: var(--space-xxs) var(--space-xs);
  border-bottom: 1px solid var(--color-hairline-soft);
  color: var(--color-body);
  vertical-align: top;
}

kbd {
  display: inline-block;
  padding: 1px 6px;
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline-strong);
  border-radius: 3px;
  color: var(--color-ink);
  white-space: nowrap;
}

.help-steps {
  padding-left: 20px;
  font-size: var(--text-sm);
  color: var(--color-body);
  line-height: var(--leading-relaxed);
}
.help-steps li {
  margin-bottom: var(--space-xxs);
}
.help-steps strong {
  color: var(--color-primary);
}
</style>
