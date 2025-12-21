export default function ImageCompare({ inputSrc, outputSrc }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="group">
        <div className="flex items-center justify-between mb-3 px-2">
          <h4 className="font-bold text-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
            原始输入图像
          </h4>
        </div>
        <div className="rounded-[2rem] overflow-hidden bg-slate-200 shadow-2xl border-4 border-white aspect-video relative">
          <img src={inputSrc} alt="input" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
      </div>

      <div className="group">
        <div className="flex items-center justify-between mb-3 px-2">
          <h4 className="font-bold text-indigo-600 flex items-center gap-2">
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
            最优算法识别结果
          </h4>
        </div>
        <div className="rounded-[2rem] overflow-hidden bg-slate-200 shadow-2xl border-4 border-indigo-100 aspect-video relative">
          <img src={outputSrc} alt="output" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </div>
      </div>
    </div>
  );
}