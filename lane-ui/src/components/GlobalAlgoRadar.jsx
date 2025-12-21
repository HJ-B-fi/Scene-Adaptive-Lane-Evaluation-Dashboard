// src/components/GlobalAlgoRadar.jsx
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

export default function GlobalAlgoRadar({ globalMetrics }) {
  const algos = Object.keys(globalMetrics || {});

  const metrics = [
    { key: "f1", label: "F1-score" },
    { key: "fps", label: "FPS" },
    { key: "sc_iou", label: "SC-IoU" },
    { key: "S", label: "综合评分 S" }
  ];

  // 构造雷达图数据
  const radarData = metrics.map((m) => {
    const rawVals = algos.map((a) => globalMetrics[a]?.[m.key] ?? 0);
    const maxVal = Math.max(...rawVals);
    const row = { metric: m.label };
    algos.forEach((a, idx) => {
      const v = rawVals[idx];
      row[a] = maxVal > 0 ? Number((v / maxVal).toFixed(3)) : 0;
    });
    return row;
  });

  const colors = {
    UFLD: "#6366f1",
    UFLDv2: "#0d9488",
    PINet: "#f59e0b",
    "Polar R-CNN": "#8b5cf6",
    "UFLDv2+": "#22c55e",
    "SA-Lane (Ours)": "#0f172a" // 更加深沉的黑色突出 Ours
  };

  const summaryRows = algos.map((a) => ({
    name: a,
    ...globalMetrics[a]
  }));

  return (
    <div className="rounded-[2rem] bg-white p-8 shadow-xl border border-slate-100 transition-all hover:shadow-2xl">
      {/* 标题区：强化层级感 */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 border-b border-slate-50 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-8 h-1 bg-indigo-600 rounded-full"></span>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Global Benchmarking</span>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            多场景综合性能雷达图
          </h2>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            基于多场景测试集的整体表现评估 (对应论文 Table 5)
          </p>
        </div>
        <div className="hidden md:block text-right">
          <span className="inline-block px-4 py-2 bg-slate-50 rounded-xl text-[12px] text-slate-500 leading-relaxed border border-slate-100">
            指标已进行 <b>最大值归一化</b> 处理<br />
            旨在对比不同算法的性能分布形状
          </span>
        </div>
      </div>

      {/* 主体内容布局：在大屏幕下可以考虑并排，这里先优化垂直分布的高级感 */}
      <div className="space-y-12">
        {/* 雷达图区域 */}
        <div className="h-[380px] md:h-[420px] bg-slate-50/30 rounded-3xl py-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#e2e8f0" strokeDasharray="4 4" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: "#475569", fontSize: 13, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 1]}
                tick={false} // 隐藏半径轴刻度使画面更干净
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "1rem",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  fontSize: "12px",
                  padding: "12px"
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                iconType="circle"
                wrapperStyle={{ paddingTop: "30px", fontSize: "12px", fontWeight: 500 }} 
              />
              {algos.map((a) => (
                <Radar
                  key={a}
                  name={a}
                  dataKey={a}
                  stroke={colors[a]}
                  fill={colors[a]}
                  fillOpacity={a.includes("Ours") ? 0.25 : 0.05} // Ours 填充更深一点点
                  strokeWidth={a.includes("Ours") ? 3 : 1.5}     // Ours 线条更粗
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 原始指标表：重塑为现代感列表 */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-800 mb-4 px-2 flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
             原始性能指标清单 (Raw Metrics)
          </h3>
          <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 font-bold">
                  <th className="py-4 px-6 text-left uppercase tracking-wider text-[11px]">算法模型</th>
                  <th className="py-4 px-4 text-center uppercase tracking-wider text-[11px]">Accuracy</th>
                  <th className="py-4 px-4 text-center uppercase tracking-wider text-[11px]">F1-Score</th>
                  <th className="py-4 px-4 text-center uppercase tracking-wider text-[11px]">FPS</th>
                  <th className="py-4 px-4 text-center uppercase tracking-wider text-[11px]">SC-IoU</th>
                  <th className="py-4 px-6 text-right uppercase tracking-wider text-[11px]">综合评分 S</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {summaryRows.map((row) => {
                  const isOurs = row.name.includes("Ours");
                  return (
                    <tr 
                      key={row.name} 
                      className={`transition-colors hover:bg-slate-50/80 ${isOurs ? "bg-indigo-50/30" : ""}`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[row.name] }}></div>
                          <span className={`font-bold ${isOurs ? "text-indigo-900" : "text-slate-700"}`}>
                            {row.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-mono tabular-nums text-slate-600">
                        {row.accuracy?.toFixed(3)}
                      </td>
                      <td className="py-4 px-4 text-center font-mono tabular-nums text-slate-600">
                        {row.f1?.toFixed(3)}
                      </td>
                      <td className="py-4 px-4 text-center font-mono tabular-nums text-slate-600">
                        {row.fps >= 100 ? Math.round(row.fps) : row.fps.toFixed(1)}
                      </td>
                      <td className="py-4 px-4 text-center font-mono tabular-nums text-slate-600">
                        {row.sc_iou?.toFixed(3)}
                      </td>
                      <td className={`py-4 px-6 text-right font-mono tabular-nums font-black text-lg ${isOurs ? "text-indigo-600" : "text-slate-400"}`}>
                        {row.S?.toFixed(5)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}