// src/data/tusimpleSamples.js

export const tusimpleOutputs = {
  "标准场景": {
    best: {
      raw_file: "clips/demo/input1.jpg",
      h_samples: Array.from({ length: 48 }, (_, i) => 240 + i * 10),
      lanes: [
        // lane1
        [-2, -2, 580, 582, 585, 588, 592, 596, 600, 604, 608, 612, 616, 620, 624, 628, 632, 636, 640, 644, 648, 652, 656, 660, 664, 668, 672, 676, 680, 684, 688, 692, 696, 700, 704, 708, 712, 716, 720, 724, 728, 732, 736, 740, 744, 748, 752, 756],
        // lane2
        [-2, -2, 760, 758, 756, 754, 752, 750, 748, 746, 744, 742, 740, 738, 736, 734, 732, 730, 728, 726, 724, 722, 720, 718, 716, 714, 712, 710, 708, 706, 704, 702, 700, 698, 696, 694, 692, 690, 688, 686, 684, 682, 680, 678, 676, 674, 672, 670]
      ]
    }
  },
  // 其他场景目前可以先复用同一份 demo 数据，
  // 你有真实 TuSimple 风格输出时再替换
  "恶劣天气": {
    best: {
      raw_file: "clips/demo/input1.jpg",
      h_samples: Array.from({ length: 48 }, (_, i) => 240 + i * 10),
      lanes: []
    }
  },
  "光照变化": {
    best: {
      raw_file: "clips/demo/input1.jpg",
      h_samples: Array.from({ length: 48 }, (_, i) => 240 + i * 10),
      lanes: []
    }
  },
  "遮挡路况": {
    best: {
      raw_file: "clips/demo/input1.jpg",
      h_samples: Array.from({ length: 48 }, (_, i) => 240 + i * 10),
      lanes: []
    }
  },
  "复杂路况": {
    best: {
      raw_file: "clips/demo/input1.jpg",
      h_samples: Array.from({ length: 48 }, (_, i) => 240 + i * 10),
      lanes: []
    }
  }
};
