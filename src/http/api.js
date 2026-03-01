/**
 * API 请求模块
 * 包含所有HTTP请求相关的函数
 */

const API_BASE_URL = 'http://127.0.0.1:5000'

/**
 * 上传图片并处理OCR识别
 * @param {File} file - 要上传的图片文件
 * @returns {Promise<Object>} 返回处理结果
 */
export async function processImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE_URL}/process`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const result = await response.json()

  if (result.code === 200 || result.code === 0) {
    return result.data || []
  } else {
    throw new Error(result.msg || '处理失败')
  }
}

/**
 * 保存标注结果（示例函数，根据实际需求修改）
 * @param {Array} annotationData - 标注数据
 * @returns {Promise<Object>}
 */
export async function saveAnnotation(annotationData) {
  // TODO: 根据实际需求实现保存接口
  console.log('保存标注结果：', JSON.stringify(annotationData, null, 2))
  return Promise.resolve({ success: true })
}
