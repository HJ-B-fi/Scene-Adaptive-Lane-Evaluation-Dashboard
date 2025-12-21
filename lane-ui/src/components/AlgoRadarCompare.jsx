// src/components/AlgoRadarCompare.jsx

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

/**
 * 简单的 0~1 归一化：让当前两种算法中表现最好的一方在该指标轴上为 1，
 * 另一方按比例缩放。这样图形更直观，形状对比清晰。
 */
function normalizePair(a, b) {
  const max = Math.max(a ?? 0, b ?? 0);
  if (!isFinite(max) || max <= 0) {
    return { a: 0, b: 0 };
  }
  return {
    a: (a ?? 0) / max,
    b: (b ?? 0) / max
  };
}

export default function AlgoRadarCompare({ scene, metricsByAlgo }) {
  // 我们只关心这两个算法
  const algoA = "UFLDv2+";
  const algoB = "SA-Lane (Ours)";

  const mA = metricsByAlgo?.[algoA];
  const mB = metricsByAlgo?.[algoB];

  // 防御：如果当前数据源里缺少任一算法，就提示一下
  if (!mA || !mB) {
    return (
      <div className="rounded-3xl bg-white p-6 shadow-lg border border-slate-100 h-full flex flex-col">
        <div className="text-xl font-bold text-slate-900 mb-2 border-b border-slate-100 pb-3">
          单场景性能雷达图
        </div>
        <p className="text-sm text-slate-500">
          当前场景 <span className="font-semibold text-indigo-600">{scene}</span>{" "}
          缺少 <span className="font-mono">{algoA}</span> 或{" "}
          <span className="font-mono">{algoB}</span> 的指标数据，暂无法绘制对比雷达图。
        </p>
        <p className="text-xs text-slate-400 mt-2">
          请确认 <span className="font-mono">performanceData / samplePerformance</span>{" "}
          中已为该场景补全这两个算法的指标。
        </p>
      </div>
    );
  }

  // 原始指标集合：只取 4 个维度
  const raw = [
    {
      key: "f1",
      label: "F1-score",
      a: mA.f1 ?? 0,
      b: mB.f1 ?? 0,
      format: (v) => v.toFixed(3)
    },
    {
      key: "fps",
      label: "FPS",
      a: mA.fps ?? 0,
      b: mB.fps ?? 0,
      format: (v) => v >= 100 ? Math.round(v) : v.toFixed(1)
    },
    {
      key: "sc_iou",
      label: "SC-IoU",
      a: mA.sc_iou ?? 0,
      b: mB.sc_iou ?? 0,
      format: (v) => v.toFixed(3)
    },
    {
      key: "S",
      label: "综合评分 S",
      a: mA.S ?? 0,
      b: mB.S ?? 0,
      format: (v) => v.toFixed(3)
    }
  ];

  // 构造雷达图数据（归一化后）
  const radarData = raw.map((m) => {
    const { a, b } = normalizePair(m.a, m.b);
    return {
      metric: m.label,
      [algoA]: Number(a.toFixed(3)),
      [algoB]: Number(b.toFixed(3)),
      fullMark: 1
    };
  });

  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg border border-slate-100 h-full flex flex-col">
      {/* 标题区 */}
      <div className="flex items-start justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <div className="text-xl font-bold text-slate-900">
            单场景性能雷达图
          </div>
          <div className="text-sm text-slate-500 mt-1">
            当前场景：
            <span className="font-semibold text-indigo-600">{scene}</span>
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-400 max-w-[160px]">
          对比{" "}
          <span className="font-semibold text-slate-700">{algoA}</span>{" "}
          与{" "}
          <span className="font-semibold text-slate-700">{algoB}</span>{" "}
          在 F1 / FPS / SC-IoU / S 四个维度的相对表现。
        </div>
      </div>

      {/* 雷达图区域 */}
      <div className="flex-1 min-h-[260px] md:min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            cx="50%"
            cy="50%"
            outerRadius="75%"
            data={radarData}
          >
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <PolarRadiusAxis
              domain={[0, 1]}
              tickCount={5}
              tick={{ fill: "#94a3b8", fontSize: 10 }}
            />
            <Tooltip
              formatter={(val, key) => {
                const algoName = key;
                return [Number(val).toFixed(3), algoName];
              }}
              labelFormatter={(label) => `指标：${label}`}
              contentStyle={{
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
                fontSize: 12
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Radar
              name={algoA}
              dataKey={algoA}
              stroke="#4f46e5"
              fill="#4f46e5"
              fillOpacity={0.25}
            />
            <Radar
              name={algoB}
              dataKey={algoB}
              stroke="#0f766e"
              fill="#0f766e"
              fillOpacity={0.25}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* 下方原始数值对比说明 */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-500 mb-2">
          说明：雷达图对每个指标做了“当前两种算法内最大值归一化”，用于形状对比；
          下表给出对应的<strong className="font-semibold">原始指标数值</strong>。
        </p>
        <div className="grid grid-cols-1 gap-1 text-xs text-slate-700">
          {raw.map((m) => (
            <div
              key={m.key}
              className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2"
            >
              <span className="font-semibold text-slate-600">{m.label}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px]">
                  {algoA}:{" "}
                  <span className="font-semibold">
                    {m.format(m.a)}
                  </span>
                </span>
                <span className="font-mono text-[11px]">
                  {algoB}:{" "}
                  <span className="font-semibold text-emerald-700">
                    {m.format(m.b)}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
