import { useEffect, useMemo, useState } from "react";
import ScenarioSelector from "./components/ScenarioSelector.jsx";
import MetricsLineChart from "./components/MetricsLineChart.jsx";
import ImageCompare from "./components/ImageCompare.jsx";
import BestPanel from "./components/BestPanel.jsx";
import AlgoRadarCompare from "./components/AlgoRadarCompare.jsx";
import GlobalAlgoRadar from "./components/GlobalAlgoRadar.jsx";
import UploadByName from "./components/UploadByName.jsx";

import {
  SCENES,
  performanceData,
  sceneDecision,
  samplePerformance,
  GLOBAL_ALGO_METRICS
} from "./data/scenes.js";

import { tusimpleOutputs } from "./data/tusimpleSamples.js";

function normalizeAlgoName(name) {
  if (!name) return name;
  const s = String(name).trim();
  if (s === "UFLDv2原始") return "UFLDv2";

  // ✅ 把各种写法统一映射成内部 key
  if (s === "自适应框架" || s === "SA-Lane" || s === "SA-Lane (Ours)") {
    return "SA-Lane (Ours)";
  }

  return s;
}


function pickBestByDecision(scene, sceneData) {
  const algos = Object.keys(sceneData);
  return algos.reduce(
    (best, a) =>
      (sceneData[a].S ?? -Infinity) > (sceneData[best].S ?? -Infinity) ? a : best,
    algos[0]
  );
}


export default function App() {
  // 第二张图页面的“场景选择”
  const [scene, setScene] = useState(SCENES[0]);
  const [normalize, setNormalize] = useState(true);

  // 上传 inputN 相关
  const [currentInput, setCurrentInput] = useState(null); // inputN.jpg
  // 先拿场景平均
  const sceneAvgData = performanceData[scene];
  const metricsByAlgo = useMemo(() => {
    if (currentInput && samplePerformance[scene]?.[currentInput]) {
      return samplePerformance[scene][currentInput]; // ✅ 用单帧数据
    }
    return sceneAvgData; // ✅ 没有就用场景平均
  }, [scene, currentInput, sceneAvgData]);

  const [meta, setMeta] = useState(null); // {scene, output...} 来自 backend/meta
  const [refreshKey, setRefreshKey] = useState(0);

  const sceneData = performanceData[scene];
  const bestAlgo = useMemo(
    () => pickBestByDecision(scene, metricsByAlgo),
    [scene, metricsByAlgo]
  );
  const bestMetrics = metricsByAlgo[bestAlgo];

  const decision = sceneDecision[scene]
    ? {
        ...sceneDecision[scene],
        best: normalizeAlgoName(sceneDecision[scene].best),
        backup: normalizeAlgoName(sceneDecision[scene].backup)
      }
    : null;

  // 从后端拿 inputN 对应 outputN + 场景（你维护 scene_map.json）
  async function loadMeta(inputName) {
    const res = await fetch(
      `http://localhost:8000/api/meta?input_name=${encodeURIComponent(inputName)}&ts=${Date.now()}`
    );
    const data = await res.json();
    setMeta(data.ok ? data : null);

    // 可选：让页面场景下拉自动切到该 input 对应的场景（如果你希望“自动联动”）
    if (data?.scene && SCENES.includes(data.scene)) {
      setScene(data.scene);
    }
  }

  useEffect(() => {
    if (currentInput) loadMeta(currentInput);
  }, [currentInput]);

  // 图片 URL（加 ts 防缓存）
  const inputSrc = currentInput
    ? `http://localhost:8000/api/input-image?name=${encodeURIComponent(currentInput)}&ts=${refreshKey}`
    : null;

  const outputSrc = meta?.output
    ? `http://localhost:8000/api/output-image?name=${encodeURIComponent(meta.output)}&ts=${refreshKey}`
    : null;

  // TuSimple 这里先保留 demo（你后续也可以做成 inputN->jsonN 的同名映射）
  const tusimple = useMemo(() => {
    const s = tusimpleOutputs[scene]?.best;
    if (s) return s;
    return {
      raw_file: currentInput ? `uploads/${currentInput}` : "clips/demo/input1.jpg",
      h_samples: Array.from({ length: 48 }, (_, i) => 240 + i * 10),
      lanes: []
    };
  }, [scene, currentInput]);

 return (
    <div className="min-h-screen pb-20">
      {/* 顶部导航栏 */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">L</div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              车道线检测评估系统
            </h1>
          </div>
          <div className="hidden md:block text-sm font-medium text-slate-500">
            多模型协同场景自适应框架 v2.0
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-8">
        
        {/* 第一行：控制台与核心结论 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧控制区 */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-full">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">配置控制台</h3>
              
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">场景识别</label>
                  <ScenarioSelector scenes={SCENES} value={scene} onChange={setScene} />
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">图片上传</label>
                  <UploadByName
                    onSelected={(inputName) => {
                      setCurrentInput(inputName);
                      setRefreshKey((x) => x + 1);
                    }}
                  />
                </div>

                {currentInput && (
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-bottom-2">
                    <p className="text-xs text-indigo-400 font-bold mb-1">系统识别结果</p>
                    <div className="text-sm text-indigo-900 font-medium truncate">
                       {meta?.scene || "分析中..."}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* 右侧最优算法展示 */}
          <div className="lg:col-span-2">
            <BestPanel
              scene={scene}
              bestAlgo={bestAlgo}
              bestMetrics={bestMetrics}
              decision={decision}
            />
          </div>
        </div>

        {/* 第二行：对比主视图 */}
        <section className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2rem] blur opacity-10"></div>
          <div className="relative">
            {inputSrc && outputSrc ? (
              <ImageCompare inputSrc={inputSrc} outputSrc={outputSrc} />
            ) : (
              <div className="rounded-[2rem] bg-white border-2 border-dashed border-slate-200 p-20 text-center">
                <div className="text-5xl mb-4">🖼️</div>
                <h3 className="text-xl font-bold text-slate-800">等待图像加载</h3>
                <p className="text-slate-500 mt-2">请在左侧控制台上传或选择一个场景以查看对比效果</p>
              </div>
            )}
          </div>
        </section>

        {/* 第三行：详细分析数据 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <MetricsLineChart
              scene={scene}
              sceneData={metricsByAlgo}
              normalize={normalize}
              onToggleNormalize={() => setNormalize((v) => !v)}
            />
          </div>
          <div className="lg:col-span-2">
            <AlgoRadarCompare
              scene={scene}
              metricsByAlgo={metricsByAlgo}
            />
          </div>
        </div>

        {/* 第四行：多场景综合性能雷达图（全局表 5） */}
        <section>
          <GlobalAlgoRadar globalMetrics={GLOBAL_ALGO_METRICS} />
        </section>
      </main>
    </div>
  );
}