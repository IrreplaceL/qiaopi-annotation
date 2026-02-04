<template>
  <div class="annotation-container">
    <!-- 顶部工具栏 -->
    <header class="toolbar">
      <div class="toolbar-title">侨批文献标注系统</div>
      <div class="toolbar-actions">
        <button class="btn btn-primary" @click="save">保存标注</button>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 左侧：图像显示区 -->
      <section class="image-panel">
        <div class="panel-header">
          <h3>侨批图像</h3>
          <span class="text-direction">{{ textDirection === 'vertical' ? '竖排文字' : '横排文字' }}</span>
        </div>
        <div class="image-container" ref="imageContainerRef">
          <div class="image-wrapper" ref="imageWrapperRef">
            <img 
              src="../assets/qiaopi1.jpg" 
              alt="侨批"
              class="qiaopi-image"
              ref="imageRef"
              @load="onImageLoad"
            />
            <svg 
              v-if="imageLoaded"
              class="bbox-overlay"
              :width="imageDisplayWidth"
              :height="imageDisplayHeight"
              @click="handleImageClick"
            >
              <g
                v-for="item in annotationData"
                :key="item.line_id"
              >
                <rect
                  :x="item.bbox[0] * scaleRatio"
                  :y="item.bbox[1] * scaleRatio"
                  :width="(item.bbox[2] - item.bbox[0]) * scaleRatio"
                  :height="(item.bbox[3] - item.bbox[1]) * scaleRatio"
                  :class="['bbox-rect', { 'bbox-active': highlightedLineId === item.line_id }]"
                  @click.stop="handleBboxClick(item)"
                  @mouseenter="handleBboxHover(item.line_id)"
                  @mouseleave="handleBboxLeave"
                />
                <text
                  :x="item.bbox[0] * scaleRatio + 5"
                  :y="item.bbox[1] * scaleRatio + 15"
                  class="bbox-label"
                >
                  {{ item.line_id }}
                </text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      <!-- 右侧：标注区域 -->
      <section class="annotation-panel">
        <div class="panel-header">
          <h3>OCR识别结果</h3>
          <div class="entity-types">
            <span 
              v-for="entityType in entityTypes" 
              :key="entityType.type"
              class="entity-tag"
              :style="{ backgroundColor: entityType.color + '20', color: entityType.color }"
            >
              {{ entityType.label }}
            </span>
          </div>
        </div>
        
        <!-- 文本显示区域 -->
        <div class="text-list-container" ref="textListRef">
          <div 
            v-for="item in annotationData" 
            :key="item.line_id"
            :data-line-id="item.line_id"
            :class="['text-line-item', { 'line-active': highlightedLineId === item.line_id }]"
            @click="handleLineClick(item)"
            @mouseenter="handleLineHover(item.line_id)"
            @mouseleave="handleLineLeave"
          >
            <div class="line-header">
              <span class="line-number-badge">第 {{ item.line_id }} 行</span>
              <span class="line-score">置信度: {{ (item.score * 100).toFixed(1) }}%</span>
            </div>
            <div :class="['line-text', textDirection === 'vertical' ? 'vertical-text' : 'horizontal-text']">
              <span
                v-for="(char, index) in item.corrected_text.split('')"
                :key="index"
                :class="['text-char', getCharClass(item, index)]"
                :style="getCharStyle(item, index)"
                :title="getCharTitle(item, index)"
              >
                {{ char }}
              </span>
            </div>
            <div v-if="item.ocr_text !== item.corrected_text" class="ocr-diff">
              <span class="ocr-label">OCR:</span>
              <span class="ocr-text">{{ item.ocr_text }}</span>
            </div>
          </div>
        </div>

        <!-- 编辑面板 -->
        <div v-if="selectedLine" class="edit-panel">
          <div class="edit-header">
            <h4>编辑第 {{ selectedLine.line_id }} 行</h4>
            <button class="btn-close" @click="selectedLine = null">×</button>
          </div>
          <div class="edit-body">
            <div class="form-group">
              <label>OCR原文：</label>
              <div class="text-display">{{ selectedLine.ocr_text }}</div>
            </div>
            <div class="form-group">
              <label>校正文本：</label>
              <input 
                v-model="selectedLine.corrected_text" 
                class="form-control"
                @input="updateText"
              />
            </div>
            <div class="form-group">
              <label>实体标注：</label>
              <div class="entities-list">
                <div 
                  v-for="(entity, idx) in selectedLine.entities" 
                  :key="idx"
                  class="entity-item"
                  :style="{ borderLeftColor: getEntityColor(entity.type) }"
                >
                  <span class="entity-text">{{ entity.text }}</span>
                  <select 
                    v-model="entity.type" 
                    class="entity-type-select"
                    @change="updateEntities"
                  >
                    <option v-for="type in entityTypes" :key="type.type" :value="type.type">
                      {{ type.label }}
                    </option>
                  </select>
                  <button class="btn-delete" @click="deleteEntity(idx)">删除</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { annotationData as mockAnnotationData, entityTypes } from '../mockData1.js'

