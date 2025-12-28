# AmberPipeline AI - ResourceSyncServer CMakeLists.txt
cmake_minimum_required(VERSION 3.15)

project(ResourceSyncServer VERSION 1.0.0)

# 设置C++标准
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# 查找依赖
find_package(Threads REQUIRED)

# 检查是否安装了nlohmann/json
find_path(NLOHMANN_JSON_INCLUDE_DIRS nlohmann/json.hpp)
if(NOT NLOHMANN_JSON_INCLUDE_DIRS)
    message(FATAL_ERROR "nlohmann/json library not found. Please install it.")
endif()

# 包含头文件目录
include_directories(
    ${PROJECT_SOURCE_DIR}/../include
    ${NLOHMANN_JSON_INCLUDE_DIRS}
)

# 添加源代码
set(SOURCES
    ResourceSyncServer.cpp
    ${PROJECT_SOURCE_DIR}/../src/ResourceManager.cpp
    ${PROJECT_SOURCE_DIR}/../src/ResourceTypes.cpp
)

# 添加可执行文件
add_executable(ResourceSyncServer ${SOURCES})

# 链接库
target_link_libraries(ResourceSyncServer
    Threads::Threads
)

# Windows平台特定设置
if(WIN32)
    target_link_libraries(ResourceSyncServer ws2_32)
endif()

# 设置输出目录
set_target_properties(ResourceSyncServer PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${PROJECT_SOURCE_DIR}/../bin
)

# 安装设置
install(TARGETS ResourceSyncServer
    RUNTIME DESTINATION bin
)
