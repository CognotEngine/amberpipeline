# AmberPipeline AI

AmberPipeline AI 是一款连接"AI 创意端"与"游戏引擎运行端"的中间件，旨在消除 AI 生成资源与工业化游戏开发之间的断层，实现资产从**提示词(Prompt)到二进制文件(Binary)**的全自动转化。

## 核心工作流程

整个流程分为四个阶段，通过智能体（Agents）串联：

1. **创意接入层 (Creative Input)** - 对接 Midjourney API 或本地 Stable Diffusion WebUI，生成初始资产
2. **智能加工层 (Smart Processing)** - 视觉增强、语义分割、材质拓扑、3D 化
3. **资产编译层 (Asset Cooking)** - 格式压缩、资源打包
4. **代码同步层 (Code Synchronization)** - 自动注册、热重载触发

## MVP 功能

当前版本实现了 MVP 功能：
- 🔍 监视目录，自动处理新添加的图片
- ✂️ 使用 SAM (Segment Anything Model) 进行自动抠图
- 📐 生成 PBR 法线贴图
- 🖼️ 将图片缩放到目标尺寸 (默认 512x512)
- 📝 **命名规范解析器**：根据四段式命名法自动决定处理流程
- 💻 **C++ 代码生成器**：自动生成资源 ID 头文件和贴图后缀定义
- 📋 **资源元数据管理**：生成包含资源信息的 JSON 元数据文件
- ⚡ **批处理模式**：支持配置最大并行任务数，防止显存溢出
- 📁 **优化的工作目录结构**：Raw → Sorted → Processed → Compiled
- 🎯 **核心分类处理**：人物、图标、场景、道具的自动识别和处理
- 🎨 **贴图后缀支持**：_BC、_N、_R、_E、_M 等 PBR 贴图类型识别

## 四段式命名法

为了让自动化脚本一眼看出"它是谁"以及"该怎么处理它"，我们使用以下四段式命名法：

```
[前缀]_[素材名]_[属性/变体]_[版本].ext
```

**示例**：
- `CHR_Mila_BaseColor_v01.png` - 人物 Mila 的基础颜色贴图，版本 v01
- `UI_Icon_AmberNecklace_Gold.png` - 琥珀项链图标的金色变体
- `ENV_SlavicForest_Spring_Diffuse.png` - 斯拉夫森林春季漫反射贴图
- `PRP_IronSword_Damaged.png` - 损坏的铁剑道具

### 核心分类与自动化处理规则

| 前缀 | 分类 | 示例 | 自动化处理 |
|------|------|------|------------|
| CHR | 人物 | CHR_Mila_BaseColor_v01.png | 抠图 → 对齐底部 → 生成阴影 |
| UI | 图标 | UI_Icon_AmberNecklace_Gold.png | 正方形裁切 → 边缘强化 → 图标集分拆 |
| ENV | 场景/地形 | ENV_SlavicForest_Spring_Diffuse.png | 法线生成 → 无缝化 → LOD 生成 |
| PRP | 装饰品/道具 | PRP_IronSword_Damaged.png | 3D 化提示 → 碰撞体生成 |

### 贴图后缀标准

| 后缀 | 含义 | 引擎用途 |
|------|------|----------|
| _BC | Base Color (漫反射) | 物体的基础颜色 |
| _N | Normal (法线) | 凹凸质感与细节 |
| _R | Roughness (粗糙度) | 决定反射光是散乱还是集中 |
| _E | Emissive (自发光) | 琥珀、火把等发光部位 |
| _M | Mask (遮罩) | 用于实现血迹、积雪等动态效果 |

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 下载 SAM 模型

