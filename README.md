# qiaopi-annotation
侨批自动标注的最小原型
=======
# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

| 字段名       | 类型        |             说明             |
| ------------ | ----------- | :--------------------------: |
| id           | BIGINT PK   |             主键             |
| task_id      | BIGINT      |         所属标注任务         |
| image_id     | BIGINT      |         所属侨批图像         |
| line_id      | INT         |     OCR 行号 / 区块编号      |
| bbox         | JSON        |   文本区域坐标（x,y,w,h）    |
| ocr_text     | TEXT        |       OCR 原始识别文本       |
| llm_text     | TEXT        |    大模型校勘 / 标注文本     |
| final_text   | TEXT        |     人工确认后的最终文本     |
| entity_json  | JSON        | 实体标注结果（人物、时间等） |
| confidence   | VARCHAR(20) |  置信度（high/medium/low）   |
| status       | VARCHAR(20) | 标注状态（待校对 / 已完成）  |
| updated_by   | VARCHAR(50) |          最后修改人          |
| updated_time | DATETIME    |           修改时间           |
