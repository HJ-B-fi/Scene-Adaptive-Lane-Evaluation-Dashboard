<h1 align="center">🚗 Scene-Adaptive-Lane-Evaluation-Dashboard</h1>

<p align="center">
  <b>多模型协同 · 场景自适应 · 车道线检测评估可视化面板</b><br/>
  React (Vite) 前端 + FastAPI 后端，面向复杂交通场景的统一评估与展示
</p>

<p align="center">
  <img alt="react" src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=000"/>
  <img alt="fastapi" src="https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=fff"/>
  <img alt="python" src="https://img.shields.io/badge/Python-3.9%2B-3776AB?logo=python&logoColor=fff"/>
  <img alt="node" src="https://img.shields.io/badge/Node-18%2B-339933?logo=node.js&logoColor=fff"/>
  <img alt="license" src="https://img.shields.io/badge/License-MIT-success"/>
</p>

---

## ✨ 项目简介

**Scene-Adaptive-Lane-Evaluation-Dashboard** 是一个面向车道线检测算法的可视化评估系统，围绕 “**复杂交通场景** × **多指标量化** × **多模型协同**” 三个核心目标构建：

- **复杂场景覆盖**：标准场景 / 恶劣天气（雨雾）/ 光照变化（强光、背光）/ 遮挡路况 / 复杂路况（弯道、环岛、路口等）
- **多维指标统一评估**：F1、Accuracy、FPS、SC-IoU、FP、FN 与综合评分 **S**
- **场景自适应协同**：不同算法在不同场景各有优势，系统支持基于场景映射进行“最优算法推荐”，并在前端直观展示对比结果与指标变化

> 本仓库为重庆大学国家（市）级大学生创新训练项目《复杂交通场景下车道线检测算法研究》（项目编号：202510611338）的系统化产出之一。

---

## 🧠 方法亮点

### 1) 极端路况补充数据与场景化基准
公开数据集（如 TuSimple）多偏向晴天高速等“理想环境”，对雨雾、强光、遮挡磨损与复杂路口等覆盖不足。项目组围绕复杂场景自主采集并按 TuSimple 规范完成标注，构建“公开数据 + 补充数据 + 统一评测脚本”的场景化基准测试集。

### 2) 多场景 × 多指标的融合评估体系
不仅评估准确率类指标，还兼顾实时性与结构连续性：
- **准确性**：F1 / Accuracy  
- **实时性**：FPS  
- **结构连续性**：SC-IoU  
- **错误率**：FP / FN（可组合为 Avg_Error）

**综合评分**：

$$
S = 0.4\cdot F1 + 0.3\cdot FPS + 0.2\cdot SC\text{-}IoU + 0.1\cdot Avg\_Error
$$

其中：

$$
Avg\_Error=\frac{FP+FN}{2}
$$


### 3) 多模型协同的场景自适应框架（原型）
将 UFLD、UFLDv2、PINet、Polar R-CNN 等模型统一封装为一致接口，并建立“场景类别→最优算法/备选算法”映射，支持在复杂场景中做算法路由与推荐，提升整体综合得分与稳健性。

---

## 🖥️ 系统功能一览

- ✅ 场景选择 + 指标对比（折线图）
- ✅ 单场景双算法对比（雷达图）
- ✅ 输入/输出图像并排对比（原始图 vs 最优算法结果）
- ✅ 支持 demo 静态样例 & 后端动态上传两种模式

---

## 📸 界面预览
<img width="2566" height="3429" alt="2e5363a12e8648d2a3b8ac8745285eec" src="https://github.com/user-attachments/assets/b81a3d93-34dd-4e78-9d33-cef8167994ec" />

