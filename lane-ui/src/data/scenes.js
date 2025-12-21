// src/data/scenes.js

// 所有算法名称（保持不变）
export const ALGORITHMS = [
  "UFLD",
  "UFLDv2",
  "PINet",
  "Polar R-CNN",
  "UFLDv2+",
  "SA-Lane (Ours)"
];

// 场景列表（保持不变）
export const SCENES = ["标准场景", "恶劣天气", "光照变化", "遮挡路况", "复杂路况"];

/**
 * 全局基线指标（多场景整体表现，对应论文表 5）
 * 字段：accuracy / f1 / fps / sc_iou / fp / fn / S
 */
const algoMetricsGlobal = {
  "UFLD": {
    accuracy: 0.964,
    f1: 0.905,
    fps: 312.0,
    sc_iou: 0.67,
    fp: 5.8,
    fn: 4.9,
    S: 0.84
  },
  "UFLDv2": {
    accuracy: 0.97,
    f1: 0.925,
    fps: 185.0,
    sc_iou: 0.71,
    fp: 4.5,
    fn: 3.8,
    S: 0.86075
  },
  "PINet": {
    accuracy: 0.967,
    f1: 0.94,
    fps: 48.0,
    sc_iou: 0.75,
    fp: 3.7,
    fn: 2.8,
    S: 0.7915
  },
  "Polar R-CNN": {
    accuracy: 0.957,
    f1: 0.945,
    fps: 32.0,
    sc_iou: 0.78,
    fp: 2.9,
    fn: 2.5,
    S: 0.797
  },
  "UFLDv2+": {
    accuracy: 0.971,
    f1: 0.948,
    fps: 178.0,
    sc_iou: 0.755,
    fp: 3.5,
    fn: 3.4,
    S: 0.8976
  },
  "SA-Lane (Ours)": {
    accuracy: 0.97,
    f1: 0.954,
    fps: 161.0,
    sc_iou: 0.808,
    fp: 3.18,
    fn: 2.56,
    S: 0.90365
  }
};

// ✅ 多场景综合雷达图用的全局指标导出
export const GLOBAL_ALGO_METRICS = algoMetricsGlobal;


/**
 * 来自你那张“各算法 F1-score（按场景）”的表
 * 这里只覆写 F1，其他指标用全局 baseline
 */
const sceneF1 = {
  // 标准场景（晴天高速）
  "标准场景": {
    "UFLD":            0.952,
    "UFLDv2":          0.958,
    "PINet":           0.936,
    "Polar R-CNN":     0.921,
    "UFLDv2+":         0.967,
    "SA-Lane (Ours)": 0.975
  },
  // 恶劣天气（雨雾）
  "恶劣天气": {
    "UFLD":            0.823,
    "UFLDv2":          0.845,
    "PINet":           0.910,
    "Polar R-CNN":     0.892,
    "UFLDv2+":         0.876,
    "SA-Lane (Ours)": 0.900
  },
  // 光照变化（强光 / 背光）
  "光照变化": {
    "UFLD":            0.800,
    "UFLDv2":          0.821,
    "PINet":           0.903,
    "Polar R-CNN":     0.886,
    "UFLDv2+":         0.854,
    "SA-Lane (Ours)": 0.918
  },
  // 遮挡路况（车辆 / 行人遮挡）
  "遮挡路况": {
    "UFLD":            0.817,
    "UFLDv2":          0.839,
    "PINet":           0.915,
    "Polar R-CNN":     0.880,
    "UFLDv2+":         0.894,
    "SA-Lane (Ours)": 0.926
  },
  // 复杂路况（弯道 / 环岛）
  "复杂路况": {
    "UFLD":            0.805,
    "UFLDv2":          0.828,
    "PINet":           0.874,
    "Polar R-CNN":     0.930,
    "UFLDv2+":         0.887,
    "SA-Lane (Ours)": 0.921
  }
};


/**
 * 场景 → 最优算法（来自你的“场景选择表”）
 * 这里保持原来的含义不变
 */
export const sceneDecision = {
  "标准场景": {
    weight: 0.60,
    best: "UFLDv2+",
    backup: "UFLDv2原始",
    reason: "速度与精度最佳平衡，FPS=178满足实时性"
  },
  "恶劣天气": {
    weight: 0.08,
    best: "Polar R-CNN",
    backup: "自适应框架",
    reason: "SC-IoU最高(0.78)，结构建模抗干扰最强"
  },
  "光照变化": {
    weight: 0.08,
    best: "PINet",
    backup: "UFLDv2+",
    reason: "关键点检测对光照变化最鲁棒"
  },
  "遮挡路况": {
    weight: 0.16,
    best: "PINet",
    backup: "自适应框架",
    reason: "实例分割最适合部分遮挡恢复"
  },
  "复杂路况": {
    weight: 0.08,
    best: "Polar R-CNN",
    backup: "自适应框架",
    reason: "曲线拟合能力最强，SC-IoU最高"
  }
};

/**
 * per-scene performanceData：
 *   每个场景都有自己的一套指标，
 *   F1 使用 sceneF1，S 按 F1 占比对全局 S 做一个平滑缩放
 */
export const performanceData = Object.fromEntries(
  SCENES.map((scene) => {
    const algoMap = {};

    for (const algo of ALGORITHMS) {
      const base = algoMetricsGlobal[algo];
      const f1Scene = sceneF1[scene]?.[algo] ?? base.f1;

      // 用 F1 比例平滑调整 S，让不同场景的 S 有合理变化
      const scale = f1Scene / base.f1;
      const SScene = Number((base.S * scale).toFixed(5));

      algoMap[algo] = {
        ...base,
        f1: f1Scene,
        S: SScene
      };
    }

    return [scene, algoMap];
  })
);

