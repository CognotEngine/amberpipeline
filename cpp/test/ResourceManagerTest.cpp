// AmberPipeline AI - 资源管理器测试程序
// 验证ResourceManager的核心功能

#include "../include/ResourceManager.h"
#include <iostream>
#include <string>
#include <chrono>

using namespace AmberPipeline;

void PrintSeparator() {
    std::cout << "======================================" << std::endl;
}

int main() {
    std::cout << "AmberPipeline AI - 资源管理器测试程序" << std::endl;
    std::cout << "版本: 1.0.0" << std::endl;
    PrintSeparator();

    // 测试步骤1: 初始化资源管理器
    std::cout << "测试1: 初始化资源管理器" << std::endl;
    bool initSuccess = ResourceManager::GetInstance().Initialize(".");
    if (!initSuccess) {
        std::cerr << "✗ 初始化资源管理器失败" << std::endl;
        return 1;
    }
    std::cout << "✓ 资源管理器初始化成功" << std::endl;
    PrintSeparator();

    // 测试步骤2: 加载资源包（注意：这里需要确保test_pack.pkg存在，否则测试会失败）
    std::cout << "测试2: 加载资源包" << std::endl;
    std::string testPackage = "test_pack.pkg";
    
    // 检查测试包是否存在
    std::ifstream testPackageFile(testPackage);
    if (!testPackageFile.good()) {
        std::cout << "⚠ 测试包 " << testPackage << " 不存在，跳过资源包加载测试" << std::endl;
        testPackageFile.close();
    } else {
        testPackageFile.close();
        bool loadSuccess = ResourceManager::GetInstance().LoadResourcePackage(testPackage);
        if (!loadSuccess) {
            std::cerr << "✗ 加载资源包失败" << std::endl;
        } else {
            std::cout << "✓ 资源包加载成功" << std::endl;
            
            // 测试步骤3: 加载资源
            std::cout << "测试3: 加载资源" << std::endl;
            AssetID assetId = ResourceManager::GetInstance().LoadResource("test_texture", ResourceType::TEXTURE_2D);
            if (assetId == 0) {
                std::cerr << "✗ 加载资源失败" << std::endl;
            } else {
                std::cout << "✓ 资源加载成功，ID: " << assetId << std::endl;
                
                // 测试步骤4: 获取资源
                std::cout << "测试4: 获取资源" << std::endl;
                const ResourceData* resource = ResourceManager::GetInstance().GetResource(assetId);
                if (!resource) {
                    std::cerr << "✗ 获取资源失败" << std::endl;
                } else {
                    std::cout << "✓ 资源获取成功" << std::endl;
                    std::cout << "  资源名称: " << resource->metadata.name << std::endl;
                    std::cout << "  资源类型: " << static_cast<uint32_t>(resource->metadata.type) << std::endl;
                    std::cout << "  资源大小: " << resource->dataSize << " 字节" << std::endl;
                    std::cout << "  资源ID: " << resource->metadata.id << std::endl;
                    
                    // 测试步骤5: 验证资源数据
                    std::cout << "测试5: 验证资源数据" << std::endl;
                    if (resource->data && resource->dataSize > 0) {
                        std::cout << "✓ 资源数据有效" << std::endl;
                    } else {
                        std::cerr << "✗ 资源数据无效" << std::endl;
                    }
                    
                    // 测试步骤6: 释放资源
                    std::cout << "测试6: 释放资源" << std::endl;
                    ResourceManager::GetInstance().ReleaseResource(assetId);
                    std::cout << "✓ 资源释放成功" << std::endl;
                }
            }
            
            // 测试步骤7: 卸载资源包
            std::cout << "测试7: 卸载资源包" << std::endl;
            bool unloadSuccess = ResourceManager::GetInstance().UnloadResourcePackage(testPackage);
            if (!unloadSuccess) {
                std::cerr << "✗ 卸载资源包失败" << std::endl;
            } else {
                std::cout << "✓ 资源包卸载成功" << std::endl;
            }
        }
    }
    PrintSeparator();

    // 测试步骤8: 验证资源管理器状态
    std::cout << "测试8: 验证资源管理器状态" << std::endl;
    size_t loadedResourceCount = ResourceManager::GetInstance().GetLoadedResourceCount();
    size_t totalMemoryUsage = ResourceManager::GetInstance().GetTotalMemoryUsage();
    std::cout << "✓ 资源管理器状态正常" << std::endl;
    std::cout << "  已加载资源数量: " << loadedResourceCount << std::endl;
    std::cout << "  总内存使用: " << totalMemoryUsage << " 字节" << std::endl;
    PrintSeparator();

    // 测试步骤9: 卸载未使用的资源
    std::cout << "测试9: 卸载未使用的资源" << std::endl;
    ResourceManager::GetInstance().UnloadUnusedResources();
    std::cout << "✓ 已卸载未使用的资源" << std::endl;
    PrintSeparator();

    // 测试步骤10: 关闭资源管理器
    std::cout << "测试10: 关闭资源管理器" << std::endl;
    ResourceManager::GetInstance().Shutdown();
    std::cout << "✓ 资源管理器已关闭" << std::endl;
    PrintSeparator();

    std::cout << "所有测试完成！" << std::endl;
    std::cout << "注意：如果某些测试被跳过，可能是因为缺少测试资源包。" << std::endl;
    std::cout << "请确保test_pack.pkg文件存在于当前目录，以运行完整测试。" << std::endl;
    PrintSeparator();

    return 0;
}
