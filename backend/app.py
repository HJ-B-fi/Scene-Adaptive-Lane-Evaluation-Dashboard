from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pathlib import Path
import json
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT = Path(__file__).resolve().parent
UPLOAD_DIR = ROOT / "uploads"
OUTPUT_DIR = ROOT / "outputs"
MAP_FILE = ROOT / "scene_map.json"

UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

def load_scene_map():
    if MAP_FILE.exists():
        try:
            return json.loads(MAP_FILE.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}

def input_to_output_name(input_name: str):
    """
    input3.jpg -> output3.jpg
    支持：input3.png -> output3.png（同扩展名）
    """
    m = re.match(r"^(input)(\d+)\.(jpg|jpeg|png|webp)$", input_name, re.IGNORECASE)
    if not m:
        return None
    idx = m.group(2)
    ext = m.group(3).lower()
    return f"output{idx}.{ext}"

@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...)):
    """
    关键：保留用户上传的原始文件名，例如 input7.jpg
    """
    filename = (file.filename or "").strip()
    if not filename:
        return JSONResponse({"ok": False, "error": "文件名为空"}, status_code=400)

    out_name = input_to_output_name(filename)
    if out_name is None:
        return JSONResponse(
            {"ok": False, "error": "文件名必须形如 inputN.jpg/png/webp，例如 input1.jpg"},
            status_code=400,
        )

    save_path = UPLOAD_DIR / filename
    content = await file.read()
    save_path.write_bytes(content)

    return {"ok": True, "input": filename, "output": out_name}

@app.get("/api/meta")
def get_meta(input_name: str):
    """
    返回：input 对应 output，以及 scene（从 scene_map.json 查）
    """
    out_name = input_to_output_name(input_name)
    if out_name is None:
        return JSONResponse({"ok": False, "error": "不合法的 input_name"}, status_code=400)

    scene_map = load_scene_map()
    scene = scene_map.get(input_name, "未配置场景")

    input_exists = (UPLOAD_DIR / input_name).exists()
    output_exists = (OUTPUT_DIR / out_name).exists()

    return {
        "ok": True,
        "input": input_name,
        "output": out_name,
        "scene": scene,
        "input_exists": input_exists,
        "output_exists": output_exists,
    }

@app.get("/api/input-image")
def get_input_image(name: str):
    path = UPLOAD_DIR / name
    if not path.exists():
        return JSONResponse({"ok": False, "error": f"未找到 uploads/{name}"}, status_code=404)
    return FileResponse(path)

@app.get("/api/output-image")
def get_output_image(name: str):
    path = OUTPUT_DIR / name
    if not path.exists():
        return JSONResponse({"ok": False, "error": f"未找到 outputs/{name}（请把标注图放进 outputs）"}, status_code=404)
    return FileResponse(path)
