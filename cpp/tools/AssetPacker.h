// AmberPipeline AI - 资源打包器
// 用于将资源文件打包成二进制格式，供引擎运行时加载

#pragma once

#include <string>
#include <vector>
#include <unordered_map>
#include "../include/ResourceTypes.h"

namespace AmberPipeline {

class AssetPacker {
public:
    AssetPacker();
    ~AssetPacker();

    // 禁止复制和移动
    AssetPacker(const AssetPacker&) = delete;
    AssetPacker& operator=(const AssetPacker&) = delete;
    AssetPacker(AssetPacker&&) = delete;
    AssetPacker& operator=(AssetPacker&&) = delete;

    // 设置打包参数
    void SetOutputPath(const std::string& outputPath);
    void SetVersion(uint32_t version);
    void SetCompressionLevel(int level); // 0-9，0表示不压缩
    void SetOverwrite(bool overwrite);

    // 添加资源到包中
    bool AddResource(const std::string& resourcePath, ResourceType type);
    bool AddResourceDirectory(const std::string& directoryPath, ResourceType type = ResourceType::UNKNOWN);

    // 执行打包
    bool Pack();

    // 获取打包信息
    size_t GetResourceCount() const;
    size_t GetTotalSize() const;
    const std::vector<std::string>& GetProcessedFiles() const;

private:
    // 私有成员函数
    bool ProcessResource(const std::string& resourcePath, ResourceType type);
    bool WritePackageHeader(std::ofstream& outFile);
    bool WriteResourceMetadata(std::ofstream& outFile);
    bool WriteResourceData(std::ofstream& outFile);
    uint32_t CalculateChecksum(const void* data, size_t size) const;
    void CalculateHash(const void* data, size_t size, char* outHash) const;
    ResourceType DetectResourceType(const std::string& filePath) const;
    std::string GetResourceName(const std::string& filePath) const;
    
    // 压缩功能
    std::vector<uint8_t> CompressResource(const std::vector<uint8_t>& input, CompressionType compressionType, int level);
    std::vector<uint8_t> DecompressResource(const std::vector<uint8_t>& input, CompressionType compressionType, size_t originalSize);
    std::vector<uint8_t> DeflateCompress(const std::vector<uint8_t>& input, int level);
    std::vector<uint8_t> LZ4Compress(const std::vector<uint8_t>& input, int level);
    std::vector<uint8_t> ZSTDCompress(const std::vector<uint8_t>& input, int level);
    std::vector<uint8_t> TextureCompress(const std::vector<uint8_t>& input, CompressionType compressionType, const TextureInfo& textureInfo);

private:
    // 私有成员变量
    std::string m_outputPath;
    uint32_t m_version;
    int m_compressionLevel;
    bool m_overwrite;
    
    std::vector<ResourceMetadata> m_metadataList;
    std::vector<std::vector<uint8_t>> m_resourceDataList;
    std::vector<std::string> m_processedFiles;
    
    std::unordered_map<std::string, uint32_t> m_resourceNameToIdMap;
    size_t m_totalSize;
    uint32_t m_nextResourceId;
};

} // namespace AmberPipeline
