// src/components/TusimpleJson.jsx
export default function TusimpleJson({ jsonObj }) {
  // 注意：修改了卡片的圆角和阴影
  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg border border-slate-100">
      <div className="text-xl font-bold text-slate-900 mb-3 border-b border-slate-100 pb-3">
        TuSimple 格式输出 (JSON)
      </div>
      <pre className="text-xs bg-slate-900 text-green-300 p-4 rounded-xl overflow-auto max-h-[400px]"> {/* 提高对比度 */}
        {JSON.stringify(jsonObj, null, 2)}
      </pre>
    </div>
  );
}