从 [Segment Anything Model](https://github.com/facebookresearch/segment-anything) 下载 SAM 模型，推荐使用 `sam_vit_h_4b8939.pth`，并将其放置在 `models` 目录下。

### 3. 配置参数

编辑 `config.json` 文件，调整以下参数：

```json
{
    "raw_dir": "Raw",           # 存放 AI 生成的原始图
    "sorted_dir": "Sorted",     # 人工或 AI 初步重命名后的文件，脚本监控此文件夹
    "processed_dir": "Processed", # 自动化脚本处理后的、带透明度的 PNG
    "compiled_dir": "Compiled",   # 最终生成的 C++ 引擎专用二进制文件和 .h 头文件
    "watch_dir": "Sorted",      # 监控目录，指向 Sorted
    "output_dir": "Processed",   # 输出目录，指向 Processed
    "models_dir": "models",
    "cpp_header_dir": "cpp/include",
    "target_size": [512, 512],   # 目标尺寸
    "sam_model_path": "models/sam_vit_h_4b8939.pth",  # SAM模型路径
    "sam_device": "cpu",        # 运行设备 (cpu 或 cuda)
    "sam_confidence_threshold": 0.8,  # 分割置信度阈值
    "normal_strength": 1.0,      # 法线强度
    "normal_blur": 0.5,           # 法线模糊度
    "batch_mode": false,          # 是否开启批处理模式
    "max_parallel_tasks": 4       # 最大并行任务数
}
```

### 4. 运行程序

```bash
python main.py
```

### 5. 测试流程

1. 将 AI 生成的原始图片放入 `Raw` 目录
2. 手动或使用 AI 工具将图片重命名为四段式命名格式，并放入 `Sorted` 目录
3. 程序会自动检测到新图片并开始处理
4. 处理结果会保存在 `Processed` 目录中
5. 最终的 C++ 头文件会生成在 `Compiled` 目录中

**处理结果示例**：
- `CHR_Mila_processed.png` - 处理后的人物图片
- `CHR_Mila_normal.png` - 生成的法线贴图
- `CHR_Mila_metadata.json` - 资源元数据文件
- `AssetIDs.h` - 自动生成的 C++ 资源 ID 头文件

## 项目结构

```
AmberPipeline/
├── main.py                 # 主程序入口
├── config.py               # 配置管理
├── config.json             # 配置文件
├── requirements.txt        # 依赖列表
├── README.md               # 项目说明（英文）
├── README-CN.md            # 项目说明（中文）
├── Raw/                    # 存放 AI 生成的原始图
├── Sorted/                 # 人工或 AI 初步重命名后的文件
├── Processed/              # 自动化脚本处理后的、带透明度的 PNG
├── Compiled/               # 最终生成的 C++ 引擎专用二进制文件和 .h 头文件
├── cpp/                    # C++代码目录
│   ├── include/            # C++头文件
│   │   ├── AssetIDs.h      # 自动生成的资源ID头文件
│   │   ├── ResourceManager.h # 资源管理器头文件
│   │   └── ResourceTypes.h  # 资源类型定义
│   ├── src/                # C++源文件
│   │   └── ResourceManager.cpp # 资源管理器实现
│   └── tools/              # C++工具
│       ├── AssetPacker.cpp  # 资源打包器
│       └── ResourceSyncServer.cpp # 资源同步服务器
├── modules/                # 功能模块
│   ├── image_processing.py  # 图像处理基础
│   ├── segmentation.py      # 语义分割（SAM）
│   ├── normal_map.py        # 法线贴图生成
│   ├── naming_resolver.py   # 命名规范解析器
│   └── code_sync.py         # C++代码生成器
├── python_bridge/          # Python 与 C++ 桥接代码
│   └── amber_pipeline_bridge.py # 桥接实现
├── tools/                  # 辅助工具
│   └── generate_asset_ids.py # 资产ID生成工具
└── models/                 # AI 模型目录
    └── sam_vit_h_4b8939.pth # SAM 模型文件
```

## 核心技术栈

- **开发语言**: C++ 20 (核心性能) + Python (AI 模型与脚本)
- **图像处理**: OpenCV / Pillow, DirectXTex
- **AI 推理**: ONNX Runtime, PyTorch
- **UI 框架**: ImGui
- **后端/API**: FastAPI
- **资源管理**: 自定义资源打包与加载系统

## 开发路线图

### 第一阶段：MVP (已完成)
- ✅ 目录监视脚本
- ✅ SAM 自动抠图
- ✅ 法线贴图生成
- ✅ 图片缩放
- ✅ 命名规范解析器
- ✅ C++ 代码生成器
- ✅ 资源元数据管理
- ✅ 优化的工作目录结构
- ✅ 四段式命名法支持
- ✅ 核心分类处理规则

### 第二阶段：引擎集成 (进行中)
- ✅ 编写 C++ 端的 ResourceManager 类
- ✅ 自动生成映射头文件
- 🔄 实现资源打包器
- 🔄 开发资源同步服务器

### 第三阶段：通用化与 UI (规划中)
- 📅 开发可视化操作界面
- 📅 增加对 Unity/Unreal 的支持
- 📅 完善文档和示例
- 📅 支持更多 AI 模型和生成工具


## 许可证

[MIT License](LICENSE)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请通过以下方式联系：
- Email: [aomozx88@gmail.com]
- GitHub: [https://github.com/CognotEngine/amberpipeline](https://github.com/CognotEngine/amberpipeline)

## 致谢

感谢所有为 AmberPipeline 项目做出贡献的开发者和用户！

---

**AmberPipeline AI** - 让 AI 生成资源无缝对接游戏引擎开发 🚀