const annotationData = ref(mockAnnotationData)
const selectedLine = ref(null)
const highlightedLineId = ref(null)
const imageRef = ref(null)
const imageWrapperRef = ref(null)
const imageContainerRef = ref(null)
const textListRef = ref(null)
const imageLoaded = ref(false)
const imageWidth = ref(0)
const imageHeight = ref(0)
const imageDisplayWidth = ref(0)
const imageDisplayHeight = ref(0)
const scaleRatio = ref(1)

// 判断文字方向：根据bbox的宽高比判断
const textDirection = computed(() => {
  if (annotationData.value.length === 0) return 'vertical'
  
  // 计算大多数文本框的宽高比
  let verticalCount = 0
  let horizontalCount = 0
  
  annotationData.value.forEach(item => {
    if (item.bbox) {
      const width = item.bbox[2] - item.bbox[0]
      const height = item.bbox[3] - item.bbox[1]
      const ratio = height / width
      
      // 高度大于宽度的2倍认为是竖排
      if (ratio > 2) {
        verticalCount++
      } else {
        horizontalCount++
      }
    }
  })
  
  return verticalCount > horizontalCount ? 'vertical' : 'horizontal'
})

// 图片加载完成
const onImageLoad = () => {
  if (imageRef.value) {
    updateImageDimensions()
  }
}

// 更新图片尺寸和缩放比例
const updateImageDimensions = () => {
  if (imageRef.value) {
    const naturalWidth = imageRef.value.naturalWidth
    const naturalHeight = imageRef.value.naturalHeight
    const displayWidth = imageRef.value.clientWidth
    const displayHeight = imageRef.value.clientHeight
    
    imageWidth.value = naturalWidth
    imageHeight.value = naturalHeight
    imageDisplayWidth.value = displayWidth
    imageDisplayHeight.value = displayHeight
    scaleRatio.value = displayWidth / naturalWidth
    imageLoaded.value = true
  }
}

onMounted(() => {
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (imageLoaded.value) {
      updateImageDimensions()
    }
  })
})

// 获取字符所属实体类型
const getEntityForChar = (item, index) => {
  return item.entities.find(entity => 
    index >= entity.start && index < entity.end
  )
}

// 获取字符的CSS类
const getCharClass = (item, index) => {
  const entity = getEntityForChar(item, index)
  return entity ? 'highlighted' : ''
}

// 获取字符的样式
const getCharStyle = (item, index) => {
  const entity = getEntityForChar(item, index)
  if (entity) {
    const color = getEntityColor(entity.type)
    return {
      backgroundColor: color + '30',
      borderLeftColor: textDirection.value === 'vertical' ? color : 'transparent',
      borderTopColor: textDirection.value === 'horizontal' ? color : 'transparent'
    }
  }
  return {}
}

// 获取字符的提示信息
const getCharTitle = (item, index) => {
  const entity = getEntityForChar(item, index)
  if (entity) {
    const type = entityTypes.find(t => t.type === entity.type)
    return `${type?.label}: ${entity.text}`
  }
  return ''
}

// 获取实体类型颜色
const getEntityColor = (type) => {
  const entityType = entityTypes.find(t => t.type === type)
  return entityType?.color || '#999'
}

// 处理bbox点击
const handleBboxClick = (item) => {
  selectedLine.value = item
  highlightedLineId.value = item.line_id
  scrollToLine(item.line_id)
}

// 处理文本行点击
const handleLineClick = (item) => {
  selectedLine.value = item
  highlightedLineId.value = item.line_id
}

// 处理bbox悬停
const handleBboxHover = (lineId) => {
  if (!selectedLine.value) {
    highlightedLineId.value = lineId
  }
}

// 处理bbox离开
const handleBboxLeave = () => {
  if (!selectedLine.value) {
    highlightedLineId.value = null
  }
}

// 处理文本行悬停
const handleLineHover = (lineId) => {
  if (!selectedLine.value) {
    highlightedLineId.value = lineId
  }
}

// 处理文本行离开
const handleLineLeave = () => {
  if (!selectedLine.value) {
    highlightedLineId.value = null
  }
}

