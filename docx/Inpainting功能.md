# Inpainting 功能实现文档

## 概述

本文档描述了 AmberPipeline 项目中 Inpainting（图像修复）功能的实现细节。

## 功能特性

### 后端实现

1. **Inpainting 模块** (`backend/modules/inpainting.py`)
   - 支持多种修复方法：
     - **Telea**: 快速行进法，速度快，适合小区域修复
     - **Navier-Stokes (NS)**: 适合大区域修复，但速度较慢
     - **LaMa**: 基于深度学习的方法（预留接口，需要额外安装）
   
   - 主要功能：
     - `inpaint()`: 执行图像修复
     - `inpaint_with_preview()`: 执行修复并生成预览
     - `batch_inpaint()`: 批量修复
     - `get_available_methods()`: 获取可用方法列表
     - `estimate_processing_time()`: 估算处理时间

2. **API 端点** (`backend/server.py`)
   - `POST /inpaint`: 执行图像修复
     - 参数：
       - `image`: 原始图像文件
       - `mask`: 遮罩图像文件（白色区域将被修复）
       - `method`: 修复方法 (telea/ns/lama)
       - `radius`: 修复半径（仅用于 OpenCV 方法）
       - `padding`: 遮罩扩展像素数
   
   - `GET /inpaint/methods`: 获取可用的修复方法列表

### 前端实现

1. **Inpainting 面板组件** (`frontend/src/modules/canvas/components/panels/InpaintingPanel.tsx`)
   - 提供用户界面用于：
     - 选择修复方法
     - 调整修复参数（半径、遮罩扩展）
     - 实时预览修复效果
     - 查看估算处理时间
   
   - 功能特性：
     - 参数实时调节
     - 处理进度显示
     - 预览图像显示
     - 使用提示

2. **API 集成** (`frontend/src/lib/api.ts`)
   - `performInpaint()`: 调用后端 Inpainting API
   - `getInpaintingMethods()`: 获取可用方法列表

3. **国际化支持** (`frontend/src/i18n/locales/zh-CN.json`)
   - 添加了完整的中文翻译
   - 包括方法说明、参数描述、使用提示等

## 使用方法

### 后端测试

1. 运行测试脚本：
```bash
cd backend
python test_inpainting.py
```

2. 测试脚本会：
   - 创建测试图像和遮罩
   - 测试所有可用的修复方法
   - 保存修复结果
   - 显示处理时间估算

### 前端使用

1. 在画布中选择一个图层
2. 确保图层有对应的遮罩
3. 打开 Inpainting 面板
4. 选择修复方法
5. 调整参数
6. 点击"应用修复"按钮

## API 使用示例

### 使用 curl 测试

```bash
# 执行图像修复
curl -X POST "http://localhost:8000/inpaint?method=telea&radius=5&padding=10" \
  -F "image=@test_image.png" \
  -F "mask=@test_mask.png"

# 获取可用方法
curl http://localhost:8000/inpaint/methods
```

### 使用 Python 测试

```python
import requests

# 执行修复
with open('test_image.png', 'rb') as img, open('test_mask.png', 'rb') as mask:
    files = {
        'image': img,
        'mask': mask
    }
    params = {
        'method': 'telea',
        'radius': 5,
        'padding': 10
    }
    response = requests.post('http://localhost:8000/inpaint', files=files, params=params)
    result = response.json()
    
    if result['success']:
        # 保存结果
        import base64
        from PIL import Image
        from io import BytesIO
        
        image_data = base64.b64decode(result['image'].split(',')[1])
        image = Image.open(BytesIO(image_data))
        image.save('result.png')
```

## 技术细节

### 修复方法对比

| 方法 | 速度 | 质量 | 适用场景 | GPU 需求 |
|------|------|------|----------|----------|
| Telea | 快 | 中 | 小区域修复 | 否 |
| NS | 中 | 中 | 大区域修复 | 否 |
| LaMa | 慢 | 高 | 复杂背景修复 | 推荐 |

### 参数说明

- **radius**: 修复半径，控制修复算法考虑的邻域大小
  - 范围：1-20 像素
  - 推荐值：3-5 像素
  - 值越大，修复范围越广，但可能导致模糊

- **padding**: 遮罩扩展像素数
  - 范围：0-50 像素
  - 推荐值：10 像素
  - 用于扩展遮罩边缘，改善边缘融合效果

### 性能优化

1. **图像尺寸优化**
   - 对于预览，使用缩小的图像尺寸
   - 最终修复使用原始尺寸

2. **批量处理**
   - 支持批量修复多个图像
   - 可以并行处理以提高效率

3. **缓存机制**
   - 缓存修复结果
   - 避免重复计算

## 未来改进

1. **LaMa 模型集成**
   - 集成 lama-cleaner 库
   - 支持 GPU 加速
   - 提供更高质量的修复效果

2. **实时预览**
   - 实现参数调整时的实时预览
   - 使用 WebSocket 进行实时通信

3. **高级功能**
   - 支持多区域修复
   - 支持渐进式修复
   - 支持修复历史记录

4. **性能优化**
   - 使用 CUDA 加速 OpenCV 操作
   - 实现异步处理队列
   - 添加进度回调

## 依赖项

### 后端
- OpenCV (cv2): 图像处理和修复
- PIL (Pillow): 图像读写
- NumPy: 数组操作
- FastAPI: Web 框架

### 前端
- React: UI 框架
- TypeScript: 类型安全
- Tailwind CSS: 样式
- Shadcn UI: UI 组件库

## 故障排除

### 常见问题

1. **修复效果不理想**
   - 尝试不同的修复方法
   - 调整 radius 和 padding 参数
   - 确保遮罩准确

2. **处理速度慢**
   - 使用 Telea 方法（最快）
   - 减小图像尺寸
   - 考虑使用 GPU 加速

3. **API 调用失败**
   - 检查后端服务是否运行
   - 确认图像和遮罩格式正确
   - 查看后端日志获取详细错误信息

## 参考资料

- [OpenCV Inpainting Documentation](https://docs.opencv.org/master/df/d3d/tutorial_py_inpainting.html)
- [LaMa: Resolution-robust Large Mask Inpainting](https://github.com/advimman/lama)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

## 更新日志

### v1.0.0 (2024-12-27)
- ✅ 实现基础 Inpainting 功能
- ✅ 支持 Telea 和 NS 方法
- ✅ 添加前端 UI 组件
- ✅ 添加 API 端点
- ✅ 添加国际化支持
- ✅ 添加测试脚本
- ⏳ LaMa 模型集成（待实现）
- ⏳ 实时预览功能（待实现）

## 贡献者

- AmberPipeline 开发团队

## 许可证

本项目遵循 MIT 许可证。
