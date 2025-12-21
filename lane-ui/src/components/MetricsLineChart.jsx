// src/components/MetricsLineChart.jsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

/**
 * 最大值归一化：x / max(x)
 */
function normalizeByMax(values) {
  const max = Math.max(...values);
  if (!isFinite(max) || max === 0) {
    return values.map(() => 0);
  }
  return values.map((v) => v / max);
}

export default function MetricsLineChart(props) {
  const { scene, sceneData, normalize, onToggleNormalize } = props;

  const metrics = [
    { key: "f1", label: "F1" },
    { key: "fps", label: "FPS" },
    { key: "accuracy", label: "Accuracy" },
    { key: "sc_iou", label: "SC-IoU" },
    { key: "S", label: "Score S" }
  ];

  // 防御：sceneData 为空时不报错
  const algos = Object.keys(sceneData || {});

  const chartData = metrics.map((m) => {
    const rawValues = algos.map((a) => sceneData[a]?.[m.key] ?? 0);
    const values = normalize ? normalizeByMax(rawValues) : rawValues;

    const row = { metric: m.label };
    algos.forEach((a, i) => {
      row[a] = Number(values[i].toFixed(3));
    });
    return row;
  });

  const colors = {
    UFLD: "#2563eb",
    UFLDv2: "#0f766e",
    PINet: "#f97316",
    "Polar R-CNN": "#a855f7",
    "UFLDv2+": "#16a34a",
    "SA-Lane (Ours)": "#111827"
  };

  return (
    // ✅ 关键：统一跟雷达图一样的布局：h-full + flex + flex-col
    <div className="rounded-3xl bg-white p-6 shadow-lg border border-slate-100 h-full flex flex-col">
      {/* 头部 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 border-b border-slate-200 pb-3">
        <div>
          <div className="text-xl font-bold text-slate-900">
            算法指标对比（折线图）
          </div>
          <div className="text-sm text-slate-500 mt-1">
            当前场景：
            <span className="font-semibold text-indigo-600">{scene}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">数值显示模式</span>
          <button
            type="button"
            onClick={onToggleNormalize}
            className={
              "px-3 py-1.5 rounded-xl text-sm font-semibold border transition " +
              (normalize
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md hover:bg-indigo-700"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100")
            }
          >
            {normalize ? "📊 归一化" : "📈 原始值"}
          </button>
        </div>
      </div>

      {/* ✅ 图表区域：用 flex-1 + min-h，而不是 h-[360px] */}
      <div className="flex-1 min-h-[260px] md:min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 12, right: 20, bottom: 8, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="metric" stroke="#64748b" />
            <YAxis
              domain={normalize ? [0, 1] : ["auto", "auto"]}
              stroke="#64748b"
            />
            <Tooltip
              contentStyle={{
                borderRadius: "0.5rem",
                border: "1px solid #e5e7eb",
                background: "white",
                padding: "0.5rem"
              }}
              formatter={(value) =>
                normalize ? Number(value).toFixed(3) : value
              }
              labelFormatter={(label) => `指标：${label}`}
            />
            <Legend wrapperStyle={{ paddingTop: "10px" }} />

            {algos.map((a) => (
              <Line
                key={a}
                type="monotone"
                dataKey={a}
                stroke={colors[a] || "#334155"}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 7 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 底部说明：固定在卡片底部 */}
      <div className="text-xs text-slate-600 mt-4 pt-3 border-t border-slate-100">
        {normalize
          ? "说明：各指标采用最大值归一化（x / max），用于可视化对比，消除量纲差异。"
          : "说明：当前显示原始指标值，FPS 量级较大时可能压缩其它指标的波动范围。"}
      </div>
    </div>
  );
}
