// AmberPipeline AI - 资源打包器命令行工具

#include "AssetPacker.h"
#include <iostream>
#include <string>
#include <vector>

int main(int argc, char* argv[]) {
    std::cout << "AmberPipeline AI - 资源打包器" << std::endl;
    std::cout << "版本: 1.0.0" << std::endl;
    std::cout << "======================================" << std::endl;

    // 检查命令行参数
    if (argc < 3) {
        std::cout << "用法: AssetPacker <输入路径> <输出包路径> [选项]" << std::endl;
        std::cout << "选项: " << std::endl;
        std::cout << "  -v, --version <版本号>     设置包版本号 (默认: 1)" << std::endl;
        std::cout << "  -c, --compression <级别>   设置压缩级别 (0-9, 默认: 0)" << std::endl;
        std::cout << "  -o, --overwrite            覆盖已存在的输出文件" << std::endl;
        std::cout << "  -d, --directory            输入路径是目录，递归处理所有文件" << std::endl;
        std::cout << "  -t, --type <类型>          资源类型 (0-9, 默认: 自动检测)" << std::endl;
        std::cout << "  -h, --help                 显示帮助信息" << std::endl;
        std::cout << "======================================" << std::endl;
        std::cout << "资源类型列表: " << std::endl;
        std::cout << "  0: 未知 (UNKNOWN)" << std::endl;
        std::cout << "  1: 2D纹理 (TEXTURE_2D)" << std::endl;
        std::cout << "  2: 立方体贴图 (TEXTURE_CUBE)" << std::endl;
        std::cout << "  3: 3D模型 (MODEL)" << std::endl;
        std::cout << "  4: 材质 (MATERIAL)" << std::endl;
        std::cout << "  5: 着色器 (SHADER)" << std::endl;
        std::cout << "  6: 音效 (SOUND)" << std::endl;
        std::cout << "  7: 动画 (ANIMATION)" << std::endl;
        std::cout << "  8: 粒子系统 (PARTICLE_SYSTEM)" << std::endl;
        std::cout << "  9: 脚本 (SCRIPT)" << std::endl;
        return 1;
    }

    // 解析命令行参数
    std::string inputPath = argv[1];
    std::string outputPath = argv[2];
    uint32_t version = 1;
    int compressionLevel = 0;
    bool overwrite = false;
    bool isDirectory = false;
    AmberPipeline::ResourceType resourceType = AmberPipeline::ResourceType::UNKNOWN;

    for (int i = 3; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "-v" || arg == "--version") {
            if (i + 1 < argc) {
                version = static_cast<uint32_t>(std::stoi(argv[++i]));
            }
        } else if (arg == "-c" || arg == "--compression") {
            if (i + 1 < argc) {
                compressionLevel = std::stoi(argv[++i]);
            }
        } else if (arg == "-o" || arg == "--overwrite") {
            overwrite = true;
        } else if (arg == "-d" || arg == "--directory") {
            isDirectory = true;
        } else if (arg == "-t" || arg == "--type") {
            if (i + 1 < argc) {
                int typeInt = std::stoi(argv[++i]);
                resourceType = static_cast<AmberPipeline::ResourceType>(typeInt);
            }
        } else if (arg == "-h" || arg == "--help") {
            std::cout << "用法: AssetPacker <输入路径> <输出包路径> [选项]" << std::endl;
            std::cout << "选项: " << std::endl;
            std::cout << "  -v, --version <版本号>     设置包版本号 (默认: 1)" << std::endl;
            std::cout << "  -c, --compression <级别>   设置压缩级别 (0-9, 默认: 0)" << std::endl;
            std::cout << "  -o, --overwrite            覆盖已存在的输出文件" << std::endl;
            std::cout << "  -d, --directory            输入路径是目录，递归处理所有文件" << std::endl;
            std::cout << "  -t, --type <类型>          资源类型 (0-9, 默认: 自动检测)" << std::endl;
            std::cout << "  -h, --help                 显示帮助信息" << std::endl;
            return 0;
        } else {
            std::cerr << "未知选项: " << arg << std::endl;
            return 1;
        }
    }

    // 创建资源打包器
    AmberPipeline::AssetPacker packer;

    // 设置打包参数
    packer.SetOutputPath(outputPath);
    packer.SetVersion(version);
    packer.SetCompressionLevel(compressionLevel);
    packer.SetOverwrite(overwrite);

    // 添加资源
    bool success = false;
    if (isDirectory) {
        success = packer.AddResourceDirectory(inputPath, resourceType);
    } else {
        success = packer.AddResource(inputPath, resourceType);
    }

    if (!success) {
        std::cerr << "添加资源失败" << std::endl;
        return 1;
    }

    // 执行打包
    success = packer.Pack();

    if (!success) {
        std::cerr << "打包失败" << std::endl;
        return 1;
    }

    // 输出打包结果
    std::cout << "======================================" << std::endl;
    std::cout << "打包完成！" << std::endl;
    std::cout << "资源数量: " << packer.GetResourceCount() << std::endl;
    std::cout << "总大小: " << packer.GetTotalSize() << " 字节" << std::endl;
    std::cout << "处理的文件: " << packer.GetProcessedFiles().size() << std::endl;
    std::cout << "输出文件: " << outputPath << std::endl;
    std::cout << "======================================" << std::endl;

    return 0;
}
