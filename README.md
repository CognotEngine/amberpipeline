<p align="center">
  <img src="https://github.com/CognotEngine/amberpipeline/blob/main/input/LOGO.jpeg" width="300" />
</p>


[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.0-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.16-blue.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0.0-blue.svg)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.95.0+-blue.svg)](https://fastapi.tiangolo.com/)

**AmberPipeline** 是一个专注于将AI原始图像转换为游戏资产的中间件工具，为设计师提供从图像分割到角色骨骼绑定的完整工作流解决方案。

通过集成先进的AI图像分割技术和直观的图层编辑系统，AmberPipeline大大简化了游戏角色资产的创建流程，让设计师能够更高效地将创意转化为可用的游戏资源。

## 项目截图

*注：以下为项目主要界面展示，实际效果可能会有所不同*。

### 主界面

![主界面](https://github.com/CognotEngine/AmberPipeline/blob/main/input/main_interface.png?raw=true)

### 图像分割功能

![图像分割](https://github.com/CognotEngine/AmberPipeline/blob/main/input/segmentation.png?raw=true)

### 图层管理面板

![图层管理](https://github.com/CognotEngine/AmberPipeline/blob/main/input/layer_management.png?raw=true)

## 目录

- [项目截图](#项目截图)
- [技术栈](#技术栈)
- [功能特性](#功能特性)
- [项目结构](#项目结构)
- [安装方法](#安装方法)
- [启动方式](#启动方式)
- [API端点](#api端点)
- [键盘快捷键](#键盘快捷键)
- [系统要求](#系统要求)
- [许可证](#许可证)
- [贡献指南](#贡献指南)
- [联系方式](#联系方式)
- [致谢](#致谢)

## 技术栈

### 前端
- **React 19** - 用于构建用户界面的JavaScript库
- **TypeScript (v5.7.0)** - 提供类型安全的JavaScript超集
- **Electron (v33.2.0)** - 跨平台桌面应用开发框架
- **TailwindCSS (v3.4.16)** - 实用优先的CSS框架
- **Vite (v6.0.0)** - 下一代前端构建工具
- **Shadcn UI** - 基于Radix UI和Tailwind CSS构建的组件库
- **Lucide React (v0.460.0)** - 图标库
- **Zustand (v5.0.0)** - 轻量级状态管理库
- **TanStack Query (v5.90.12)** - 数据获取和缓存库

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
- **Rich (v13.0.0+)** - 美观的控制台输出

## 功能特性

作为一款专业的AI原始图像转游戏资产中间件，AmberPipeline提供完整的工作流解决方案，帮助设计师高效地将原始图像转换为游戏开发中可用的资产。

### 核心功能

#### 1. 精确裁剪
- AI驱动的图像分割与背景移除
- 支持点提示引导的精确分割
- 实时预览与编辑功能

#### 2. 角色图层管理
- 多层级角色资产管理
- 图层堆叠与混合模式
- 精细化编辑工具集

#### 3. 骨骼绑定系统
- 角色骨架创建与编辑
- 骨骼权重绘制
- 动画预览功能

### 辅助功能

- **多标签页管理** - 支持同时处理多个项目
- **实时系统监控** - GPU负载、显存使用、FPS显示
- **任务进度追踪** - 可视化展示处理进度
- **智能面板** - 可折叠的右侧属性面板
- **响应式设计** - 适配不同屏幕尺寸

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
│   │   │   └── images/      # 图片资源
│   │   ├── components/      # React组件
│   │   │   ├── ai/          # AI相关组件
│   │   │   └── common/      # 通用组件
│   │   ├── i18n/            # 国际化
│   │   ├── lib/             # 工具库
│   │   │   ├── api.ts       # API客户端
│   │   │   └── queryClient.ts # TanStack Query客户端
│   │   ├── modules/         # 功能模块
│   │   │   ├── canvas/      # 画布模块
│   │   │   ├── header/      # 头部模块
│   │   │   ├── properties/  # 属性面板模块
│   │   │   └── task/        # 任务模块
│   │   ├── stores/          # Zustand状态管理
│   │   ├── themes/          # 主题配置
│   │   └── types/           # TypeScript类型定义
│   ├── electron/            # Electron相关文件
│   │   ├── main.cjs         # Electron主进程文件
│   │   └── preload.js       # Electron预加载脚本
│   ├── public/              # 公共资源
│   ├── package.json         # 前端依赖配置
│   ├── tsconfig.json        # TypeScript配置
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

# 安装SAM模型相关依赖
# 注意：SAM模型可能需要额外的安装步骤，请参考官方文档
```

## 启动方式

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
- 足够的GPU内存（推荐8GB+）

## 许可证

Apache License 2.0

## 贡献指南

欢迎为AmberPipeline项目做出贡献！如果您有任何想法、建议或发现了问题，请按照以下步骤进行：

1. Fork项目仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个Pull Request

请确保您的代码符合项目的编码规范，并通过所有测试。

## 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- GitHub Issues: [https://github.com/CognotEngine/AmberPipeline/issues](https://github.com/CognotEngine/AmberPipeline/issues)
- 项目邮箱: [aomozx88@gmail.com](mailto:aomozx88@gmail.com)

## 致谢

感谢所有为AmberPipeline项目做出贡献的开发者和用户！
