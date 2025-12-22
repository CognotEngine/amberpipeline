#!/usr/bin/env python3
"""
AmberPipeline AI - 批处理与导出标签页
用于元数据管理和二进制导出操作
包含中央文件浏览器和右侧导出设置
"""

import os
import sys
import logging
from PyQt5.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QGroupBox,
    QListWidget, QListWidgetItem, QGridLayout, QFrame, QSplitter,
    QCheckBox, QLineEdit, QSizePolicy, QTreeWidget, QTreeWidgetItem,
    QScrollArea, QFileDialog, QComboBox, QProgressBar
)
from PyQt5.QtCore import Qt, QThread, pyqtSignal, QSize
from PyQt5.QtGui import QColor, QPixmap, QPalette

# 添加项目根目录到系统路径
project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(project_root)

# 导入核心模块
from config import Config

class ResourceItemWidget(QWidget):
    """资源项小部件"""
    
    def __init__(self, file_path, parent=None):
        super().__init__(parent)
        self.file_path = file_path
        self.file_name = os.path.basename(file_path)
        self.init_ui()
    
    def init_ui(self):
        """初始化资源项UI"""
        layout = QHBoxLayout(self)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setSpacing(10)
        
        # 设置小部件样式
        self.setObjectName("resourceItem")
        self.setMinimumHeight(80)
        self.setMaximumHeight(100)
        
        # 缩略图
        self.thumbnail_label = QLabel()
        self.thumbnail_label.setObjectName("resourceThumbnail")
        self.thumbnail_label.setMinimumSize(60, 60)
        self.thumbnail_label.setMaximumSize(60, 60)
        self.thumbnail_label.setStyleSheet("border: 1px solid #444;")
        
        # 加载缩略图
        self.load_thumbnail()
        
        # 文件名和信息
        info_layout = QVBoxLayout()
        info_layout.setContentsMargins(0, 0, 0, 0)
        info_layout.setSpacing(5)
        
        # 文件名
        self.file_name_label = QLabel(self.file_name)
        self.file_name_label.setObjectName("resourceFileName")
        self.file_name_label.setWordWrap(True)
        self.file_name_label.setMaximumHeight(30)
        
        # 文件信息
        self.file_info_label = QLabel(f"{self.get_file_size()} | {self.get_file_type()}")
        self.file_info_label.setObjectName("resourceFileInfo")
        self.file_info_label.setMaximumHeight(20)
        
        # 命名规范检查状态
        self.naming_status_label = QLabel("正在检查命名规范...")
        self.naming_status_label.setObjectName("namingStatusLabel")
        self.naming_status_label.setMaximumHeight(20)
        
        # 检查命名规范
        self.check_naming_convention()
        
        info_layout.addWidget(self.file_name_label)
        info_layout.addWidget(self.file_info_label)
        info_layout.addWidget(self.naming_status_label)
        
        # 选择复选框
        self.checkbox = QCheckBox()
        self.checkbox.setObjectName("resourceCheckbox")
        
        layout.addWidget(self.checkbox)
        layout.addWidget(self.thumbnail_label)
        layout.addLayout(info_layout, 1)
    
    def load_thumbnail(self):
        """加载缩略图"""
        try:
            # 尝试加载图像作为缩略图
            pixmap = QPixmap(self.file_path)
            if not pixmap.isNull():
                scaled_pixmap = pixmap.scaled(60, 60, Qt.KeepAspectRatio, Qt.SmoothTransformation)
                self.thumbnail_label.setPixmap(scaled_pixmap)
            else:
                # 如果不是图像文件，显示默认缩略图
                self.thumbnail_label.setText("文件")
        except Exception as e:
            # 如果加载失败，显示默认缩略图
            self.thumbnail_label.setText("文件")
    
    def get_file_size(self):
        """获取文件大小"""
        try:
            size = os.path.getsize(self.file_path)
            if size < 1024:
                return f"{size} B"
            elif size < 1024 * 1024:
                return f"{size / 1024:.1f} KB"
            else:
                return f"{size / (1024 * 1024):.1f} MB"
        except:
            return "未知大小"
    
    def get_file_type(self):
        """获取文件类型"""
        _, ext = os.path.splitext(self.file_path)
        return ext.lower()[1:] if ext else "未知类型"
    
    def check_naming_convention(self):
        """检查命名规范"""
        # 命名规范：[AssetType]_[Name]_[Variant]_[Workflow]
        try:
            parts = self.file_name.split("_")
            if len(parts) >= 4:
                asset_type, name, variant, workflow = parts[:4]
                
                # 检查各部分是否符合规范
                if asset_type and name and variant and workflow:
                    self.naming_status_label.setText("命名规范: 符合要求")
                    self.naming_status_label.setStyleSheet("color: #4CAF50;")
                    return True
            
            # 不符合规范
            self.naming_status_label.setText("命名规范: 不符合要求")
            self.naming_status_label.setStyleSheet("color: #f44336;")
            return False
        except Exception as e:
            self.naming_status_label.setText("命名规范: 检查失败")
            self.naming_status_label.setStyleSheet("color: #ff9800;")
            return False

