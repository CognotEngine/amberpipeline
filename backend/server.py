#!/usr/bin/env python3
"""
AmberPipeline AI - FastAPI Backend Server
封装SAM（Segment Anything Model）和Normal Map相关核心算法逻辑的后端服务
"""

import os
import sys
import logging
import base64
from io import BytesIO
from PIL import Image
import numpy as np

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# 导入现有的模块
from config import Config
from modules.segmentation import SAMSegmenter
from modules.normal_map import NormalMapGenerator
from modules.workflow_manager import WorkflowManager
from modules.inpainting import InpaintingProcessor
from modules.semantic_segmentation import SemanticSegmentation

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backend_server.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 初始化配置
config = Config()

# 延迟加载AI模型，只在需要时初始化
sam_segmenter = None
normal_generator = None
inpainting_processor = None
semantic_segmenter = None
logger.info("AI models will be loaded on demand")

# 初始化工作流管理器
logger.info("Initializing workflow manager...")
workflow_manager = WorkflowManager(config)
logger.info("Workflow manager initialized successfully")

# 创建FastAPI应用
app = FastAPI(
    title="AmberPipeline AI API",
    description="FastAPI backend for SAM segmentation and Normal Map generation",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置为具体的前端URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求模型
class SegmentationRequest(BaseModel):
    image_data: str
    points: list = []
    point_labels: list = []

class NormalMapRequest(BaseModel):
    image_data: str
    strength: float = None

class InpaintingRequest(BaseModel):
    image_data: str
    mask_data: str
    method: str = "telea"
    radius: int = 3
    padding: int = 10

class BatchConfigRequest(BaseModel):
    max_parallel_tasks: int

# 辅助函数
def base64_to_image(base64_str: str) -> Image.Image:
    """
    将Base64字符串转换为PIL Image对象
    
    Args:
        base64_str: Base64编码的图像数据
        
    Returns:
        PIL Image对象
    """
    try:
        # 移除Base64前缀
        if base64_str.startswith('data:image/'):
            base64_str = base64_str.split(',')[1]
        
        # 解码Base64数据
        image_data = base64.b64decode(base64_str)
        
        # 转换为PIL Image
        image = Image.open(BytesIO(image_data))
        
        return image
    except Exception as e:
        logger.error(f"Failed to convert base64 to image: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid image data")

def image_to_base64(image: Image.Image, format: str = 'PNG') -> str:
    """
    将PIL Image对象转换为Base64字符串
    
    Args:
        image: PIL Image对象
        format: 图像格式
        
    Returns:
        Base64编码的图像字符串
    """
    try:
        # 创建字节流
        buffer = BytesIO()
        
        # 保存图像到字节流
        image.save(buffer, format=format)
        
        # 编码为Base64
        base64_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
        
        # 添加前缀
        return f"data:image/{format.lower()};base64,{base64_str}"
    except Exception as e:
        logger.error(f"Failed to convert image to base64: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process image")

# API端点
@app.get("/")
def root():
    """
    根路径，返回API信息
    """
    return {
        "message": "AmberPipeline AI API",
        "version": "1.0.0",
        "endpoints": [
            "/docs",
            "/segment",
            "/generate-normal-map",
            "/inpaint",
            "/inpaint/methods"
        ]
    }

@app.post("/segment")
def segment_image(
    image: UploadFile = File(...),
    points: str = Query(None),
    point_labels: str = Query(None)
):
    """
    执行图像分割（背景移除）
    
    Args:
        image: 上传的图像文件
        points: 点坐标列表，格式："x1,y1;x2,y2;..."
        point_labels: 点标签列表，格式："0,1;1,0;..."
        
    Returns:
        分割后的图像Base64字符串
    """
    try:
        logger.info(f"Received segmentation request for image: {image.filename}")
        
        # 确保SAM模型已加载
        global sam_segmenter
        if sam_segmenter is None:
            logger.info("Loading SAM segmenter model...")
            from modules.segmentation import SAMSegmenter
            sam_segmenter = SAMSegmenter(config)
            logger.info("SAM segmenter model loaded successfully")
        
        # 读取图像文件
        image_data = image.file.read()
        image = Image.open(BytesIO(image_data))
        
        # 保存临时图像用于处理，使用唯一文件名避免冲突
        temp_path = f"temp_segmentation_input_{id(image)}.png"
        image.save(temp_path)
        
        # 处理点坐标
        if points and point_labels:
            # 解析点坐标
            points_list = [tuple(map(int, p.split(','))) for p in points.split(';')]
            # 解析点标签
            labels_list = [tuple(map(int, l.split(','))) for l in point_labels.split(';')]
            
            logger.info(f"Using point prompts: {points_list}, labels: {labels_list}")
            
            # 使用带有点提示的分割
            result = sam_segmenter.segment_with_points(temp_path, points_list, labels_list)
        else:
            # 使用自动分割
            result = sam_segmenter.segment(temp_path)
        
        # 删除临时文件
        os.remove(temp_path)
        
        if result is None:
            raise HTTPException(status_code=500, detail="Segmentation failed")
        
        # 转换为Base64
        result_base64 = image_to_base64(result)
        
        logger.info(f"Segmentation completed successfully for image: {image.filename}")
        
        return {
            "success": True,
            "image": result_base64
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Segmentation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Segmentation failed: {str(e)}")

@app.post("/generate-normal-map")
def generate_normal_map(
    image: UploadFile = File(...),
    strength: float = Query(None)
):
    """
    生成法线贴图
    
    Args:
        image: 上传的图像文件
        strength: 法线强度
        
    Returns:
        生成的法线贴图Base64字符串
    """
    try:
        logger.info(f"Received normal map generation request for image: {image.filename}")
        
        # 确保法线贴图生成器已加载
        global normal_generator
        if normal_generator is None:
            logger.info("Loading Normal Map Generator...")
            from modules.normal_map import NormalMapGenerator
            normal_generator = NormalMapGenerator(config)
            logger.info("Normal Map Generator loaded successfully")
        
        # 读取图像文件
        image_data = image.file.read()
        image = Image.open(BytesIO(image_data))
        
        # 保存临时图像用于处理，使用唯一文件名避免冲突
        temp_path = f"temp_normal_map_input_{id(image)}.png"
        image.save(temp_path)
        
        # 生成法线贴图
        result = normal_generator.generate(temp_path, strength)
        
        # 删除临时文件
        os.remove(temp_path)
        
        if result is None:
            raise HTTPException(status_code=500, detail="Normal map generation failed")
        
        # 转换为Base64
        result_base64 = image_to_base64(result)
        
        logger.info(f"Normal map generated successfully for image: {image.filename}")
        
        return {
            "success": True,
            "image": result_base64
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Normal map generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Normal map generation failed: {str(e)}")

@app.post("/inpaint")
def inpaint_image(
    image: UploadFile = File(...),
    mask: UploadFile = File(...),
    method: str = Query("telea", description="Inpainting method: telea, ns, or lama"),
    radius: int = Query(3, description="Inpainting radius (for OpenCV methods)"),
    padding: int = Query(10, description="Mask padding in pixels")
):
    """
    执行图像修复（Inpainting）
    
    Args:
        image: 上传的原始图像文件
        mask: 上传的遮罩图像文件（白色区域将被修复）
        method: 修复方法 (telea, ns, lama)
        radius: 修复半径（仅用于 OpenCV 方法）
        padding: 遮罩扩展像素数
        
    Returns:
        修复后的图像Base64字符串
    """
    try:
        logger.info(f"Received inpainting request for image: {image.filename}, mask: {mask.filename}")
        
        # 确保 Inpainting 处理器已加载
        global inpainting_processor
        if inpainting_processor is None:
            logger.info("Loading Inpainting Processor...")
            from modules.inpainting import InpaintingProcessor
            inpainting_processor = InpaintingProcessor(config, use_lama=False)
            logger.info("Inpainting Processor loaded successfully")
        
        # 读取图像文件
        image_data = image.file.read()
        image_pil = Image.open(BytesIO(image_data))
        
        # 读取遮罩文件
        mask_data = mask.file.read()
        mask_pil = Image.open(BytesIO(mask_data))
        
        # 保存临时文件
        temp_image_path = f"temp_inpaint_image_{id(image_pil)}.png"
        temp_mask_path = f"temp_inpaint_mask_{id(mask_pil)}.png"
        
        image_pil.save(temp_image_path)
        mask_pil.save(temp_mask_path)
        
        # 执行修复
        result = inpainting_processor.inpaint(
            temp_image_path, 
            temp_mask_path, 
            method=method,
            radius=radius,
            padding=padding
        )
        
        # 删除临时文件
        os.remove(temp_image_path)
        os.remove(temp_mask_path)
        
        if result is None:
            raise HTTPException(status_code=500, detail="Inpainting failed")
        
        # 转换为Base64
        result_base64 = image_to_base64(result)
        
        logger.info(f"Inpainting completed successfully using {method} method")
        
        return {
            "success": True,
            "image": result_base64,
            "method": method,
            "radius": radius,
            "padding": padding
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Inpainting error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Inpainting failed: {str(e)}")

@app.get("/inpaint/methods")
def get_inpainting_methods():
    """
    获取可用的 Inpainting 方法列表
    
    Returns:
        可用方法列表
    """
    try:
        # 确保 Inpainting 处理器已加载
        global inpainting_processor
        if inpainting_processor is None:
            from modules.inpainting import InpaintingProcessor
            inpainting_processor = InpaintingProcessor(config, use_lama=False)
        
        methods = inpainting_processor.get_available_methods()
        
        return {
            "success": True,
            "methods": methods,
            "descriptions": {
                "telea": "Fast Marching Method (Telea) - Fast and good for small areas",
                "ns": "Navier-Stokes Method - Better for larger areas but slower",
                "lama": "LaMa Model - Best quality but requires GPU (if available)"
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get inpainting methods: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get methods: {str(e)}")

# 语义分割 API 端点
@app.post("/semantic/edge-snap")
def edge_snap(
    image: UploadFile = File(...),
    points: str = Query(...),
    labels: str = Query(...)
):
    """
    执行边缘自动吸附
    
    Args:
        image: 上传的图像文件
        points: 点坐标列表，格式："x1,y1;x2,y2;..."
        labels: 点标签列表，格式："foreground,background;..."
        
    Returns:
        吸附后的边缘点列表
    """
    try:
        logger.info(f"Received edge snap request for image: {image.filename}")
        
        # 确保语义分割模型已加载
        global semantic_segmenter
        if semantic_segmenter is None:
            logger.info("Loading Semantic Segmentation model...")
            semantic_segmenter = SemanticSegmentation(config)
            logger.info("Semantic Segmentation model loaded successfully")
        
        # 读取图像文件
        image_data = image.file.read()
        temp_path = f"temp_edge_snap_input_{id(image)}.png"
        with open(temp_path, "wb") as f:
            f.write(image_data)
        
        # 解析点坐标
        points_list = []
        for point in points.split(';'):
            x, y = point.split(',')
            points_list.append({'x': float(x), 'y': float(y)})
        
        # 解析标签
        label = labels.split(';')[0] if labels else 'foreground'
        
        # 执行边缘吸附
        result = semantic_segmenter.perform_edge_snap(temp_path, points_list, label)
        
        # 删除临时文件
        os.remove(temp_path)
        
        return result
        
    except Exception as e:
        logger.error(f"Edge snap error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Edge snap failed: {str(e)}")

@app.post("/semantic/joint-expansion")
def joint_expansion(
    image: UploadFile = File(...),
    bbox: str = Query(...),
    label: str = Query("foreground")
):
    """
    执行关节补全
    
    Args:
        image: 上传的图像文件
        bbox: 边界框，格式："x,y,width,height"
        label: 标签类型 ('foreground' or 'background')
        
    Returns:
        补全后的遮罩图像
    """
    try:
        logger.info(f"Received joint expansion request for image: {image.filename}")
        
        # 确保语义分割模型已加载
        global semantic_segmenter
        if semantic_segmenter is None:
            logger.info("Loading Semantic Segmentation model...")
            semantic_segmenter = SemanticSegmentation(config)
            logger.info("Semantic Segmentation model loaded successfully")
        
        # 读取图像文件
        image_data = image.file.read()
        temp_path = f"temp_joint_expansion_input_{id(image)}.png"
        with open(temp_path, "wb") as f:
            f.write(image_data)
        
        # 解析边界框
        x, y, width, height = map(float, bbox.split(','))
        bbox_dict = {
            'x': x,
            'y': y,
            'width': width,
            'height': height
        }
        
        # 执行关节补全
        result = semantic_segmenter.perform_joint_expansion(temp_path, bbox_dict, label)
        
        # 删除临时文件
        os.remove(temp_path)
        
        if result['success'] and result.get('expandedMask'):
            # 读取遮罩图像并转换为Base64
            with open(result['expandedMask'], 'rb') as f:
                mask_data = f.read()
            mask_base64 = base64.b64encode(mask_data).decode('utf-8')
            result['expandedMaskBase64'] = f"data:image/png;base64,{mask_base64}"
            
            # 删除临时遮罩文件
            os.remove(result['expandedMask'])
            del result['expandedMask']
        
        return result
        
    except Exception as e:
        logger.error(f"Joint expansion error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Joint expansion failed: {str(e)}")

@app.post("/semantic/apply-preset")
def apply_preset(
    image: UploadFile = File(...),
    preset_id: str = Query(...)
):
    """
    应用部位预设
    
    Args:
        image: 上传的图像文件
        preset_id: 预设ID ('human' or 'quadruped')
        
    Returns:
        生成的部位列表和遮罩
    """
    try:
        logger.info(f"Received apply preset request for image: {image.filename}, preset: {preset_id}")
        
        # 确保语义分割模型已加载
        global semantic_segmenter
        if semantic_segmenter is None:
            logger.info("Loading Semantic Segmentation model...")
            semantic_segmenter = SemanticSegmentation(config)
            logger.info("Semantic Segmentation model loaded successfully")
        
        # 读取图像文件
        image_data = image.file.read()
        temp_path = f"temp_apply_preset_input_{id(image)}.png"
        with open(temp_path, "wb") as f:
            f.write(image_data)
        
        # 应用部位预设
        result = semantic_segmenter.apply_part_preset(temp_path, preset_id)
        
        # 删除临时文件
        os.remove(temp_path)
        
        if result['success'] and result.get('parts'):
            # 转换每个部位的遮罩为Base64
            for part in result['parts']:
                with open(part['mask'], 'rb') as f:
                    mask_data = f.read()
                mask_base64 = base64.b64encode(mask_data).decode('utf-8')
                part['maskBase64'] = f"data:image/png;base64,{mask_base64}"
                
                # 删除临时遮罩文件
                os.remove(part['mask'])
                del part['mask']
        
        return result
        
    except Exception as e:
        logger.error(f"Apply preset error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Apply preset failed: {str(e)}")

@app.post("/semantic/process-brush")
def process_brush(
    image: UploadFile = File(...),
    strokes: str = Query(...)
):
    """
    处理语义涂抹
    
    Args:
        image: 上传的图像文件
        strokes: 笔触列表，JSON格式
        
    Returns:
        生成的语义遮罩
    """
    try:
        logger.info(f"Received process brush request for image: {image.filename}")
        
        # 确保语义分割模型已加载
        global semantic_segmenter
        if semantic_segmenter is None:
            logger.info("Loading Semantic Segmentation model...")
            semantic_segmenter = SemanticSegmentation(config)
            logger.info("Semantic Segmentation model loaded successfully")
        
        # 读取图像文件
        image_data = image.file.read()
        temp_path = f"temp_process_brush_input_{id(image)}.png"
        with open(temp_path, "wb") as f:
            f.write(image_data)
        
        # 解析笔触数据
        import json
        strokes_list = json.loads(strokes)
        
        # 处理语义涂抹
        result = semantic_segmenter.process_semantic_brush(temp_path, strokes_list)
        
        # 删除临时文件
        os.remove(temp_path)
        
        if result['success'] and result.get('semanticMask'):
            # 读取遮罩图像并转换为Base64
            with open(result['semanticMask'], 'rb') as f:
                mask_data = f.read()
            mask_base64 = base64.b64encode(mask_data).decode('utf-8')
            result['semanticMaskBase64'] = f"data:image/png;base64,{mask_base64}"
            
            # 删除临时遮罩文件
            os.remove(result['semanticMask'])
            del result['semanticMask']
        
        return result
        
    except Exception as e:
        logger.error(f"Process brush error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Process brush failed: {str(e)}")

# 工作流相关API端点
@app.post("/workflow/start")
def start_workflow():
    """
    启动自动工作流监控
    
    Returns:
        工作流启动状态
    """
    try:
        workflow_manager.start_monitoring()
        return {
            "success": True,
            "message": "Workflow monitoring started successfully"
        }
    except Exception as e:
        logger.error(f"Failed to start workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to start workflow: {str(e)}")

@app.post("/workflow/stop")
def stop_workflow():
    """
    停止自动工作流监控
    
    Returns:
        工作流停止状态
    """
    try:
        workflow_manager.stop_monitoring()
        return {
            "success": True,
            "message": "Workflow monitoring stopped successfully"
        }
    except Exception as e:
        logger.error(f"Failed to stop workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to stop workflow: {str(e)}")

@app.get("/workflow/status")
def get_workflow_status():
    """
    获取自动工作流状态
    
    Returns:
        工作流当前状态信息
    """
    try:
        status = workflow_manager.get_workflow_status()
        return {
            "success": True,
            "status": status
        }
    except Exception as e:
        logger.error(f"Failed to get workflow status: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get workflow status: {str(e)}")

@app.post("/workflow/process-file/{filename}")
def process_file(filename: str):
    """
    手动处理单个文件
    
    Args:
        filename: 要处理的文件名
        
    Returns:
        文件处理结果
    """
    try:
        result = workflow_manager.process_file(filename)
        return {
            "success": True,
            "result": result
        }
    except Exception as e:
        logger.error(f"Failed to process file {filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

@app.post("/workflow/clear-history")
def clear_workflow_history():
    """
    清除工作流处理历史
    
    Returns:
        历史清除状态
    """
    try:
        workflow_manager.clear_processed_files()
        workflow_manager.clear_failed_files()
        return {
            "success": True,
            "message": "Workflow history cleared successfully"
        }
    except Exception as e:
        logger.error(f"Failed to clear workflow history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to clear workflow history: {str(e)}")

@app.post("/workflow/generate-metadata")
def generate_metadata():
    """
    生成资源元数据文件
    
    Returns:
        元数据生成状态
    """
    try:
        result = workflow_manager.generate_metadata()
        if result["success"]:
            return {
                "success": True,
                "message": "Metadata generated successfully",
                "metadata": result
            }
        else:
            raise HTTPException(status_code=500, detail=result["message"])
    except Exception as e:
        logger.error(f"Failed to generate metadata: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate metadata: {str(e)}")

@app.get("/workflow/get-batch-config")
def get_batch_config():
    """
    获取当前批量处理配置
    
    Returns:
        当前批量配置信息
    """
    try:
        return {
            "success": True,
            "config": {
                "max_parallel_tasks": workflow_manager.max_parallel_tasks,
                "current_running_tasks": workflow_manager.current_running_tasks
            }
        }
    except Exception as e:
        logger.error(f"Failed to get batch configuration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get batch configuration: {str(e)}")

@app.post("/workflow/set-batch-config")
def set_batch_config(config: BatchConfigRequest):
    """
    设置批量处理配置
    
    Args:
        config: 批量配置信息，包含最大并行任务数
        
    Returns:
        配置更新状态
    """
    try:
        result = workflow_manager.set_batch_config(config.max_parallel_tasks)
        if result["success"]:
            return {
                "success": True,
                "message": "Batch configuration updated successfully",
                "batch_config": result
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
    except Exception as e:
        logger.error(f"Failed to set batch configuration: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to set batch configuration: {str(e)}")

# 启动服务器
if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting AmberPipeline AI backend server...")
    logger.info(f"Server will be running at http://localhost:8000")
    
    uvicorn.run(
        "server:app",
        host="localhost",
        port=8000,
        reload=False,  # 生产环境中设置为False
        log_level="info"
    )
