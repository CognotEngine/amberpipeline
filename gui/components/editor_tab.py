#!/usr/bin/env python3
"""
AmberPipeline AI - 交互式编辑标签页
专注于需要SAM交互的精细化处理
包含顶部工具栏、左侧步骤面板、中央双窗口对比视图和右侧参数面板
"""

import os
import sys
import logging
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QGroupBox,
    QCheckBox, QSlider, QScrollArea, QSplitter, QAction, QActionGroup,
    QFrame, QFileDialog, QSizePolicy, QGridLayout
)
from PyQt5.QtCore import Qt, QThread, pyqtSignal, QSize
from PyQt5.QtGui import QIcon, QPixmap, QCursor

# 添加项目根目录到系统路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(project_root)

# 导入核心模块
from config import Config
# 延迟导入：仅在需要时加载SAM和NormalMap模块，避免启动时加载PyTorch DLL
SAMSegmentation = None
NormalMapGenerator = None

class EditorTab(QWidget):
    """交互式编辑标签页"""
    
    def __init__(self, config, parent=None):
        super().__init__(parent)
        self.config = config
        self.parent = parent
        self.sam_model = None
        self.loading_sam = False
        
        # 当前图像
        self.original_image = None
        self.processed_image = None
        
        # 初始化UI
        self.init_ui()
        self.setup_logging()
    
    def init_ui(self):
        """初始化用户界面"""
        # 主布局
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(10, 10, 10, 10)
        main_layout.setSpacing(10)
        
        # ------------------------------
        # 顶部工具栏
        # ------------------------------
        self.create_toolbar(main_layout)
        
        # ------------------------------
        # 中央区域 - 双窗口对比视图
        # ------------------------------
        self.create_central_viewport(main_layout)
        
        # ------------------------------
        # 左侧步骤面板
        # ------------------------------
        self.create_left_panel()
        
        # ------------------------------
        # 右侧参数面板
        # ------------------------------
        self.create_right_panel()
        
        # ------------------------------
        # 连接信号槽
        # ------------------------------
        self.connect_signals()
    
    def create_toolbar(self, parent_layout):
        """创建顶部工具栏"""
        self.toolbar = QToolBar("编辑工具")
        self.toolbar.setObjectName("editorToolbar")
        self.toolbar.setIconSize(QSize(24, 24))
        
        # 文件操作
        open_action = QAction("打开", self)
        open_action.setObjectName("openAction")
        open_action.setShortcut("Ctrl+O")
        open_action.triggered.connect(self.open_image)
        self.toolbar.addAction(open_action)
        
        self.toolbar.addSeparator()
        
        # 工具切换
        self.tool_group = QActionGroup(self.toolbar)
        
        # 画笔工具
        brush_action = QAction("画笔", self)
        brush_action.setObjectName("brushAction")
        brush_action.setCheckable(True)
        brush_action.setChecked(True)
        self.tool_group.addAction(brush_action)
        self.toolbar.addAction(brush_action)
        
        # 矩形工具
        rect_action = QAction("矩形", self)
        rect_action.setObjectName("rectAction")
        rect_action.setCheckable(True)
        self.tool_group.addAction(rect_action)
        self.toolbar.addAction(rect_action)
        
        # 移动工具
        move_action = QAction("移动", self)
        move_action.setObjectName("moveAction")
        move_action.setCheckable(True)
        self.tool_group.addAction(move_action)
        self.toolbar.addAction(move_action)
        
        # 缩放工具
        zoom_action = QAction("缩放", self)
        zoom_action.setObjectName("zoomAction")
        zoom_action.setCheckable(True)
        self.tool_group.addAction(zoom_action)
        self.toolbar.addAction(zoom_action)
        
        self.toolbar.addSeparator()
        
        # 撤销/重做
        undo_action = QAction("撤销", self)
        undo_action.setObjectName("undoAction")
        undo_action.setShortcut("Ctrl+Z")
        self.toolbar.addAction(undo_action)
        
        redo_action = QAction("重做", self)
        redo_action.setObjectName("redoAction")
        redo_action.setShortcut("Ctrl+Y")
        self.toolbar.addAction(redo_action)
        
        self.toolbar.addSeparator()
        
        # SAM加载状态
        self.sam_status_label = QLabel("SAM模型: 未加载")
        self.sam_status_label.setObjectName("samStatusLabel")
        self.toolbar.addWidget(self.sam_status_label)
        
        parent_layout.addWidget(self.toolbar)
    
    def create_central_viewport(self, parent_layout):
        """创建中央双窗口对比视图"""
        self.central_viewport = QWidget()
        central_layout = QHBoxLayout(self.central_viewport)
        central_layout.setContentsMargins(0, 0, 0, 0)
        central_layout.setSpacing(10)
        
        # 分割器
        splitter = QSplitter(Qt.Horizontal)
        splitter.setObjectName("imageSplitter")
        
        # 左侧原图窗口
        self.original_window = QFrame()
        self.original_window.setObjectName("originalImageView")
        self.original_window.setMinimumSize(400, 400)
        original_layout = QVBoxLayout(self.original_window)
        original_layout.setContentsMargins(10, 10, 10, 10)
        
        # 原图标题
        original_title = QLabel("原图")
        original_title.setObjectName("imageViewTitle")
        original_title.setAlignment(Qt.AlignCenter)
        original_layout.addWidget(original_title)
        
        # 原图显示区域
        self.original_image_label = QLabel("未加载图像")
        self.original_image_label.setObjectName("originalImageLabel")
        self.original_image_label.setAlignment(Qt.AlignCenter)
        self.original_image_label.setMinimumSize(380, 380)
        self.original_image_label.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.original_image_label.setStyleSheet("border: 1px solid #444;")
        original_layout.addWidget(self.original_image_label)
        
        # 右侧预览窗口
        self.preview_window = QFrame()
        self.preview_window.setObjectName("previewImageView")
        self.preview_window.setMinimumSize(400, 400)
        preview_layout = QVBoxLayout(self.preview_window)
        preview_layout.setContentsMargins(10, 10, 10, 10)
        
        # 预览标题
        preview_title = QLabel("实时预览")
        preview_title.setObjectName("imageViewTitle")
        preview_title.setAlignment(Qt.AlignCenter)
        preview_layout.addWidget(preview_title)
        
        # 预览显示区域
        self.preview_image_label = QLabel("未加载图像")
        self.preview_image_label.setObjectName("previewImageLabel")
        self.preview_image_label.setAlignment(Qt.AlignCenter)
        self.preview_image_label.setMinimumSize(380, 380)
        self.preview_image_label.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.preview_image_label.setStyleSheet("border: 1px solid #444;")
        preview_layout.addWidget(self.preview_image_label)
        
        # 添加到分割器
        splitter.addWidget(self.original_window)
        splitter.addWidget(self.preview_window)
        
        # 设置初始比例
        splitter.setSizes([500, 500])
        
        central_layout.addWidget(splitter)
        parent_layout.addWidget(self.central_viewport, 1)
    
    def create_left_panel(self):
        """创建左侧步骤面板"""
        self.left_panel = QWidget()
        left_layout = QVBoxLayout(self.left_panel)
        left_layout.setContentsMargins(10, 10, 10, 10)
        left_layout.setSpacing(10)
        
        # 标题
        title_label = QLabel("处理步骤")
        title_label.setObjectName("sectionTitle")
        left_layout.addWidget(title_label)
        
        # 处理步骤复选框组
        self.steps_group = QGroupBox("可用步骤")
        steps_layout = QVBoxLayout(self.steps_group)
        steps_layout.setSpacing(8)
        
        # 步骤列表
        self.step_checkboxes = {}
        steps = [
            "Generate Normal Map",
            "Generate Shadow",
            "Align Elements",
            "Adjust Contrast",
            "Apply Blur",
            "Sharpen Edges"
        ]
        
        for step in steps:
            checkbox = QCheckBox(step)
            checkbox.setObjectName("stepCheckbox")
            checkbox.setChecked(False)
            self.step_checkboxes[step] = checkbox
            steps_layout.addWidget(checkbox)
        
        steps_layout.addStretch()
        
        # 运行按钮
        self.run_button = QPushButton("运行处理")
        self.run_button.setObjectName("runProcessButton")
        self.run_button.setStyleSheet("background-color: #4CAF50; color: white; font-weight: bold;")
        steps_layout.addWidget(self.run_button)
        
        left_layout.addWidget(self.steps_group)
        left_layout.addStretch()
    
    def create_right_panel(self):
        """创建右侧参数面板"""
        self.right_panel = QWidget()
        self.right_panel.setObjectName("editorRightPanel")
        right_layout = QVBoxLayout(self.right_panel)
        right_layout.setContentsMargins(10, 10, 10, 10)
        right_layout.setSpacing(15)
        
        # 标题
        title_label = QLabel("参数调整")
        title_label.setObjectName("sectionTitle")
        right_layout.addWidget(title_label)
        
        # ------------------------------
        # 法线贴图参数
        # ------------------------------
        normal_group = QGroupBox("法线贴图参数")
        normal_layout = QVBoxLayout(normal_group)
        normal_layout.setSpacing(10)
        
        # 法线强度
        self.normal_strength_slider = self.create_slider(0, 100, 50, "法线强度")
        normal_layout.addWidget(self.normal_strength_slider)
        
        # 采样精度
        self.normal_precision_slider = self.create_slider(1, 10, 5, "采样精度")
        normal_layout.addWidget(self.normal_precision_slider)
        
        right_layout.addWidget(normal_group)
        
        # ------------------------------
        # 阴影参数
        # ------------------------------
        shadow_group = QGroupBox("阴影参数")
        shadow_layout = QVBoxLayout(shadow_group)
        shadow_layout.setSpacing(10)
        
        # 阴影偏移X
        self.shadow_offset_x_slider = self.create_slider(-50, 50, 5, "阴影偏移X")
        shadow_layout.addWidget(self.shadow_offset_x_slider)
        
        # 阴影偏移Y
        self.shadow_offset_y_slider = self.create_slider(-50, 50, 5, "阴影偏移Y")
        shadow_layout.addWidget(self.shadow_offset_y_slider)
        
        # 阴影模糊
        self.shadow_blur_slider = self.create_slider(0, 20, 5, "阴影模糊")
        shadow_layout.addWidget(self.shadow_blur_slider)
        
        right_layout.addWidget(shadow_group)
        
        # ------------------------------
        # LOD设置
        # ------------------------------
        lod_group = QGroupBox("LOD设置")
        lod_layout = QVBoxLayout(lod_group)
        lod_layout.setSpacing(10)
        
        # LOD级别
        self.lod_level_slider = self.create_slider(0, 5, 0, "LOD级别")
        lod_layout.addWidget(self.lod_level_slider)
        
        right_layout.addWidget(lod_group)
        
        # ------------------------------
        # SAM模型设置
        # ------------------------------
        sam_group = QGroupBox("SAM模型设置")
        sam_layout = QVBoxLayout(sam_group)
        sam_layout.setSpacing(10)
        
        # 加载模型按钮
        self.load_sam_button = QPushButton("加载SAM模型")
        self.load_sam_button.setObjectName("loadSamButton")
        self.load_sam_button.clicked.connect(self.load_sam_model)
        sam_layout.addWidget(self.load_sam_button)
        
        # 模型路径
        self.sam_model_label = QLabel(f"模型路径: {os.path.basename(self.config.sam_model_path)}")
        self.sam_model_label.setObjectName("samModelLabel")
        self.sam_model_label.setWordWrap(True)
        sam_layout.addWidget(self.sam_model_label)
        
        right_layout.addWidget(sam_group)
        
        right_layout.addStretch()
    
    def create_slider(self, min_val, max_val, default_val, label_text):
        """创建带标签的滑块控件"""
        container = QWidget()
        layout = QVBoxLayout(container)
        layout.setSpacing(5)
        
        # 标签
        label = QLabel(f"{label_text}: {default_val}")
        label.setObjectName("sliderLabel")
        layout.addWidget(label)
        
        # 滑块
        slider = QSlider(Qt.Horizontal)
        slider.setObjectName("parameterSlider")
        slider.setMinimum(min_val)
        slider.setMaximum(max_val)
        slider.setValue(default_val)
        slider.setTickPosition(QSlider.TicksBelow)
        slider.setTickInterval(10)
        
        # 连接信号
        def update_label(value):
            label.setText(f"{label_text}: {value}")
        
        slider.valueChanged.connect(update_label)
        
        layout.addWidget(slider)
        
        return container
    
    def get_right_panel(self):
        """获取右侧面板"""
        return self.right_panel
    
    def open_image(self):
        """打开图像文件"""
        file_path, _ = QFileDialog.getOpenFileName(
            self, "打开图像文件", "", "图像文件 (*.png *.jpg *.jpeg *.bmp)")
        
        if file_path:
            logging.info("打开图像文件: %s", file_path)
            self.load_image(file_path)
    
    def load_image(self, file_path):
        """加载图像"""
        try:
            self.original_image = QPixmap(file_path)
            self.processed_image = self.original_image.copy()
            
            # 更新图像显示
            self.update_image_display()
            
            logging.info("成功加载图像: %s", os.path.basename(file_path))
        except Exception as e:
            logging.error(f"加载图像失败: {str(e)}")
    
    def update_image_display(self):
        """更新图像显示"""
        if self.original_image:
            # 缩放图像以适应窗口
            original_scaled = self.original_image.scaled(
                self.original_image_label.size(), 
                Qt.KeepAspectRatio, 
                Qt.SmoothTransformation
            )
            
            processed_scaled = self.processed_image.scaled(
                self.preview_image_label.size(), 
                Qt.KeepAspectRatio, 
                Qt.SmoothTransformation
            )
            
            self.original_image_label.setPixmap(original_scaled)
            self.preview_image_label.setPixmap(processed_scaled)
            
            # 更新标签文本
            self.original_image_label.setText("")
            self.preview_image_label.setText("")
    
    def load_sam_model(self):
        """加载SAM模型"""
        if self.loading_sam:
            return
        
        self.loading_sam = True
        self.load_sam_button.setText("正在加载SAM模型...")
        self.load_sam_button.setEnabled(False)
        
        # 在后台线程加载模型
        self.sam_loader_thread = SAMLoaderThread(self.config.sam_model_path)
        self.sam_loader_thread.finished.connect(self.on_sam_loaded)
        self.sam_loader_thread.start()
    
    def on_sam_loaded(self, success, model, error=None):
        """当SAM模型加载完成时的处理"""
        self.loading_sam = False
        self.load_sam_button.setEnabled(True)
        
        if success:
            self.sam_model = model
            self.load_sam_button.setText("SAM模型已加载")
            self.sam_status_label.setText("SAM模型: 已加载")
            logging.info("SAM模型加载成功")
        else:
            self.load_sam_button.setText("加载SAM模型")
            self.sam_status_label.setText("SAM模型: 加载失败")
            logging.error("SAM模型加载失败: %s", error)
    
    def connect_signals(self):
        """连接信号槽"""
        # 窗口大小变化时更新图像
        self.original_image_label.resizeEvent = lambda event: self.update_image_display()
        self.preview_image_label.resizeEvent = lambda event: self.update_image_display()
        
        # 步骤复选框连接
        for step, checkbox in self.step_checkboxes.items():
            checkbox.toggled.connect(lambda checked, step=step: self.on_step_toggled(step, checked))
        
        # 运行按钮连接
        self.run_button.clicked.connect(self.run_processing)
    
    def on_step_toggled(self, step, checked):
        """当步骤复选框状态改变时的处理"""
        logging.info("步骤 %s %s", step, '已启用' if checked else '已禁用')
    
    def run_processing(self):
        """运行选中的处理步骤"""
        selected_steps = [step for step, checkbox in self.step_checkboxes.items() if checkbox.isChecked()]
        
        if not selected_steps:
            logging.info("未选择任何处理步骤")
            return
        
        logging.info("开始运行处理步骤: %s", selected_steps)
        
        try:
            # 根据需要动态导入处理模块
            global NormalMapGenerator, SAMSegmentation
            if "Generate Normal Map" in selected_steps and NormalMapGenerator is None:
                from modules.normal_map import NormalMapGenerator
            if any(step in selected_steps for step in ["Align Elements", "Adjust Contrast"]):
                if SAMSegmentation is None:
                    from modules.segmentation import SAMSegmentation
                    
            # 在这里实现实际的处理逻辑
            # 这将涉及到调用相应的处理模块
            
            logging.info("处理模块导入完成")
        except Exception as e:
            logging.error("处理模块导入失败: %s", str(e))
            return
        
        # 模拟处理完成
        QTimer.singleShot(2000, lambda: logging.info("处理完成"))
    
    def setup_logging(self):
        """配置日志系统"""
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        
        # 添加控制台处理器
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        
        if not self.logger.hasHandlers():
            self.logger.addHandler(handler)

class SAMLoaderThread(QThread):
    """SAM模型加载线程"""
    finished = pyqtSignal(bool, object, str)
    
    def __init__(self, model_path):
        super().__init__()
        self.model_path = model_path
    
    def run(self):
        """运行线程"""
        try:
            # 动态导入SAMSegmentation模块
            global SAMSegmentation
            if SAMSegmentation is None:
                from modules.segmentation import SAMSegmentation
            # 加载SAM模型
            sam_model = SAMSegmentation(self.model_path)
            self.finished.emit(True, sam_model, None)
        except Exception as e:
            self.finished.emit(False, None, str(e))