class ExportTab(QWidget):
    """批处理与导出标签页"""
    
    def __init__(self, config, parent=None):
        super().__init__(parent)
        self.config = config
        self.parent = parent
        self.selected_resources = []
        self.init_ui()
        self.setup_logging()
    
    def init_ui(self):
        """初始化用户界面"""
        # 主布局
        main_layout = QVBoxLayout(self)
        main_layout.setContentsMargins(10, 10, 10, 10)
        main_layout.setSpacing(10)
        
        # ------------------------------
        # 中央区域 - 文件浏览器
        # ------------------------------
        self.central_view = QWidget()
        central_layout = QVBoxLayout(self.central_view)
        central_layout.setContentsMargins(0, 0, 0, 0)
        central_layout.setSpacing(10)
        
        # 标题
        title_label = QLabel("资源管理与打包")
        title_label.setObjectName("sectionTitle")
        central_layout.addWidget(title_label)
        
        # 文件浏览器
        self.file_browser = QListWidget()
        self.file_browser.setObjectName("resourceList")
        self.file_browser.setSpacing(10)
        self.file_browser.setWrapping(False)
        self.file_browser.setFlow(QListWidget.TopToBottom)
        self.file_browser.setResizeMode(QListWidget.Adjust)
        self.file_browser.setUniformItemSizes(True)
        
        # 添加滚动区域
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setObjectName("resourceScrollArea")
        scroll_area.setWidget(self.file_browser)
        
        central_layout.addWidget(scroll_area, 1)
        
        # 添加到主布局
        main_layout.addWidget(self.central_view, 1)
        
        # 创建右侧面板
        self.create_right_panel()
        
        # 加载资源文件
        self.load_resources()
    
    def create_right_panel(self):
        """创建右侧导出设置面板"""
        self.right_panel = QWidget()
        self.right_panel.setObjectName("exportRightPanel")
        right_layout = QVBoxLayout(self.right_panel)
        right_layout.setContentsMargins(10, 10, 10, 10)
        right_layout.setSpacing(15)
        
        # 标题
        title_label = QLabel("导出设置")
        title_label.setObjectName("sectionTitle")
        right_layout.addWidget(title_label)
        
        # ------------------------------
        # 命名规范检查器
        # ------------------------------
        naming_group = QGroupBox("命名规范检查器")
        naming_layout = QVBoxLayout(naming_group)
        naming_layout.setSpacing(10)
        
        # 解析的命名字段
        self.asset_type_label = QLabel("AssetType: --")
        self.name_label = QLabel("Name: --")
        self.variant_label = QLabel("Variant: --")
        self.workflow_label = QLabel("Workflow: --")
        
        naming_layout.addWidget(self.asset_type_label)
        naming_layout.addWidget(self.name_label)
        naming_layout.addWidget(self.variant_label)
        naming_layout.addWidget(self.workflow_label)
        
        # 不规范命名的提示
        self.non_compliant_label = QLabel("所有资源命名规范均符合要求")
        self.non_compliant_label.setObjectName("nonCompliantLabel")
        naming_layout.addWidget(self.non_compliant_label)
        
        right_layout.addWidget(naming_group)
        
        # ------------------------------
        # 打包配置
        # ------------------------------
        packaging_group = QGroupBox("打包配置")
        packaging_layout = QVBoxLayout(packaging_group)
        packaging_layout.setSpacing(10)
        
        # 生成C++头文件选项
        self.generate_header_checkbox = QCheckBox("生成C++头文件")
        self.generate_header_checkbox.setObjectName("generateHeaderCheckbox")
        packaging_layout.addWidget(self.generate_header_checkbox)
        
        # 导出路径
        self.export_path_label = QLabel(f"导出路径: {self.config.output_dir}")
        self.export_path_label.setObjectName("exportPathLabel")
        self.export_path_label.setWordWrap(True)
        packaging_layout.addWidget(self.export_path_label)
        
        # 更改路径按钮
        self.change_path_button = QPushButton("更改导出路径")
        self.change_path_button.setObjectName("changePathButton")
        self.change_path_button.clicked.connect(self.change_export_path)
        packaging_layout.addWidget(self.change_path_button)
        
        right_layout.addWidget(packaging_group)
        
        # ------------------------------
        # 导出进度
        # ------------------------------
        progress_group = QGroupBox("导出进度")
        progress_layout = QVBoxLayout(progress_group)
        progress_layout.setSpacing(10)
        
        # 进度条
        self.progress_bar = QProgressBar()
        self.progress_bar.setObjectName("exportProgressBar")
        self.progress_bar.setValue(0)
        progress_layout.addWidget(self.progress_bar)
        
        # 进度信息
        self.progress_info_label = QLabel("等待导出...")
        self.progress_info_label.setObjectName("progressInfoLabel")
        progress_layout.addWidget(self.progress_info_label)
        
        right_layout.addWidget(progress_group)
        
        # ------------------------------
        # 一键打包按钮
        # ------------------------------
        self.package_button = QPushButton("一键打包")
        self.package_button.setObjectName("packageButton")
        self.package_button.setStyleSheet("background-color: #4CAF50; color: white; font-weight: bold;")
        self.package_button.clicked.connect(self.run_packaging)
        right_layout.addWidget(self.package_button)
        
        right_layout.addStretch()
    
    def get_right_panel(self):
        """获取右侧面板"""
        return self.right_panel
    
    def load_resources(self):
        """加载处理目录中的资源文件"""
        try:
            processed_dir = self.config.output_dir
            if not os.path.exists(processed_dir):
                logging.warning(f"处理目录不存在: {processed_dir}")
                return
            
            # 获取所有文件
            files = [f for f in os.listdir(processed_dir) if os.path.isfile(os.path.join(processed_dir, f))]
            
            for file in files:
                file_path = os.path.join(processed_dir, file)
                self.add_resource_item(file_path)
            
            logging.info(f"加载了 {len(files)} 个资源文件")
        except Exception as e:
            logging.error(f"加载资源文件失败: {str(e)}")
    
    def add_resource_item(self, file_path):
        """添加资源项"""
        # 创建资源项小部件
        resource_widget = ResourceItemWidget(file_path)
        
        # 创建列表项
        item = QListWidgetItem()
        item.setSizeHint(resource_widget.sizeHint() + QSize(20, 20))
        
        # 添加到列表
        self.file_browser.addItem(item)
        self.file_browser.setItemWidget(item, resource_widget)
        
        # 连接复选框信号
        resource_widget.checkbox.stateChanged.connect(lambda state, path=file_path:
                                                     self.on_resource_selected(path, state == Qt.Checked))
    
    def on_resource_selected(self, file_path, selected):
        """当资源被选择或取消选择时的处理"""
        if selected and file_path not in self.selected_resources:
            self.selected_resources.append(file_path)
        elif not selected and file_path in self.selected_resources:
            self.selected_resources.remove(file_path)
        
        # 更新统计信息
        self.update_selection_stats()
    
    def update_selection_stats(self):
        """更新选择统计信息"""
        selected_count = len(self.selected_resources)
        total_count = self.file_browser.count()
        
        # 可以在这里添加更新UI的代码
        logging.info(f"已选择 {selected_count}/{total_count} 个资源文件")
    
    def change_export_path(self):
        """更改导出路径"""
        new_path = QFileDialog.getExistingDirectory(
            self, "选择导出路径", self.config.output_dir)
        
        if new_path:
            self.config.output_dir = new_path
            self.export_path_label.setText(f"导出路径: {new_path}")
            logging.info(f"更改导出路径为: {new_path}")
    
    def run_packaging(self):
        """运行一键打包"""
        if not self.selected_resources:
            logging.info("未选择任何资源文件进行导出")
            return
        
        logging.info(f"开始打包 {len(self.selected_resources)} 个资源文件")
        
        # 更新进度
        self.progress_bar.setValue(0)
        self.progress_info_label.setText("准备导出...")
        
        # 模拟打包过程
        self.simulate_packaging()
    
    def simulate_packaging(self):
        """模拟打包过程"""
        # 总进度
        total_steps = 100
        
        # 使用定时器模拟打包过程
        def update_progress(step):
            self.progress_bar.setValue(step)
            if step < total_steps:
                self.progress_info_label.setText(f"正在导出... {step}%")
            else:
                self.progress_info_label.setText("导出完成!")
        
        # 更新进度
        for i in range(0, total_steps + 1, 10):
            QTimer.singleShot(i * 100, lambda s=i: update_progress(s))
    
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