// 处理图片点击（空白区域）
const handleImageClick = () => {
  // 点击空白区域不做处理
}

// 滚动到指定行
const scrollToLine = (lineId) => {
  nextTick(() => {
    if (textListRef.value) {
      const lineElement = textListRef.value.querySelector(`[data-line-id="${lineId}"]`)
      if (lineElement) {
        lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  })
}

// 更新文本
const updateText = () => {
  // 文本更新后需要重新计算实体位置
}

// 更新实体
const updateEntities = () => {
  // 实体类型更新
}

// 删除实体
const deleteEntity = (index) => {
  if (selectedLine.value) {
    selectedLine.value.entities.splice(index, 1)
  }
}

// 保存标注结果
const save = () => {
  console.log('保存标注结果：', JSON.stringify(annotationData.value, null, 2))
  alert('标注结果已保存到控制台')
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.annotation-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

/* 工具栏 */
.toolbar {
  height: 56px;
  background: #1f2937;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.toolbar-title {
  font-size: 18px;
  font-weight: 600;
}

.toolbar-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

/* 主内容区 */
.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* 图像面板和标注面板等宽 */
.image-panel,
.annotation-panel {
  width: 50%;
  background: white;
  display: flex;
  flex-direction: column;
}

.image-panel {
  border-right: 1px solid #e5e7eb;
}

.panel-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #fafafa;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.text-direction {
  font-size: 13px;
  color: #6b7280;
  background: #e5e7eb;
  padding: 4px 12px;
  border-radius: 12px;
}

.entity-types {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.entity-tag {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.image-container {
  flex: 1;
  overflow: auto;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #f9fafb;
}

.image-wrapper {
  position: relative;
  display: inline-block;
}

.qiaopi-image {
  max-width: 100%;
  height: auto;
  display: block;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}

.bbox-overlay {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: all;
}

.bbox-rect {
  fill: rgba(59, 130, 246, 0.1);
  stroke: #3b82f6;
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.2s;
}

.bbox-rect:hover {
  fill: rgba(59, 130, 246, 0.25);
  stroke: #2563eb;
  stroke-width: 3;
}

.bbox-rect.bbox-active {
  fill: rgba(239, 68, 68, 0.2);
  stroke: #ef4444;
  stroke-width: 3;
}

.bbox-label {
  fill: #3b82f6;
  font-size: 14px;
  font-weight: 600;
  pointer-events: none;
  user-select: none;
}

/* 文本列表容器 */
.text-list-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.text-line-item {
  margin-bottom: 16px;
  padding: 16px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.text-line-item:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.text-line-item.line-active {
  border-color: #ef4444;
  background: #fef2f2;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

.line-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.line-number-badge {
  background: #3b82f6;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.line-active .line-number-badge {
  background: #ef4444;
}

.line-score {
  font-size: 12px;
  color: #6b7280;
  background: white;
  padding: 4px 10px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.line-text {
  font-size: 20px;
  font-family: "KaiTi", "楷体", "SimSun", serif;
  line-height: 1.8;
  margin-bottom: 8px;
}

.line-text.vertical-text {
  writing-mode: vertical-rl;
  display: inline-block;
}

.line-text.horizontal-text {
  writing-mode: horizontal-tb;
}

.text-char {
  padding: 3px 4px;
  transition: all 0.2s;
  border-radius: 3px;
  border-left: 3px solid transparent;
  border-top: 3px solid transparent;
  color: #1f2937;
}

.text-char.highlighted {
  font-weight: 600;
}

.vertical-text .text-char.highlighted {
  border-left: 3px solid;
  border-top: none;
}

.horizontal-text .text-char.highlighted {
  border-top: 3px solid;
  border-left: none;
}

.ocr-diff {
  font-size: 13px;
  color: #6b7280;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.ocr-label {
  font-weight: 600;
  color: #ef4444;
  margin-right: 8px;
}

.ocr-text {
  font-family: "SimSun", serif;
}

/* 编辑面板 */
.edit-panel {
  position: absolute;
  right: 24px;
  top: 80px;
  width: 350px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 100;
}

.edit-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f9fafb;
  border-radius: 8px 8px 0 0;
}

.edit-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  color: #1f2937;
}

.edit-body {
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.text-display {
  padding: 10px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 14px;
  font-family: "SimSun", serif;
  color: #6b7280;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 14px;
  font-family: "SimSun", serif;
  transition: border-color 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.entities-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.entity-item {
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-left: 4px solid;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.entity-text {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  font-family: "SimSun", serif;
}

.entity-type-select {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  background: white;
}

.btn-delete {
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-delete:hover {
  background: #dc2626;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>
}
