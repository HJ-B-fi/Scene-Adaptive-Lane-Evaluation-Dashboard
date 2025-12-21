import { useEffect, useState } from "react";

export default function UploadByName({ onSelected }) {
  const [file, setFile] = useState(null);              // 选中的文件
  const [previewUrl, setPreviewUrl] = useState(null);  // 预览 URL
  const [msg, setMsg] = useState("");                  // 按钮下面的小字提示（“上传中 / 上传成功 / 失败原因”）
  const [toast, setToast] = useState(null);            // { kind: "select" | "upload", status: "loading" | "success" | "error", text: string }
  const [isUploading, setIsUploading] = useState(false);

  // 生成 / 清理 预览 URL
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // 弹框自动消失
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  async function handleUpload() {
    if (!file) {
      const text = "请先选择文件（文件名需为 inputN.jpg/png/webp）";
      setMsg(text);
      setToast({ kind: "upload", status: "error", text });
      return;
    }

    setIsUploading(true);
    setMsg("上传中...");
    setToast({
      kind: "upload",
      status: "loading",
      text: "正在上传到后端并触发分析，请稍候..."
    });

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: fd
      });

      const data = await res.json();

      if (!data.ok) {
        const text = "上传失败：" + (data.error || "后端返回错误");
        setMsg(text);
        setToast({ kind: "upload", status: "error", text });
        return;
      }

      // ✅ 后端确认收到图片，此时我们认为“分析任务已完成/结果已可用”
      setMsg(`上传成功：${data.input}`);
      setToast({
        kind: "upload",
        status: "success",
        text: `分析成功！文件 ${data.input} 的检测结果已加载到下方可视化区域。`
      });

      // 通知上层 App，让 ImageCompare / meta 去拉取对应 inputN
      onSelected?.(data.input);
    } catch (e) {
      const text = "上传失败：网络异常，请检查后端是否已启动";
      setMsg(text);
      setToast({ kind: "upload", status: "error", text });
    } finally {
      setIsUploading(false);
    }
  }

  // 渲染居中弹框的辅助函数
  function renderCenterModal() {
    if (!toast) return null;

    let iconBg = "";
    let iconText = "";
    let title = "";

    const { kind, status } = toast;

    if (status === "loading") {
      iconBg = "bg-indigo-100 text-indigo-600";
      iconText = "⏳";
      title = kind === "upload" ? "正在分析" : "正在处理";
    } else if (status === "error") {
      iconBg = "bg-rose-100 text-rose-600";
      iconText = "!";
      title = kind === "upload" ? "分析失败" : "操作失败";
    } else if (status === "success") {
      iconBg = "bg-emerald-100 text-emerald-600";
      iconText = "✓";
      if (kind === "select") {
        title = "图片选取成功";      // ✅ 选图成功的语义
      } else {
        title = "分析成功";          // ✅ 分析成功的语义
      }
    }

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
        onClick={() => setToast(null)} // 点击遮罩关闭
      >
        <div
          className="w-[320px] max-w-[90%] rounded-2xl bg-white shadow-2xl border border-slate-200 p-5 relative"
          onClick={(e) => e.stopPropagation()} // 阻止点击内容区域冒泡到遮罩
        >
          {/* 右上角关闭按钮 */}
          <button
            onClick={() => setToast(null)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-xs"
          >
            ✕
          </button>

          <div className="flex flex-col items-center gap-3 text-center">
            {/* 圆形图标 */}
            <div
              className={
                "w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold " +
                iconBg
              }
            >
              {iconText}
            </div>

            {/* 标题 & 文案 */}
            <div className="mt-1">
              <div className="text-base font-semibold text-slate-900">
                {title}
              </div>
              <div className="mt-1 text-xs text-slate-500 leading-relaxed">
                {toast.text}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* 卡片上传区域 */}
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
            {previewUrl ? (
              // ✅ 已选择文件：展示预览
              <div className="flex items-center gap-4 px-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {file?.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    已选择图片，点击下方按钮上传并分析
                  </p>
                </div>
              </div>
            ) : (
              // 未选择文件：展示默认文案
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <p className="mb-2 text-sm text-slate-500 font-semibold">
                  点击选择图片文件
                </p>
                <p className="text-xs text-slate-400">
                  支持 JPG, PNG, WEBP（文件名建议为 inputN.jpg/png）
                </p>
              </div>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setFile(f);
                setMsg(""); // 选新文件时，把旧的“上传成功/失败”提示清掉

                if (f) {
                  // ✅ 选中文件后给一个「图片选取成功」的弹框（这是前端本地成功）
                  setToast({
                    kind: "select",
                    status: "success",
                    text: `已选择文件：${f.name}，点击「开始分析检测」进行分析`
                  });
                }
              }}
            />
          </label>
        </div>

        {/* 上传按钮 */}
        <button
          onClick={handleUpload}
          className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-indigo-600 active:scale-95 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={!file || isUploading}
        >
          {isUploading ? "正在分析..." : "开始分析检测"}
        </button>

        {/* 按钮下方的小字：专门显示“上传中 / 上传成功 / 失败原因” */}
        {msg && (
          <div className="text-center text-[10px] font-bold uppercase tracking-widest text-indigo-500">
            {msg}
          </div>
        )}
      </div>

      {/* ✅ 居中弹框 */}
      {renderCenterModal()}
    </>
  );
}
