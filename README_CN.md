# AmberPipeline

AmberPipeline 是一个专注于将 AI 原图转换为游戏资源的中间件工具，为设计师提供从图像分割到角色骨骼绑定的完整工作流程解决方案。

## 技术栈

### 前端
- **React 19** - 用于构建用户界面的 JavaScript 库
- **TypeScript (v5.7.0)** - 提供类型安全的 JavaScript 超集
- **Electron (v33.2.0)** - 跨平台桌面应用开发框架
- **TailwindCSS (v3.4.16)** - 实用优先的 CSS 框架
- **Vite (v6.0.0)** - 下一代前端构建工具
- **Shadcn UI** - 基于 Radix UI 和 Tailwind CSS 构建的组件库
- **Lucide React (v0.460.0)** - 图标库
- **Zustand (v5.0.0)** - 轻量级状态管理库
- **TanStack Query (v5.90.12)** - 数据获取和缓存库

### 后端
- **Python 3** - 高级编程语言
- **FastAPI (v0.95.0+)** - 现代、快速的 Web 框架
- **SAM (Segment Anything Model)** - 强大的图像分割模型
- **Pillow (v9.0.0+)** - Python 图像处理库
- **NumPy (v1.21.0+)** - 数值计算库
- **OpenCV (v4.5.0+)** - 计算机视觉库
- **Uvicorn (v0.22.0+)** - ASGI 服务器
- **Watchdog (v3.0.0+)** - 目录监控库
- **Pydantic (v2.0.0+)** - 数据验证库
- **Rich (v13.0.0+)** - 美观的控制台输出

## 功能

作为从 AI 原图到游戏资源的专业中间件，AmberPipeline 提供完整的工作流程解决方案，帮助设计师高效地将原图转换为可用于游戏开发的资源。

### 核心功能

#### 1. 精确裁剪
- 基于 AI 的图像分割和背景去除
- 支持点提示引导的分割
- 实时预览和编辑

#### 2. 角色分层
- 多级角色管理
- 图层堆叠和混合模式
- 精细编辑工具

#### 3. 骨骼绑定
- 角色骨骼创建和编辑
- 骨骼权重绘制
- 动画预览

### 辅助功能

- **多标签管理** - 支持同时处理多个项目
- **实时系统监控** - GPU 负载、VRAM 使用情况、FPS 显示
- **任务进度跟踪** - 处理进度的可视化显示
- **智能面板** - 可折叠的右侧属性面板
- **响应式设计** - 适应不同屏幕尺寸

## 项目结构

```
AmberPipeline/
├── frontend/                 # 前端代码
│   ├── src/                 # 源代码
│   │   ├── app/             # 应用核心
│   │   │   ├── App.tsx      # 主应用组件
│   │   │   └── main.tsx     # 应用入口点
│   │   ├── assets/          # 静态资源
│   │   │   ├── styles/      # 样式文件
│   │   │   │   └── index.css # 主样式表
│   │   │   └── images/      # 图像资源
│   │   ├── components/      # React 组件
│   │   │   ├── ai/          # AI 相关组件
│   │   │   └── common/      # 通用组件
│   │   ├── i18n/            # 国际化
│   │   ├── lib/             # 工具库
│   │   │   ├── api.ts       # API 客户端
│   │   │   └── queryClient.ts # TanStack Query 客户端
│   │   ├── modules/         # 功能模块
│   │   │   ├── canvas/      # 画布模块
│   │   │   ├── header/      # 头部模块
│   │   │   ├── properties/  # 属性面板模块
│   │   │   └── task/        # 任务模块
│   │   ├── stores/          # Zustand 状态管理
│   │   ├── themes/          # 主题配置
│   │   └── types/           # TypeScript 类型定义
│   ├── electron/            # Electron 相关文件
│   │   ├── main.cjs         # Electron 主进程文件
│   │   └── preload.js       # Electron 预加载脚本
│   ├── public/              # 公共资源
│   ├── package.json         # 前端依赖配置
│   ├── tsconfig.json        # TypeScript 配置
│   ├── vite.config.ts       # Vite 配置
│   └── tailwind.config.js   # TailwindCSS 配置
├── backend/                 # 后端代码
│   ├── Processed/           # 处理后的文件
│   ├── Sorted/              # 排序后的文件
│   ├── Temp/                # 临时文件
│   ├── __pycache__/         # Python 缓存文件
│   ├── __init__.py          # 包初始化文件
│   ├── config.json          # 配置文件
│   ├── server.py            # FastAPI 服务器
│   └── backend_server.log   # 服务器日志
├── cpp/                     # C++ 相关代码
│   ├── include/             # 头文件
│   ├── src/                 # 源代码
│   ├── test/                # 测试代码
│   └── tools/               # 工具代码
├── models/                  # 模型文件
│   └── sam_vit_h_4b8939.pth # SAM 模型权重
├── modules/                 # Python 模块
│   ├── __pycache__/         # Python 缓存文件
│   └── *.py                 # 各种功能模块
└── README.md                # 项目文档
```

## 安装方法

### 前端安装

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install
```

### 后端安装

```bash
# 进入后端目录
cd backend

# 安装核心依赖
pip install fastapi uvicorn pillow numpy python-multipart

# 安装 SAM 模型相关依赖
# 注意：SAM 模型可能需要额外的安装步骤，请参考官方文档
```

## 启动方式

### 开发模式启动

#### 前端（带 Electron）

```bash
# 进入前端目录
cd frontend

# 启动开发服务器和 Electron 应用
npm run electron:dev
```

#### 前端（仅 Web 开发服务器）

```bash
# 进入前端目录
cd frontend

# 启动 Vite 开发服务器
npm run dev
```

#### 后端

```bash
# 进入后端目录
cd backend

# 启动 FastAPI 服务器
python server.py
```

### 生产环境构建

#### 前端构建

```bash
# 进入前端目录
cd frontend

# 构建生产版本
npm run build

# 构建 Electron 应用
npm run electron:build
```

## API 端点

- **GET /** - API 根路径，返回 API 信息
- **POST /segment** - 图像分割（背景去除）
- **POST /generate-normal-map** - 生成法线贴图

## 键盘快捷键

- **F** - 打开文件菜单
- **E** - 打开编辑菜单
- **S** - 打开选择菜单

## 系统要求

### 前端
- Node.js 18+（推荐：Node.js 20+）
- npm 或 yarn

### 后端
- Python 3.8+
- 足够的 GPU 内存（推荐 8GB+）

## 许可证

MIT License