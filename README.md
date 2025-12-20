[中文介绍](https://github.com/CognotEngine/amberpipeline/blob/main/README-CN.md)
# AmberPipeline AI

AmberPipeline AI is a middleware that connects the "AI creative end" with the "game engine runtime end", aiming to eliminate the gap between AI-generated resources and industrial game development, enabling fully automated conversion of assets from **Prompt to Binary**.

## Core Workflow

The entire process is divided into four stages, connected by Agents:

1. **Creative Input Layer** - Connects to Midjourney API or local Stable Diffusion WebUI to generate initial assets
2. **Smart Processing Layer** - Visual enhancement, semantic segmentation, material topology, 3D conversion
3. **Asset Cooking Layer** - Format compression, resource packaging
4. **Code Synchronization Layer** - Automatic registration, hot reload triggering

## MVP Features

The current version implements MVP features:
- 🔍 Monitors directories and automatically processes newly added images
- ✂️ Uses SAM (Segment Anything Model) for automatic segmentation
- 📐 Generates PBR normal maps
- 🖼️ Resizes images to target dimensions (default 512x512)
- 📝 **Naming Convention Resolver**: Automatically determines processing flow based on four-segment naming convention
- 💻 **C++ Code Generator**: Automatically generates resource ID headers and texture suffix definitions
- 📋 **Resource Metadata Management**: Generates JSON metadata files containing resource information
- ⚡ **Batch Mode**: Supports configurable maximum parallel tasks to prevent VRAM overflow
- 📁 **Optimized Work Directory Structure**: Raw → Sorted → Processed → Compiled
- 🎯 **Core Category Processing**: Automatic recognition and processing of characters, icons, scenes, and props
- 🎨 **Texture Suffix Support**: Recognition of PBR texture types like _BC, _N, _R, _E, _M

## Four-Segment Naming Convention

To allow automated scripts to immediately understand "what it is" and "how to process it", we use the following four-segment naming convention:

```
[Prefix]_[MaterialName]_[Attribute/Variant]_[Version].ext
```

**Examples**:
- `CHR_Mila_BaseColor_v01.png` - Character Mila's base color texture, version v01
- `UI_Icon_AmberNecklace_Gold.png` - Amber necklace icon in gold variant
- `ENV_SlavicForest_Spring_Diffuse.png` - Slavic forest spring diffuse texture
- `PRP_IronSword_Damaged.png` - Damaged iron sword prop

### Core Categories and Automatic Processing Rules

| Prefix | Category | Example | Automatic Processing |
|--------|----------|---------|----------------------|
| CHR | Character | CHR_Mila_BaseColor_v01.png | Segmentation → Align Bottom → Generate Shadow |
| UI | Icon | UI_Icon_AmberNecklace_Gold.png | Square Cropping → Edge Enhancement → Icon Set Split |
| ENV | Environment/Terrain | ENV_SlavicForest_Spring_Diffuse.png | Normal Generation → Seamless Processing → LOD Generation |
| PRP | Decoration/Prop | PRP_IronSword_Damaged.png | 3D Hint → Collision Body Generation |

### Texture Suffix Standards

| Suffix | Meaning | Engine Usage |
|--------|---------|--------------|
| _BC | Base Color (Diffuse) | Object's base color |
| _N | Normal | Bump texture and details |
| _R | Roughness | Determines whether reflected light is scattered or concentrated |
| _E | Emissive | Glowing parts like amber, torches |
| _M | Mask | Used to implement dynamic effects like bloodstains, snow |

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Download SAM Model

Download the SAM model from [Segment Anything Model](https://github.com/facebookresearch/segment-anything), recommended to use `sam_vit_h_4b8939.pth`, and place it in the `models` directory.

### 3. Configure Parameters

Edit the `config.json` file and adjust the following parameters:

```json
{
    "raw_dir": "Raw",           // Stores AI-generated original images
    "sorted_dir": "Sorted",     // Files manually or AI-renamed, script monitors this folder
    "processed_dir": "Processed", // Automatically processed, transparent PNGs
    "compiled_dir": "Compiled",   // Final C++ engine binary files and .h headers
    "watch_dir": "Sorted",      // Monitoring directory, pointing to Sorted
    "output_dir": "Processed",   // Output directory, pointing to Processed
    "models_dir": "models",
    "cpp_header_dir": "cpp/include",
    "target_size": [512, 512],   // Target dimensions
    "sam_model_path": "models/sam_vit_h_4b8939.pth",  // SAM model path
    "sam_device": "cpu",        // Running device (cpu or cuda)
    "sam_confidence_threshold": 0.8,  // Segmentation confidence threshold
    "normal_strength": 1.0,      // Normal strength
    "normal_blur": 0.5,           // Normal map blur
    "batch_mode": false,          // Whether to enable batch mode
    "max_parallel_tasks": 4       // Maximum number of parallel tasks
}
```

### 4. Run the Program

```bash
python main.py
```

### 5. Test Flow

1. Place AI-generated original images into the `Raw` directory
2. Manually or using AI tools, rename images to the four-segment naming format and place them in the `Sorted` directory
3. The program will automatically detect new images and start processing
4. Processing results will be saved in the `Processed` directory
5. Final C++ headers will be generated in the `Compiled` directory

**Processing Result Examples**:
- `CHR_Mila_processed.png` - Processed character image
- `CHR_Mila_normal.png` - Generated normal map
- `CHR_Mila_metadata.json` - Resource metadata file
- `AssetIDs.h` - Automatically generated C++ resource ID header

## Project Structure

```
AmberPipeline/
├── main.py                 # Main program entry
├── config.py               # Configuration management
├── config.json             # Configuration file
├── requirements.txt        # Dependencies list
├── README.md               # Project description (English)
├── README-CN.md            # Project description (Chinese)
├── Raw/                    # Stores AI-generated original images
├── Sorted/                 # Files manually or AI-renamed
├── Processed/              # Automatically processed, transparent PNGs
├── Compiled/               # Final C++ engine binary files and .h headers
├── cpp/                    # C++ code directory
│   ├── include/            # C++ headers
│   │   ├── AssetIDs.h      # Automatically generated resource ID header
│   │   ├── ResourceManager.h # Resource manager header
│   │   └── ResourceTypes.h  # Resource type definitions
│   ├── src/                # C++ source files
│   │   └── ResourceManager.cpp # Resource manager implementation
│   └── tools/              # C++ tools
│       ├── AssetPacker.cpp  # Resource packer
│       └── ResourceSyncServer.cpp # Resource sync server
├── modules/                # Function modules
│   ├── image_processing.py  # Image processing basics
│   ├── segmentation.py      # Semantic segmentation (SAM)
│   ├── normal_map.py        # Normal map generation
│   ├── naming_resolver.py   # Naming convention resolver
│   └── code_sync.py         # C++ code generator
├── python_bridge/          # Python and C++ bridge code
│   └── amber_pipeline_bridge.py # Bridge implementation
├── tools/                  # Auxiliary tools
│   └── generate_asset_ids.py # Asset ID generation tool
└── models/                 # AI model directory
    └── sam_vit_h_4b8939.pth # SAM model file
```

## Core Technology Stack

- **Development Language**: C++ 20 (core performance) + Python (AI models and scripts)
- **Image Processing**: OpenCV / Pillow, DirectXTex
- **AI Inference**: ONNX Runtime, PyTorch
- **UI Framework**: ImGui
- **Backend/API**: FastAPI
- **Resource Management**: Custom resource packaging and loading system

## Development Roadmap

### Phase 1: MVP (Completed)
- ✅ Directory monitoring script
- ✅ SAM automatic segmentation
- ✅ Normal map generation
- ✅ Image resizing
- ✅ Naming convention resolver
- ✅ C++ code generator
- ✅ Resource metadata management
- ✅ Optimized work directory structure
- ✅ Four-segment naming convention support
- ✅ Core category processing rules

### Phase 2: Engine Integration (In Progress)
- ✅ Write C++ ResourceManager class
- ✅ Automatically generate mapping headers
- 🔄 Implement resource packer
- 🔄 Develop resource sync server

### Phase 3: Generalization and UI (Planned)
- 📅 Develop visual operation interface
- 📅 Add support for Unity/Unreal
- 📅 Improve documentation and examples
- 📅 Support more AI models and generation tools




## Contribution

Contributions are welcome! Please submit Issues and Pull Requests.

## Contact

For questions or suggestions, please contact us through:
- Email: [aomozx88@gmail.com]
- GitHub: [https://github.com/CognotEngine/amberpipeline](https://github.com/CognotEngine/amberpipeline)

## Acknowledgments

Thanks to all developers and users who have contributed to the AmberPipeline project!

---

**AmberPipeline AI** - Seamlessly connecting AI-generated resources to game engine development 🚀
