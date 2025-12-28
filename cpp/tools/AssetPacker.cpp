// AmberPipeline AI - 资源打包器实现

#include "AssetPacker.h"
#include <fstream>
#include <filesystem>
#include <algorithm>
#include <cstring>
#include <iostream>
#include <chrono>
#include <sstream>
#include <iomanip>

// Zlib for DEFLATE compression
#include <zlib.h>

// LZ4 and ZSTD headers (需要安装相应库)
// #include <lz4.h>
// #include <zstd.h>

namespace AmberPipeline {
namespace fs = std::filesystem;

AssetPacker::AssetPacker()
    : m_version(1)
    , m_compressionLevel(0)
    , m_overwrite(false)
    , m_totalSize(0)
    , m_nextResourceId(1) { // 资源ID从1开始，0表示无效
}

AssetPacker::~AssetPacker() {
    // 清理资源
    m_metadataList.clear();
    m_resourceDataList.clear();
    m_processedFiles.clear();
    m_resourceNameToIdMap.clear();
}

void AssetPacker::SetOutputPath(const std::string& outputPath) {
    m_outputPath = outputPath;
}

void AssetPacker::SetVersion(uint32_t version) {
    m_version = version;
}

void AssetPacker::SetCompressionLevel(int level) {
    // 确保压缩级别在0-9之间
    m_compressionLevel = std::max(0, std::min(9, level));
}

void AssetPacker::SetOverwrite(bool overwrite) {
    m_overwrite = overwrite;
}

bool AssetPacker::AddResource(const std::string& resourcePath, ResourceType type) {
    // 检查文件是否存在
    if (!fs::exists(resourcePath)) {
        std::cerr << "资源文件不存在: " << resourcePath << std::endl;
        return false;
    }

    // 检查文件是否为普通文件
    if (!fs::is_regular_file(resourcePath)) {
        std::cerr << "不是普通文件: " << resourcePath << std::endl;
        return false;
    }

    // 检查文件是否已经处理过
    if (std::find(m_processedFiles.begin(), m_processedFiles.end(), resourcePath) != m_processedFiles.end()) {
        std::cerr << "文件已处理过: " << resourcePath << std::endl;
        return false;
    }

    // 处理资源
    return ProcessResource(resourcePath, type);
}

bool AssetPacker::AddResourceDirectory(const std::string& directoryPath, ResourceType type) {
    // 检查目录是否存在
    if (!fs::exists(directoryPath)) {
        std::cerr << "目录不存在: " << directoryPath << std::endl;
        return false;
    }

    // 检查是否为目录
    if (!fs::is_directory(directoryPath)) {
        std::cerr << "不是目录: " << directoryPath << std::endl;
        return false;
    }

    // 遍历目录中的所有文件
    bool success = true;
    for (const auto& entry : fs::recursive_directory_iterator(directoryPath)) {
        if (fs::is_regular_file(entry)) {
            std::string filePath = entry.path().string();
            if (!ProcessResource(filePath, type)) {
                success = false;
            }
        }
    }

    return success;
}

bool AssetPacker::Pack() {
    // 检查是否有资源要打包
    if (m_metadataList.empty()) {
        std::cerr << "没有资源要打包" << std::endl;
        return false;
    }

    // 检查输出路径
    if (m_outputPath.empty()) {
        std::cerr << "未设置输出路径" << std::endl;
        return false;
    }

    // 检查输出文件是否已存在
    if (fs::exists(m_outputPath) && !m_overwrite) {
        std::cerr << "输出文件已存在: " << m_outputPath << std::endl;
        return false;
    }

    // 创建输出目录
    fs::path outputDir = fs::path(m_outputPath).parent_path();
    if (!outputDir.empty() && !fs::exists(outputDir)) {
        if (!fs::create_directories(outputDir)) {
            std::cerr << "无法创建输出目录: " << outputDir << std::endl;
            return false;
        }
    }

    // 打开输出文件
    std::ofstream outFile(m_outputPath, std::ios::binary | std::ios::trunc);
    if (!outFile.is_open()) {
        std::cerr << "无法打开输出文件: " << m_outputPath << std::endl;
        return false;
    }

    std::cout << "开始打包资源，输出路径: " << m_outputPath << std::endl;
    std::cout << "资源数量: " << m_metadataList.size() << std::endl;

    // 写入包头部
    if (!WritePackageHeader(outFile)) {
        outFile.close();
        return false;
    }

    // 写入资源元数据
    if (!WriteResourceMetadata(outFile)) {
        outFile.close();
        return false;
    }

    // 写入资源数据
    if (!WriteResourceData(outFile)) {
        outFile.close();
        return false;
    }

    outFile.close();
    std::cout << "资源打包成功！" << std::endl;
    std::cout << "输出文件: " << m_outputPath << std::endl;
    std::cout << "总大小: " << m_totalSize << " 字节" << std::endl;
    std::cout << "处理的文件数量: " << m_processedFiles.size() << std::endl;

    return true;
}

size_t AssetPacker::GetResourceCount() const {
    return m_metadataList.size();
}

size_t AssetPacker::GetTotalSize() const {
    return m_totalSize;
}

const std::vector<std::string>& AssetPacker::GetProcessedFiles() const {
    return m_processedFiles;
}

bool AssetPacker::ProcessResource(const std::string& resourcePath, ResourceType type) {
    // 检测资源类型（如果未指定）
    ResourceType actualType = type;
    if (actualType == ResourceType::UNKNOWN) {
        actualType = DetectResourceType(resourcePath);
        if (actualType == ResourceType::UNKNOWN) {
            std::cerr << "无法检测资源类型: " << resourcePath << std::endl;
            return false;
        }
    }

    // 读取资源文件
    std::ifstream inFile(resourcePath, std::ios::binary);
    if (!inFile.is_open()) {
        std::cerr << "无法打开资源文件: " << resourcePath << std::endl;
        return false;
    }

    // 获取文件大小
    inFile.seekg(0, std::ios::end);
    size_t fileSize = inFile.tellg();
    inFile.seekg(0, std::ios::beg);

    // 分配内存并读取文件内容
    std::vector<uint8_t> resourceData(fileSize);
    inFile.read(reinterpret_cast<char*>(resourceData.data()), fileSize);
    if (!inFile.good()) {
        std::cerr << "读取资源文件失败: " << resourcePath << std::endl;
        inFile.close();
        return false;
    }
    inFile.close();

    // 创建资源元数据
    ResourceMetadata metadata;
    memset(&metadata, 0, sizeof(metadata));

    // 生成资源ID
    std::string resourceName = GetResourceName(resourcePath);
    auto idIt = m_resourceNameToIdMap.find(resourceName);
    if (idIt != m_resourceNameToIdMap.end()) {
        metadata.id = idIt->second;
    } else {
        metadata.id = m_nextResourceId++;
        m_resourceNameToIdMap[resourceName] = metadata.id;
    }

    // 设置元数据
    metadata.type = actualType;
    strncpy(metadata.name, resourceName.c_str(), sizeof(metadata.name) - 1);
    metadata.name[sizeof(metadata.name) - 1] = '\0';
    metadata.flags = 0;
    metadata.compressionType = CompressionType::NONE;
    metadata.originalSize = fileSize;

    // 检查是否需要压缩
    std::vector<uint8_t> finalData;
    if (m_compressionLevel > 0) {
        // 选择合适的压缩算法
        CompressionType chosenCompressionType = CompressionType::DEFLATE;
        
        // 对纹理资源使用纹理特定的压缩算法
        if (actualType == ResourceType::TEXTURE_2D || actualType == ResourceType::TEXTURE_CUBE) {
            // TODO: 检测是否支持BC7/ASTC压缩
            // chosenCompressionType = CompressionType::BC7;
        }
        
        // 执行压缩
        finalData = CompressResource(resourceData, chosenCompressionType, m_compressionLevel);
        
        // 检查压缩是否成功
        if (finalData.empty() || finalData.size() >= fileSize) {
            // 压缩失败或压缩效果不好，使用原始数据
            std::cout << "压缩效果不佳或失败，使用原始数据: " << resourcePath << std::endl;
            finalData = std::move(resourceData);
            metadata.size = fileSize;
            metadata.compressionType = CompressionType::NONE;
        } else {
            // 更新元数据
            metadata.compressionType = chosenCompressionType;
            metadata.size = finalData.size();
            metadata.flags |= 1 << 0; // 压缩标志
            
            // 计算压缩率
            double compressionRatio = static_cast<double>(fileSize - finalData.size()) / fileSize * 100.0;
            std::cout << "资源压缩完成: " << resourcePath << " -> 原始大小: " << fileSize << " 字节 -> 压缩后大小: " << finalData.size() << " 字节 -> 压缩率: " << compressionRatio << "%" << std::endl;
        }
    } else {
        // 不压缩
        finalData = std::move(resourceData);
        metadata.size = fileSize;
        metadata.compressionType = CompressionType::NONE;
    }

    // 计算哈希值（使用压缩后的数据计算哈希，确保一致性）
    CalculateHash(finalData.data(), finalData.size(), metadata.hash);

    // 添加到列表
    m_metadataList.push_back(metadata);
    m_resourceDataList.push_back(std::move(finalData));
    m_processedFiles.push_back(resourcePath);

    std::cout << "添加资源: " << resourcePath << " -> 类型: " << static_cast<uint32_t>(actualType) << " -> ID: " << metadata.id << std::endl;

    return true;
}

bool AssetPacker::WritePackageHeader(std::ofstream& outFile) {
    // 创建包头部
    ResourcePackageHeader header;
    memset(&header, 0, sizeof(header));

    // 设置包标识
    strncpy(header.magic, "AMBPKG01", sizeof(header.magic));
    header.magic[sizeof(header.magic) - 1] = '\0';

    // 设置版本号
    header.version = m_version;

    // 设置资源数量
    header.resourceCount = static_cast<uint32_t>(m_metadataList.size());

    // 设置创建时间
    auto now = std::chrono::system_clock::now();
    header.createTime = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count();

    // 先写入头部（校验和和总大小稍后更新）
    outFile.write(reinterpret_cast<const char*>(&header), sizeof(header));
    if (!outFile.good()) {
        std::cerr << "写入包头部失败" << std::endl;
        return false;
    }

    return true;
}

bool AssetPacker::WriteResourceMetadata(std::ofstream& outFile) {
    // 写入所有资源元数据
    for (auto& metadata : m_metadataList) {
        outFile.write(reinterpret_cast<const char*>(&metadata), sizeof(metadata));
        if (!outFile.good()) {
            std::cerr << "写入资源元数据失败" << std::endl;
            return false;
        }
    }

    return true;
}

bool AssetPacker::WriteResourceData(std::ofstream& outFile) {
    // 计算资源数据的偏移量
    uint64_t currentOffset = sizeof(ResourcePackageHeader) + 
                           m_metadataList.size() * sizeof(ResourceMetadata);

    // 更新元数据中的偏移量并写入资源数据
    for (size_t i = 0; i < m_metadataList.size(); ++i) {
        // 更新元数据中的偏移量
        m_metadataList[i].offset = currentOffset;

        // 写入资源数据
        outFile.write(reinterpret_cast<const char*>(m_resourceDataList[i].data()), m_resourceDataList[i].size());
        if (!outFile.good()) {
            std::cerr << "写入资源数据失败，资源索引: " << i << std::endl;
            return false;
        }

        // 更新当前偏移量
        currentOffset += m_resourceDataList[i].size();
    }

    // 更新包文件大小
    m_totalSize = currentOffset;

    // 重新写入更新后的元数据
    outFile.seekp(sizeof(ResourcePackageHeader), std::ios::beg);
    if (!outFile.good()) {
        std::cerr << "定位到元数据位置失败" << std::endl;
        return false;
    }

    for (const auto& metadata : m_metadataList) {
        outFile.write(reinterpret_cast<const char*>(&metadata), sizeof(metadata));
        if (!outFile.good()) {
            std::cerr << "重新写入资源元数据失败" << std::endl;
            return false;
        }
    }

    // 更新包头部的总大小和校验和
    outFile.seekp(0, std::ios::beg);
    if (!outFile.good()) {
        std::cerr << "定位到包头部位置失败" << std::endl;
        return false;
    }

    ResourcePackageHeader header;
    outFile.read(reinterpret_cast<char*>(&header), sizeof(header));
    if (!outFile.good()) {
        std::cerr << "读取包头部失败" << std::endl;
        return false;
    }

    // 更新总大小
    header.totalSize = m_totalSize;

    // 计算校验和
    outFile.seekp(sizeof(header), std::ios::beg);
    std::vector<uint8_t> dataToChecksum(m_totalSize - sizeof(header));
    outFile.read(reinterpret_cast<char*>(dataToChecksum.data()), dataToChecksum.size());
    if (!outFile.good()) {
        std::cerr << "读取数据计算校验和失败" << std::endl;
        return false;
    }

    header.checksum = CalculateChecksum(dataToChecksum.data(), dataToChecksum.size());

    // 重新写入头部
    outFile.seekp(0, std::ios::beg);
    outFile.write(reinterpret_cast<const char*>(&header), sizeof(header));
    if (!outFile.good()) {
        std::cerr << "重新写入包头部失败" << std::endl;
        return false;
    }

    return true;
}

uint32_t AssetPacker::CalculateChecksum(const void* data, size_t size) const {
    // 使用简单的CRC32校验和
    const uint32_t CRC32_POLY = 0xEDB88320;
    uint32_t crc = 0xFFFFFFFF;
    const uint8_t* bytes = static_cast<const uint8_t*>(data);

    for (size_t i = 0; i < size; ++i) {
        crc ^= bytes[i];
        for (int j = 0; j < 8; ++j) {
            if (crc & 1) {
                crc = (crc >> 1) ^ CRC32_POLY;
            } else {
                crc >>= 1;
            }
        }
    }

    return ~crc;
}

void AssetPacker::CalculateHash(const void* data, size_t size, char* outHash) const {
    // 使用简单的哈希算法（实际项目中应使用SHA-256等安全哈希算法）
    // 这里使用FNV-1a哈希算法生成32字节的哈希字符串
    const uint64_t FNV_PRIME_64 = 1099511628211ULL;
    const uint64_t FNV_OFFSET_64 = 14695981039346656037ULL;

    uint64_t hash = FNV_OFFSET_64;
    const uint8_t* bytes = static_cast<const uint8_t*>(data);

    for (size_t i = 0; i < size; ++i) {
        hash ^= bytes[i];
        hash *= FNV_PRIME_64;
    }

    // 将哈希转换为32字节的十六进制字符串
    std::stringstream ss;
    ss << std::hex << std::setw(16) << std::setfill('0') << hash;
    std::string hashStr = ss.str();
    strncpy(outHash, hashStr.c_str(), 32);
    outHash[31] = '\0';
}

ResourceType AssetPacker::DetectResourceType(const std::string& filePath) const {
    // 根据文件扩展名检测资源类型
    std::string ext = fs::path(filePath).extension().string();
    std::transform(ext.begin(), ext.end(), ext.begin(), ::tolower);

    if (ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".bmp" || ext == ".tga" || ext == ".dds" || ext == ".ktx2") {
        return ResourceType::TEXTURE_2D;
    } else if (ext == ".obj" || ext == ".fbx" || ext == ".gltf" || ext == ".glb" || ext == ".mdl") {
        return ResourceType::MODEL;
    } else if (ext == ".mat" || ext == ".mtl") {
        return ResourceType::MATERIAL;
    } else if (ext == ".hlsl" || ext == ".glsl" || ext == ".vert" || ext == ".frag" || ext == ".comp" || ext == ".shader") {
        return ResourceType::SHADER;
    } else if (ext == ".wav" || ext == ".mp3" || ext == ".ogg" || ext == ".flac") {
        return ResourceType::SOUND;
    } else if (ext == ".anim" || ext == ".animation") {
        return ResourceType::ANIMATION;
    } else if (ext == ".particle" || ext == ".psys") {
        return ResourceType::PARTICLE_SYSTEM;
    } else if (ext == ".lua" || ext == ".py" || ext == ".js" || ext == ".script") {
        return ResourceType::SCRIPT;
    } else {
        return ResourceType::UNKNOWN;
    }
}

std::string AssetPacker::GetResourceName(const std::string& filePath) const {
    // 获取文件名（不含路径）作为资源名称
    std::string fileName = fs::path(filePath).filename().string();
    
    // 移除文件扩展名
    size_t dotPos = fileName.find_last_of('.');
    if (dotPos != std::string::npos) {
        fileName = fileName.substr(0, dotPos);
    }
    
    return fileName;
}

std::vector<uint8_t> AssetPacker::DeflateCompress(const std::vector<uint8_t>& input, int level) {
    std::vector<uint8_t> output;
    z_stream strm;
    memset(&strm, 0, sizeof(strm));
    
    // 初始化压缩流
    if (deflateInit(&strm, level) != Z_OK) {
        std::cerr << "DEFLATE压缩初始化失败" << std::endl;
        return output;
    }
    
    // 设置输入数据
    strm.next_in = const_cast<Bytef*>(input.data());
    strm.avail_in = static_cast<uInt>(input.size());
    
    // 分配输出缓冲区
    size_t outputBufferSize = deflateBound(&strm, static_cast<uLong>(input.size()));
    output.resize(outputBufferSize);
    
    // 执行压缩
    strm.next_out = output.data();
    strm.avail_out = static_cast<uInt>(output.size());
    
    if (deflate(&strm, Z_FINISH) != Z_STREAM_END) {
        std::cerr << "DEFLATE压缩失败" << std::endl;
        deflateEnd(&strm);
        output.clear();
        return output;
    }
    
    // 调整输出大小
    output.resize(strm.total_out);
    
    // 清理
    deflateEnd(&strm);
    
    return output;
}

std::vector<uint8_t> AssetPacker::CompressResource(const std::vector<uint8_t>& input, CompressionType compressionType, int level) {
    switch (compressionType) {
        case CompressionType::DEFLATE:
            return DeflateCompress(input, level);
        case CompressionType::LZ4:
            return LZ4Compress(input, level);
        case CompressionType::ZSTD:
            return ZSTDCompress(input, level);
        case CompressionType::BC7:
        case CompressionType::ASTC: {
            // 纹理压缩需要额外的纹理信息
            TextureInfo textureInfo = {};
            // TODO: 从输入数据中提取纹理信息
            return TextureCompress(input, compressionType, textureInfo);
        }
        default:
            // 返回原始数据
            return input;
    }
}

std::vector<uint8_t> AssetPacker::DecompressResource(const std::vector<uint8_t>& input, CompressionType compressionType, size_t originalSize) {
    std::vector<uint8_t> output;
    output.resize(originalSize);
    
    // 根据压缩类型选择相应的解压缩算法
    switch (compressionType) {
        case CompressionType::DEFLATE: {
            z_stream strm;
            memset(&strm, 0, sizeof(strm));
            
            // 初始化解压缩流
            if (inflateInit(&strm) != Z_OK) {
                std::cerr << "DEFLATE解压缩初始化失败" << std::endl;
                output.clear();
                return output;
            }
            
            // 设置输入数据
            strm.next_in = const_cast<Bytef*>(input.data());
            strm.avail_in = static_cast<uInt>(input.size());
            
            // 设置输出缓冲区
            strm.next_out = output.data();
            strm.avail_out = static_cast<uInt>(output.size());
            
            // 执行解压缩
            if (inflate(&strm, Z_FINISH) != Z_STREAM_END) {
                std::cerr << "DEFLATE解压缩失败" << std::endl;
                inflateEnd(&strm);
                output.clear();
                return output;
            }
            
            // 清理
            inflateEnd(&strm);
            break;
        }
        case CompressionType::LZ4: {
            // LZ4解压缩（占位符实现）
            std::cerr << "LZ4解压缩功能尚未实现，返回原始数据" << std::endl;
            std::copy(input.begin(), input.end(), output.begin());
            break;
        }
        case CompressionType::ZSTD: {
            // ZSTD解压缩（占位符实现）
            std::cerr << "ZSTD解压缩功能尚未实现，返回原始数据" << std::endl;
            std::copy(input.begin(), input.end(), output.begin());
            break;
        }
        case CompressionType::BC7:
        case CompressionType::ASTC: {
            // 纹理压缩不需要解压缩，直接返回原始数据
            std::copy(input.begin(), input.end(), output.begin());
            break;
        }
        default:
            // 返回空数据
            output.clear();
            return output;
    }
    
    return output;
}

std::vector<uint8_t> AssetPacker::LZ4Compress(const std::vector<uint8_t>& input, int level) {
    // LZ4压缩（占位符实现，实际使用时需要替换为真实的LZ4库调用）
    std::cerr << "LZ4压缩功能尚未实现，返回原始数据" << std::endl;
    return input;
}

std::vector<uint8_t> AssetPacker::ZSTDCompress(const std::vector<uint8_t>& input, int level) {
    // ZSTD压缩（占位符实现，实际使用时需要替换为真实的ZSTD库调用）
    std::cerr << "ZSTD压缩功能尚未实现，返回原始数据" << std::endl;
    return input;
}

std::vector<uint8_t> AssetPacker::TextureCompress(const std::vector<uint8_t>& input, CompressionType compressionType, const TextureInfo& textureInfo) {
    // 纹理压缩（占位符实现，实际使用时需要替换为真实的纹理压缩库调用）
    std::cerr << "纹理压缩功能尚未实现，返回原始数据" << std::endl;
    return input;
}

} // namespace AmberPipeline
