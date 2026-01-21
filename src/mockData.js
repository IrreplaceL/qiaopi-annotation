export const annotationData = [
  {
    line_id: 1,
    ocr_text: "才安神天保佑也妹沈慕貞顺请此",
    corrected_text: "才安神天保佑也妹沈慕貞顺请此",
    bbox: [8, 26, 86, 766],
    score: 0.764,
    entities: [
      { type: "BLESSING", text: "神天保佑", start: 2, end: 6 },
      { type: "PERSON", text: "沈慕貞", start: 9, end: 12 }
    ]
  },
  {
    line_id: 2,
    ocr_text: "吾君英医妹祝颂兄尔客居平安早得贵人扶座",
    corrected_text: "吾君英医妹祝颂兄尔客居平安早得贵人扶助",
    bbox: [557, 51, 623, 883],
    score: 0.806,
    entities: [
      { type: "BLESSING", text: "客居平安", start: 9, end: 13 }
    ]
  },
  {
    line_id: 3,
    ocr_text: "它",
    corrected_text: "它",
    bbox: [645, 46, 689, 97],
    score: 0.209,
    entities: []
  },
  {
    line_id: 4,
    ocr_text: "男教由喜保佑三地平安喜亡至也此是",
    corrected_text: "男教由善保佑三地平安喜至也此是",
    bbox: [74, 104, 135, 802],
    score: 0.757,
    entities: [
      { type: "BLESSING", text: "保佑三地平安", start: 5, end: 11 }
    ]
  },
  {
    line_id: 5,
    ocr_text: "外求利亦切宜珍重芳要免吾熟七叙情",
    corrected_text: "外求利亦切宜珍重芳要免五熟七叙慬",
    bbox: [135, 100, 201, 886],
    score: 0.732,
    entities: []
  },
  {
    line_id: 6,
    ocr_text: "尔吾爱情待另回来面叙美也另王兄好在",
    corrected_text: "尔吾爱情待另回来敢奏也另王兄好在",
    bbox: [202, 95, 270, 874],
    score: 0.75,
    entities: []
  },
  {
    line_id: 7,
    ocr_text: "闻事实多待另有来可若笑談之説也",
    corrected_text: "闻事实多待另有来可若笑谈之说也",
    bbox: [272, 95, 337, 880],
    score: 0.78,
    entities: []
  },
  {
    line_id: 8,
    ocr_text: "兄早来能慰吾亡心思也另者中自今年新",
    corrected_text: "兄早来能慰吾七心思也另著中自今年新",
    bbox: [345, 99, 411, 883],
    score: 0.861,
    entities: []
  },
  {
    line_id: 9,
    ocr_text: "萬幸也但抹芳另剪别忽两秋使懷之望",
    corrected_text: "寓幸也但扶芳努剪别忽两秋使怀之望",
    bbox: [418, 103, 478, 873],
    score: 0.728,
    entities: []
  },
  {
    line_id: 10,
    ocr_text: "早回家中免妖若兄夜思日想得暢叙快之",
    corrected_text: "早回家中兔妖若尔夜思日想得畅叙快之",
    bbox: [487, 102, 552, 853],
    score: 0.783,
    entities: [
      { type: "BLESSING", text: "早回家中", start: 0, end: 4 }
    ]
  },
  {
    line_id: 11,
    ocr_text: "侨批研究",
    corrected_text: "侨批研究",
    bbox: [622, 850, 700, 875],
    score: 0.997,
    entities: []
  }
]

// 实体类型配置
export const entityTypes = [
  { type: "PERSON", label: "人名", color: "#3b82f6" },
  { type: "PLACE", label: "地名", color: "#10b981" },
  { type: "BLESSING", label: "祝福语", color: "#f59e0b" },
  { type: "DATE", label: "日期", color: "#8b5cf6" },
  { type: "MONEY", label: "金额", color: "#ef4444" }
]