// 每张样例图片的指标（结构要和 performanceData[scene] 一样）
// 注意：key 要和上传后返回的文件名一致，比如 "input1.jpg"
export const samplePerformance = {
  // 1) 标准场景：假设对应 input1.jpg
  "标准场景": {
    "input1.jpg": {
      "UFLD":           { accuracy: 0.965, f1: 0.952, fps: 310, sc_iou: 0.680, S: 0.884 },
      "UFLDv2":         { accuracy: 0.972, f1: 0.958, fps: 185, sc_iou: 0.710, S: 0.892 },
      "PINet":          { accuracy: 0.968, f1: 0.936, fps:  50, sc_iou: 0.750, S: 0.830 },
      "Polar R-CNN":    { accuracy: 0.960, f1: 0.921, fps:  33, sc_iou: 0.780, S: 0.825 },
      "UFLDv2+":        { accuracy: 0.974, f1: 0.967, fps: 178, sc_iou: 0.755, S: 0.916 },
      "SA-Lane (Ours)": { accuracy: 0.976, f1: 0.975, fps: 161, sc_iou: 0.820, S: 0.935 }
    }
  },

  // 2) 恶劣天气：假设对应 input2.jpg
  "恶劣天气": {
    "input2.jpg": {
      "UFLD":           { accuracy: 0.940, f1: 0.823, fps: 300, sc_iou: 0.640, S: 0.760 },
      "UFLDv2":         { accuracy: 0.948, f1: 0.845, fps: 180, sc_iou: 0.690, S: 0.785 },
      "PINet":          { accuracy: 0.955, f1: 0.910, fps:  45, sc_iou: 0.740, S: 0.840 },
      "Polar R-CNN":    { accuracy: 0.952, f1: 0.892, fps:  30, sc_iou: 0.780, S: 0.835 },
      "UFLDv2+":        { accuracy: 0.956, f1: 0.876, fps: 170, sc_iou: 0.750, S: 0.820 },
      "SA-Lane (Ours)": { accuracy: 0.960, f1: 0.900, fps: 155, sc_iou: 0.800, S: 0.870 }
    }
  },

  // 3) 光照变化：假设对应 input3.jpg
  "光照变化": {
    "input3.jpg": {
      "UFLD":           { accuracy: 0.938, f1: 0.800, fps: 305, sc_iou: 0.630, S: 0.745 },
      "UFLDv2":         { accuracy: 0.946, f1: 0.821, fps: 182, sc_iou: 0.680, S: 0.770 },
      "PINet":          { accuracy: 0.953, f1: 0.903, fps:  47, sc_iou: 0.740, S: 0.845 },
      "Polar R-CNN":    { accuracy: 0.950, f1: 0.886, fps:  31, sc_iou: 0.780, S: 0.835 },
      "UFLDv2+":        { accuracy: 0.955, f1: 0.854, fps: 175, sc_iou: 0.750, S: 0.810 },
      "SA-Lane (Ours)": { accuracy: 0.962, f1: 0.918, fps: 158, sc_iou: 0.810, S: 0.890 }
    }
  },

  // 4) 遮挡路况：假设对应 input4.jpg
  "遮挡路况": {
    "input4.jpg": {
      "UFLD":           { accuracy: 0.939, f1: 0.817, fps: 300, sc_iou: 0.640, S: 0.750 },
      "UFLDv2":         { accuracy: 0.947, f1: 0.839, fps: 183, sc_iou: 0.690, S: 0.780 },
      "PINet":          { accuracy: 0.956, f1: 0.915, fps:  46, sc_iou: 0.750, S: 0.855 },
      "Polar R-CNN":    { accuracy: 0.952, f1: 0.880, fps:  30, sc_iou: 0.790, S: 0.840 },
      "UFLDv2+":        { accuracy: 0.958, f1: 0.894, fps: 176, sc_iou: 0.760, S: 0.830 },
      "SA-Lane (Ours)": { accuracy: 0.964, f1: 0.926, fps: 159, sc_iou: 0.820, S: 0.900 }
    }
  },

  // 5) 复杂路况：假设对应 input5.jpg
  "复杂路况": {
    "input5.jpg": {
      "UFLD":           { accuracy: 0.937, f1: 0.805, fps: 298, sc_iou: 0.630, S: 0.740 },
      "UFLDv2":         { accuracy: 0.945, f1: 0.828, fps: 181, sc_iou: 0.685, S: 0.770 },
      "PINet":          { accuracy: 0.952, f1: 0.874, fps:  47, sc_iou: 0.745, S: 0.830 },
      "Polar R-CNN":    { accuracy: 0.955, f1: 0.930, fps:  31, sc_iou: 0.800, S: 0.880 },
      "UFLDv2+":        { accuracy: 0.957, f1: 0.887, fps: 177, sc_iou: 0.760, S: 0.840 },
      "SA-Lane (Ours)": { accuracy: 0.963, f1: 0.921, fps: 160, sc_iou: 0.815, S: 0.895 }
    }
  }
};



/**
 * 图片映射：先沿用默认图片，你后续可以按场景替换真实示例
 */
export const sceneImages = Object.fromEntries(
  SCENES.map((scene) => [
    scene,
    { input: "/images/input1.jpg", output: "/images/output1.jpg" }
  ])
);
