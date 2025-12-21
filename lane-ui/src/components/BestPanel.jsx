// src/components/BestPanel.jsx

export default function BestPanel({ scene, bestAlgo, bestMetrics, decision }) {
  return (
    <div className="h-full rounded-3xl bg-white p-8 shadow-sm border border-slate-200 relative overflow-hidden group">
      {/* 装饰背景 */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform" />

      <div className="relative space-y-8">
        {/* 头部：推荐算法 + 场景 + 综合分数 */}
        <div className="flex justify-between items-start gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[11px] font-bold tracking-widest uppercase">
                推荐算法
              </span>
              <span className="text-xs md:text-sm text-slate-500">
                当前场景：
                <span className="font-semibold text-slate-800">
                  {scene}
                </span>
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {bestAlgo || "—"}
            </h2>

            {/* 一句总结文案 */}
            {decision && (
              <p className="text-xs md:text-sm text-slate-500">
                在
                <span className="font-semibold text-slate-800 mx-1">
                  {scene}
                </span>
                场景下，系统优先推荐
                <span className="font-semibold text-indigo-600 mx-1">
                  {bestAlgo}
                </span>
              </p>
            )}
          </div>

          <div className="text-right shrink-0">
            <p className="text-xs md:text-sm font-semibold text-slate-400">
              综合评估分 <span className="text-[10px] align-top">(S)</span>
            </p>
            <p className="text-4xl md:text-5xl font-black text-indigo-600 leading-none mt-2">
              {bestMetrics?.S != null ? bestMetrics.S.toFixed(3) : "--"}
            </p>
          </div>
        </div>

        {/* 指标卡片：两列 × 两行 */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard label="F1-Score" value={bestMetrics?.f1} format="float3" />
          <MetricCard label="实时性 (FPS)" value={bestMetrics?.fps} format="fps" />
          <MetricCard label="准确率" value={bestMetrics?.accuracy} format="float3" />
          <MetricCard label="SC-IoU" value={bestMetrics?.sc_iou} format="float3" />
        </div>

        {/* 场景决策信息：放在指标下面，作为辅助解释 */}
        {decision && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <InfoChip
              label="场景权重"
              value={decision.weight}
              hint="该场景在整体评估中的重要程度"
            />
            <InfoChip
              label="备用算法"
              value={decision.backup}
              hint="当前场景下的备选模型方案"
            />
            <InfoChip
              label="选择逻辑"
              value={decision.reason}
              trunc
            />
          </div>
        )}
      </div>
    </div>
  );
}

function InfoChip({ label, value, hint, trunc }) {
  return (
    <div className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-100">
      <p className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p
        className={
          "text-sm md:text-base font-semibold text-slate-800 " +
          (trunc ? "truncate" : "")
        }
        title={trunc ? value : undefined}
      >
        {value ?? "—"}
      </p>
      {hint && (
        <p className="mt-1 text-[11px] text-slate-400 leading-snug">
          {hint}
        </p>
      )}
    </div>
  );
}

function MetricCard({ label, value, format }) {
  let show = "--";

  if (typeof value === "number") {
    if (format === "fps") {
      // FPS 整体量级较大，用 0 或 1 位小数更自然
      show = value >= 100 ? Math.round(value).toString() : value.toFixed(1);
    } else {
      // F1 / 准确率 / SC-IoU 用三位小数
      show = value.toFixed(3);
    }
  }

  return (
    <div className="bg-white border border-slate-100 p-4 md:p-5 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors">
      <p className="text-[11px] md:text-xs font-bold text-slate-400 uppercase mb-2">
        {label}
      </p>
      <p className="text-xl md:text-2xl font-bold text-slate-900">
        {show}
      </p>
    </div>
  );
}
