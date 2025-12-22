#!/usr/bin/env python3
"""
AmberPipeline AI - 主窗口架构
实现左侧边栏+中央工作区+底部状态栏的界面布局
包含标签页切换功能，分离三个核心功能场景
"""

import sys
import os
import logging
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QTabWidget, QSplitter, QStatusBar, QMenuBar, QMenu,
    QPushButton, QLabel, QGroupBox, QGridLayout
)
from PyQt5.QtCore import Qt, QThread, pyqtSignal
from PyQt5.QtGui import QFont, QIcon

# 添加项目根目录到系统路径
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

# 导入核心模块和配置
from main import ImageProcessingHandler
from config import Config

# 导入各个标签页组件
from gui.components.monitor_tab import MonitorTab
from gui.components.editor_tab import EditorTab
from gui.components.export_tab import ExportTab

class AmberPipelineMainWindow(QMainWindow):
    """AmberPipeline主窗口类"""
    
    def __init__(self):
        super().__init__()
        self.config = Config()
        self.pipeline_thread = None
        
        # 初始化UI组件引用
        self.left_sidebar = None
        self.central_workspace = None
        self.tabs = None
        self.right_sidebar = None
        self.current_right_panel = None
        self.menu_bar = None
        self.raw_dir_label = None
        self.sorted_dir_label = None
        self.processed_dir_label = None
        self.status_toggle_group = None
        self.toggle_btn = None
        self.current_status_label = None
        self.status_label = None
        self.memory_label = None
        self.log_label = None
        
        # 初始化UI
        self.init_ui()
        self.setup_logging()
        
        # 加载样式表
        self.load_stylesheet()
    
    def init_ui(self):
        """初始化用户界面"""
        # 设置窗口属性
        self.setWindowTitle("AmberPipeline AI - 可视化工具")
        self.setGeometry(100, 100, 1400, 900)
        self.setMinimumSize(1200, 700)
        
        # 创建菜单栏
        self.create_menu_bar()
        
        # 创建中心部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # 创建主布局
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        # ------------------------------
        # 左侧边栏
        # ------------------------------
        self.left_sidebar = QWidget()
        self.left_sidebar.setFixedWidth(250)
        self.left_sidebar.setObjectName("leftSidebar")
        left_layout = QVBoxLayout(self.left_sidebar)
        left_layout.setContentsMargins(10, 10, 10, 10)
        left_layout.setSpacing(10)
        
        # 左侧导航菜单
        self.create_left_navigation(left_layout)
        
        # 添加左侧边栏到主布局
        main_layout.addWidget(self.left_sidebar)
        
        # ------------------------------
        # 中央工作区
        # ------------------------------
        self.central_workspace = QWidget()
        central_layout = QVBoxLayout(self.central_workspace)
        central_layout.setContentsMargins(0, 0, 0, 0)
        central_layout.setSpacing(0)
        
        # 创建标签页控件
        self.tabs = QTabWidget()
        self.tabs.setObjectName("mainTabs")
        self.tabs.setTabPosition(QTabWidget.North)
        
        # 创建各个标签页
        self.create_tabs()
        
        # 添加标签页到中央布局
        central_layout.addWidget(self.tabs)
        
        # 添加中央工作区到主布局（占主要空间）
        main_layout.addWidget(self.central_workspace, 1)
        
        # ------------------------------
        # 右侧边栏
        # ------------------------------
        self.right_sidebar = QWidget()
        self.right_sidebar.setFixedWidth(300)
        self.right_sidebar.setObjectName("rightSidebar")
        right_layout = QVBoxLayout(self.right_sidebar)
        right_layout.setContentsMargins(10, 10, 10, 10)
        right_layout.setSpacing(10)
        
        # 初始右侧边栏内容
        self.current_right_panel = None
        
        # 添加右侧边栏到主布局
        main_layout.addWidget(self.right_sidebar)
        
        # ------------------------------
        # 状态栏
        # ------------------------------
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        
        # 创建状态栏组件
        self.create_status_bar()
        
        # ------------------------------
        # 连接信号槽
        # ------------------------------
        self.tabs.currentChanged.connect(self.on_tab_changed)
    
    def create_menu_bar(self):
        """创建菜单栏"""
        self.menu_bar = self.menuBar()
        self.menu_bar.setObjectName("mainMenuBar")
        
        # 文件菜单
        file_menu = self.menu_bar.addMenu("文件")
        
        # 配置菜单
        config_menu = self.menu_bar.addMenu("配置")
        
        # SAM模型菜单
        sam_menu = self.menu_bar.addMenu("SAM模型")
        
        # 插件菜单
        plugin_menu = self.menu_bar.addMenu("插件")
        
        # 帮助菜单
        help_menu = self.menu_bar.addMenu("帮助")
    
    def create_left_navigation(self, layout):
        """创建左侧导航菜单"""
        # 目录配置卡片
        dir_config_group = QGroupBox("目录配置")
        dir_config_layout = QVBoxLayout(dir_config_group)
        
        # 显示各目录路径
        self.raw_dir_label = QLabel(f"原始目录: {self.config.watch_dir}")
        self.raw_dir_label.setWordWrap(True)
        self.raw_dir_label.setObjectName("dirLabel")
        
        self.sorted_dir_label = QLabel(f"分类目录: {self.config.sorted_dir}")
        self.sorted_dir_label.setWordWrap(True)
        self.sorted_dir_label.setObjectName("dirLabel")
        
        self.processed_dir_label = QLabel(f"处理目录: {self.config.output_dir}")
        self.processed_dir_label.setWordWrap(True)
        self.processed_dir_label.setObjectName("dirLabel")
        
        dir_config_layout.addWidget(self.raw_dir_label)
        dir_config_layout.addWidget(self.sorted_dir_label)
        dir_config_layout.addWidget(self.processed_dir_label)
        
        # 状态切换按钮
        self.status_toggle_group = QGroupBox("监控状态")
        status_toggle_layout = QVBoxLayout(self.status_toggle_group)
        
        self.toggle_btn = QPushButton("启动监控")
        self.toggle_btn.setObjectName("statusToggleBtn")
        self.toggle_btn.setStyleSheet("background-color: #4CAF50; color: white; font-weight: bold;")
        self.toggle_btn.clicked.connect(self.toggle_pipeline)
        
        status_toggle_layout.addWidget(self.toggle_btn)
        
        # 当前状态标签
        self.current_status_label = QLabel("当前状态: 已停止")
        self.current_status_label.setAlignment(Qt.AlignCenter)
        self.current_status_label.setObjectName("statusLabel")
        
        status_toggle_layout.addWidget(self.current_status_label)
        
        # 添加到左侧布局
        layout.addWidget(dir_config_group)
        layout.addWidget(self.status_toggle_group)
        layout.addStretch()
    
    def create_tabs(self):
        """创建三个主要标签页"""
        # 标签页1: 实时监控仪表盘
        self.monitor_tab = MonitorTab(self.config, self)
        self.tabs.addTab(self.monitor_tab, "实时监控")
        
        # 标签页2: 交互式编辑
        self.editor_tab = EditorTab(self.config, self)
        self.tabs.addTab(self.editor_tab, "交互式编辑")
        
        # 标签页3: 批处理与导出
        self.export_tab = ExportTab(self.config, self)
        self.tabs.addTab(self.export_tab, "批处理与导出")
        
        # 设置默认标签页
        self.tabs.setCurrentIndex(0)
    
    def create_status_bar(self):
        """创建状态栏"""
        # 监控状态
        self.status_label = QLabel("状态: 已停止")
        self.status_bar.addWidget(self.status_label)
        
        # 分隔符
        self.status_bar.addPermanentWidget(QLabel("|"))
        
        # 内存使用
        self.memory_label = QLabel("内存: -- MB")
        self.status_bar.addPermanentWidget(self.memory_label)
        
        # 分隔符
        self.status_bar.addPermanentWidget(QLabel("|"))
        
        # 最新日志
        self.log_label = QLabel("就绪")
        self.log_label.setObjectName("logLabel")
        self.status_bar.addPermanentWidget(self.log_label)
    
    def on_tab_changed(self, index):
        """当标签页切换时的处理"""
        # 更新右侧边栏内容
        self.update_right_sidebar(index)
        
        # 更新状态栏
        if index == 0:
            self.status_bar.showMessage("实时监控仪表盘 - 专注自动化流水线操作")
        elif index == 1:
            self.status_bar.showMessage("交互式编辑 - 精细化处理需要SAM交互")
        elif index == 2:
            self.status_bar.showMessage("批处理与导出 - 元数据管理和二进制导出操作")
    
    def update_right_sidebar(self, tab_index):
        """更新右侧边栏内容"""
        # 移除当前右侧面板
        if self.current_right_panel:
            self.current_right_panel.setParent(None)
        
        # 根据标签页添加不同的右侧面板
        if tab_index == 0:
            # 实时监控标签页 - 添加统计图表
            self.current_right_panel = self.monitor_tab.get_right_panel()
        elif tab_index == 1:
            # 交互式编辑标签页 - 添加参数面板
            self.current_right_panel = self.editor_tab.get_right_panel()
        elif tab_index == 2:
            # 批处理与导出标签页 - 添加导出设置
            self.current_right_panel = self.export_tab.get_right_panel()
        
        # 添加新的右侧面板
        if self.current_right_panel:
            self.right_sidebar.layout().addWidget(self.current_right_panel)
    
    def toggle_pipeline(self):
        """切换流水线的启动/停止状态"""
        # 这里可以连接到实际的流水线线程控制
        if self.toggle_btn.text() == "启动监控":
            self.toggle_btn.setText("停止监控")
            self.toggle_btn.setStyleSheet("background-color: #f44336; color: white; font-weight: bold;")
            self.current_status_label.setText("当前状态: 运行中")
            self.status_label.setText("状态: 运行中")
            self.status_bar.showMessage("流水线已启动")
        else:
            self.toggle_btn.setText("启动监控")
            self.toggle_btn.setStyleSheet("background-color: #4CAF50; color: white; font-weight: bold;")
            self.current_status_label.setText("当前状态: 已停止")
            self.status_label.setText("状态: 已停止")
            self.status_bar.showMessage("流水线已停止")
    
    def setup_logging(self):
        """配置日志系统"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)
        self.logger.info("AmberPipeline主窗口已启动")
    
    def load_stylesheet(self):
        """加载QSS样式表"""
        stylesheet_path = os.path.join(os.path.dirname(__file__), "styles.qss")
        if os.path.exists(stylesheet_path):
            with open(stylesheet_path, "r", encoding="utf-8") as f:
                self.setStyleSheet(f.read())
            self.logger.info("样式表已加载")
        else:
            self.logger.warning("未找到样式表文件")

# 测试主窗口
if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = AmberPipelineMainWindow()
    window.show()
    sys.exit(app.exec_())