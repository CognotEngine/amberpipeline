# AmberPipeline

AmberPipeline是一款专注于AI原图到游戏资产转换的中间件工具，为设计师提供从图像分割到角色骨架绑定的完整工作流解决方案。

## 技术栈

### 前端
- **Vue 3 (v3.5.25)** - 渐进式JavaScript框架，用于构建用户界面
- **TypeScript (v5.9.0)** - JavaScript的超集，提供类型安全
- **Electron (v39.2.7)** - 跨平台桌面应用开发框架
- **TailwindCSS (v4.1.18)** - 实用优先的CSS框架
- **Vite (v7.2.4)** - 下一代前端构建工具
- **Element Plus (v2.13.0)** - Vue 3 UI组件库
- **Lucide Vue Next (v0.562.0)** - 图标库
- **Pinia (v3.0.4)** - Vue 3状态管理库

### 后端
- **Python 3** - 高级编程语言
- **FastAPI (v0.95.0+)** - 现代、快速的Web框架
- **SAM (Segment Anything Model)** - 强大的图像分割模型
- **Pillow (v9.0.0+)** - Python图像处理库
- **NumPy (v1.21.0+)** - 数值计算库
- **OpenCV (v4.5.0+)** - 计算机视觉库
- **Uvicorn (v0.22.0+)** - ASGI服务器
- **Watchdog (v3.0.0+)** - 目录监控库
- **Pydantic (v2.0.0+)** - 数据验证库
- **Rich (v13.0.0+)** - 美化控制台输出

## 特点功能

作为AI原图到游戏资产的专业中间件，AmberPipeline提供了完整的工作流解决方案，帮助设计师高效地将原始图像转换为可用于游戏开发的资产。

### 核心功能

#### 1. 精确裁剪 (Precision Cut)
- AI驱动的图像分割和背景移除
- 支持点提示引导分割
- 实时预览和编辑

#### 2. 角色图层 (Character Layer)
- 多层级角色管理
- 图层叠加和混合模式
- 精细化编辑工具

#### 3. 骨架绑定 (Skeleton Binding)
- 角色骨架创建和编辑
- 骨骼权重绘制
- 动画预览

### 辅助功能

- **多标签页管理** - 支持同时处理多个项目
- **实时系统监控** - GPU负载、VRAM使用情况、FPS显示
- **任务进度跟踪** - 可视化展示处理进度
- **智能面板** - 可折叠的右侧属性面板
- **响应式设计** - 适应不同屏幕尺寸

## 项目结构

```
AmberPipeline/
├── frontend/                 # 前端代码
│   ├── src/                 # 源代码
│   │   ├── assets/          # 静态资源
│   │   │   ├── fonts/       # 字体文件
│   │   │   ├── base.css     # 基础样式
│   │   │   ├── logo.svg     # 项目标志
│   │   │   └── main.css     # 主样式文件
│   │   ├── components/      # Vue组件
│   │   │   ├── icons/       # 图标组件
│   │   │   ├── AmberGlowButton.vue # 琥珀光效按钮组件
│   │   │   ├── DragNumber.vue # 拖拽数字组件
│   │   │   ├── LeftNavigation.vue # 左侧导航组件
│   │   │   ├── NumberInput.vue # 数字输入组件
│   │   │   ├── StatusBar.vue # 状态栏组件
│   │   │   └── TechPanel.vue # 技术面板组件
│   │   ├── modules/         # 功能模块
│   │   │   ├── canvas/      # 画布模块
│   │   │   ├── header/      # 头部模块
│   │   │   ├── properties/  # 属性面板模块
│   │   │   └── task/        # 任务模块
│   │   ├── stores/          # Pinia状态管理
│   │   ├── types/           # TypeScript类型定义
│   │   ├── App.vue          # 主应用组件
│   │   └── main.ts          # 应用入口
│   ├── electron/            # Electron相关文件
│   │   ├── main.cjs         # Electron主进程文件
│   │   └── preload.js       # Electron预加载脚本
│   ├── public/              # 公共资源
│   ├── package.json         # 前端依赖配置
│   ├── vite.config.ts       # Vite配置
│   └── tailwind.config.js   # TailwindCSS配置
├── backend/                 # 后端代码
│   ├── Processed/           # 处理后的文件
│   ├── Sorted/              # 分类后的文件
│   ├── Temp/                # 临时文件
│   ├── __pycache__/         # Python缓存文件
│   ├── __init__.py          # 包初始化文件
│   ├── config.json          # 配置文件
│   ├── server.py            # FastAPI服务器
│   └── backend_server.log   # 服务器日志
├── cpp/                     # C++相关代码
│   ├── include/             # 头文件
│   ├── src/                 # 源代码
│   ├── test/                # 测试代码
│   └── tools/               # 工具代码
├── models/                  # 模型文件
│   └── sam_vit_h_4b8939.pth # SAM模型权重
├── modules/                 # Python模块
│   ├── __pycache__/         # Python缓存文件
│   └── *.py                 # 各种功能模块
└── README.md                # 项目说明文档
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

# 安装SAM模型相关依赖
# 注意：SAM模型可能需要额外的安装步骤，请参考官方文档
```

## 启动方法

### 开发模式启动

#### 前端（带Electron）

```bash
# 进入前端目录
cd frontend

# 启动开发服务器和Electron应用
npm run electron:dev
```

#### 前端（仅Web开发服务器）

```bash
# 进入前端目录
cd frontend

# 启动Vite开发服务器
npm run dev
```

#### 后端

```bash
# 进入后端目录
cd backend

# 启动FastAPI服务器
python server.py
```

### 生产环境构建

#### 前端构建

```bash
# 进入前端目录
cd frontend

# 构建生产版本
npm run build

# 构建Electron应用
npm run electron:build
```

## API端点

- **GET /** - API根路径，返回API信息
- **POST /segment** - 图像分割（背景移除）
- **POST /generate-normal-map** - 生成法线贴图

## 快捷键

- **F** - 打开文件菜单
- **E** - 打开编辑菜单
- **S** - 打开选择菜单

## 系统要求

### 前端
- Node.js ^20.19.0 或 >=22.12.0
- npm 或 yarn

### 后端
- Python 3.8+
- 足够的GPU内存（推荐8GB+）

## 许可证

MIT License