# Canvas 功能模块实现逻辑与联动分析

## 项目概述

本文档详细分析了 AmberPipeline 项目中 Canvas 模块的五个核心功能实现逻辑，以及它们之间的联动关系、数据交互流程和状态同步机制。

## 1. 文件菜单新建画布功能逻辑

### 实现位置
- `f:\goting\AmberPipeline\frontend\src\modules\canvas\MainCanvas.tsx`

### 核心实现
```typescript
// 文件菜单新建画布功能
const handleFileNew = () => {
  createTab({
    title: t('canvas.title', { number: tabs.length + 1 }),
    mode: currentMode,
    content: { width: 1920, height: 1080 }
  });
};
```

### 功能流程
1. **触发方式**：通过文件菜单的"新建"选项触发
2. **参数准备**：生成新标签页标题（包含序号）、当前画布模式、默认画布尺寸
3. **创建操作**：调用 `createTab` 函数创建新标签页
4. **状态更新**：标签页列表更新，新标签页自动激活

## 2. 工具栏中不同画布之间的切换功能逻辑

### 实现位置
- `f:\goting\AmberPipeline\frontend\src\modules\canvas\MainCanvas.tsx`
- `f:\goting\AmberPipeline\frontend\src\modules\canvas\components\TabSystem.tsx`

### 核心实现
```typescript
// 工具栏画布切换
const handleTabSelect = (tabId: string) => {
  selectTab(tabId);
  // 触发工具栏状态同步
  onTabChange(tabId);
};
```

### 功能流程
1. **触发方式**：通过工具栏的画布切换按钮或标签栏直接点击标签
2. **状态同步**：更新 `activeTabId` 状态，切换当前激活的画布
3. **画布渲染**：根据新激活的画布 ID，调用对应的渲染器组件
4. **工具栏更新**：同步更新工具栏中与当前画布相关的状态

## 3. 标签栏中不同画布的显示与管理逻辑

### 实现位置
- `f:\goting\AmberPipeline\frontend\src\modules\canvas\components\TabSystem.tsx`

### 核心功能
- **标签页显示**：动态渲染当前所有画布标签
- **激活状态**：高亮显示当前激活的画布标签
- **关闭功能**：点击关闭按钮或右键菜单关闭画布
- **重命名功能**：双击标签可重命名画布
- **滚轮切换**：鼠标悬停在标签栏时通过滚轮切换画布

### 核心实现
```typescript
// 标签栏容器
<div className={sx(['flex', 'items-center', 'overflow-x-auto', 'overflow-y-hidden', 'bg.bg-secondary', 'border-b.border-border'])} onWheel={handleWheel}>
  {tabs.map(tab => (
    <TabItem
      key={tab.id}
      tab={tab}
      isActive={tab.id === activeTabId}
      isEditing={editingTabId === tab.id}
      onSelect={() => handleSelectTab(tab.id)}
      onClose={() => handleCloseTab(tab.id)}
      onStartEdit={() => setEditingTabId(tab.id)}
      onRename={handleRenameTab}
    />
  ))}
</div>
```

### 滚轮切换逻辑
```typescript
const handleWheel = (event: React.WheelEvent) => {
  event.preventDefault();
  const currentIndex = tabs.findIndex(tab => tab.id === activeTabId);
  if (currentIndex === -1) return;
  
  let nextIndex;
  if (event.deltaY > 0) {
    nextIndex = Math.min(currentIndex + 1, tabs.length - 1);
  } else {
    nextIndex = Math.max(currentIndex - 1, 0);
  }
  
  handleSelectTab(tabs[nextIndex].id);
};
```

## 4. 骨骼层级/父子关系定义功能逻辑

### 实现位置
- `f:\goting\AmberPipeline\frontend\src\modules\canvas\components\Renderers\StageCRenderer.tsx`

### 核心功能
- **骨骼点连接**：在骨骼绑定模式下，连接两个骨骼点形成父子关系
- **连接命名**：为骨骼连接定义名称
- **权重编辑**：调整连接的权重值

### 核心实现
```typescript
// 连接骨骼点
const connectSkeletonPoints = (point1: SkeletonPoint, point2: SkeletonPoint) => {
  // 更新第一个点的子节点
  dispatch({
    type: 'UPDATE_SKELETON_POINT',
    payload: {
      id: point1.id,
      updates: {
        childrenIds: [...(point1.childrenIds || []), point2.id]
      }
    }
  });
  
  // 更新第二个点的父节点
  dispatch({
    type: 'UPDATE_SKELETON_POINT',
    payload: {
      id: point2.id,
      updates: {
        parentIds: [...(point2.parentIds || []), point1.id]
      }
    }
  });
};
```

### 名称定义流程
1. **连接创建**：用户在画布上连接两个骨骼点
2. **名称输入**：自动弹出名称输入框，或通过属性面板编辑
3. **状态更新**：将连接名称保存到 `CanvasContext` 中的骨骼点数据
4. **画布渲染**：在画布上显示连接名称

## 5. 标签栏添加按钮的功能实现逻辑

### 实现位置
- `f:\goting\AmberPipeline\frontend\src\modules\canvas\components\TabSystem.tsx`

### 核心实现
```typescript
// 新建标签页按钮
<Button
  variant="secondary"
  size="small"
  className={sx(['ml-2', 'w-8', 'h-8', 'flex', 'items-center', 'justify-center', 'text.text-secondary', 'hover:bg.hover', 'hover:text.text-primary', 'transition-colors', 'rounded-full'])}
  onClick={handleCreateNewTab}
  title={t('common.add')}
>
  <Plus size={16} />
</Button>
```

### 功能流程
1. **触发方式**：点击标签栏右侧的"+"按钮
2. **参数准备**：生成新标签页标题、默认画布模式和尺寸
3. **创建操作**：调用 `onTabCreate` 回调函数创建新标签页
4. **自动激活**：新创建的标签页自动成为当前激活的画布

## 模块间联动关系分析

### 1. 画布创建与标签栏更新联动
- **触发事件**：文件菜单新建或标签栏添加按钮点击
- **数据流向**：
  1. `MainCanvas.tsx` 中的 `handleFileNew` 或 `TabSystem.tsx` 中的 `handleCreateNewTab` 被调用
  2. **统一调用入口**：两个函数都调用 `useTabSystem.ts` 中的 `createTab` 函数，确保创建逻辑一致
  3. **ID 生成**：`createTab` 函数使用 `nanoid(8)` 生成唯一的标签 ID
  4. 新标签页数据通过 Props 传递给 `TabSystem` 组件
  5. `TabSystem` 重新渲染，显示新创建的标签

### 2. 画布切换与工具栏同步联动
- **触发事件**：标签栏点击标签或滚轮切换
- **数据流向**：
  1. `TabSystem` 中的 `handleSelectTab` 被调用
  2. 调用 `onTabSelect` 回调通知父组件
  3. `MainCanvas` 更新 `activeTabId` 状态
  4. 调用 `onTabChange` 函数更新工具栏状态
  5. 根据新的 `activeTabId` 渲染对应的画布内容

### 3. 标签栏操作与画布状态联动
- **触发事件**：标签重命名、关闭
- **数据流向**：
  1. `TabSystem` 中的 `handleRenameTab` 或 `handleCloseTab` 被调用
  2. 调用对应的回调函数（`onTabRename` 或 `onTabClose`）
  3. 父组件更新标签页列表状态
  4. 画布内容根据新的标签页状态进行调整

### 4. 骨骼层级定义与画布渲染联动
- **触发事件**：用户在骨骼绑定模式下连接骨骼点
- **数据流向**：
  1. `StageCRenderer.tsx` 中的 `connectSkeletonPoints` 被调用
  2. 通过 `dispatch` 更新 `CanvasContext` 中的骨骼点数据
  3. 画布重新渲染，显示新的连接关系
  4. 属性面板更新，显示当前连接的详细信息

## 数据交互流程

### 1. 画布创建流程
```
用户操作 → 文件菜单/添加按钮 → handleFileNew/handleCreateNewTab → createTab → tabs 状态更新 → TabSystem 重新渲染 → 新画布显示
```

### 2. 画布切换流程
```
用户操作 → 标签点击/滚轮 → handleSelectTab → onTabSelect → activeTabId 更新 → 画布渲染器切换 → 工具栏状态同步
```

### 3. 标签操作流程
```
用户操作 → 标签双击/关闭按钮 → handleRenameTab/handleCloseTab → onTabRename/onTabClose → tabs 状态更新 → TabSystem 重新渲染
```

### 4. 骨骼层级定义流程
```
用户操作 → 连接骨骼点 → connectSkeletonPoints → dispatch 更新 CanvasContext → 画布重新渲染 → 连接名称显示
```

## 状态同步机制

### 1. 基于 Props 的父子组件同步
- **实现方式**：通过 Props 将状态从父组件传递给子组件
- **使用场景**：标签页列表、激活状态等从 `MainCanvas` 传递给 `TabSystem`
- **更新机制**：父组件状态更新时，子组件自动重新渲染

### 2. 基于回调函数的状态更新
- **实现方式**：子组件通过调用父组件传递的回调函数更新状态
- **使用场景**：标签创建、关闭、切换、重命名等操作
- **核心回调**：`onTabCreate`、`onTabClose`、`onTabSelect`、`onTabRename`

### 3. 基于 Context 的 Tab 隔离状态管理
- **实现位置**：`f:\goting\AmberPipeline\frontend\src\modules\canvas\composables\CanvasContext.tsx`
- **使用场景**：骨骼点数据、图层数据等画布相关数据，按 Tab ID 隔离存储
- **核心实现**：将状态存储为 `Record<string, CanvasState>` 结构，每个 Tab 拥有独立的画布状态
- **更新机制**：通过 `tabDispatch` 函数仅更新当前激活 Tab 的状态，确保状态隔离
- **生命周期管理**：提供 `createTabState` 和 `deleteTabState` 方法管理 Tab 状态的创建和销毁
- **状态同步**：通过 `activeTabId` 确定当前操作的 Tab 状态，实现 Tab 切换时的状态同步

### 4. 基于自定义 Hook 的状态封装
- **实现位置**：`f:\goting\AmberPipeline\frontend\src\modules\canvas\composables\useTabSystem.ts`
- **使用场景**：标签页系统的核心逻辑封装
- **功能**：提供标签页的创建、选择、关闭、更新等核心操作
- **ID 生成**：使用 `nanoid(8)` 生成唯一的标签页 ID，替代 `Date.now()`，确保在高并发场景下的 ID 唯一性
- **统一接口**：提供 `createTab` 函数作为统一的标签创建入口，确保所有标签创建操作都使用相同的 ID 生成策略和参数处理逻辑

## 代码结构与组件关系

### 主要组件结构
```
App.tsx
└── MainCanvas.tsx
    ├── TabSystem.tsx        # 标签栏组件
    ├── Toolbar.tsx          # 工具栏组件
    ├── RenderDispatcher.tsx # 渲染调度器
    │   ├── StageRenderer.tsx    # 舞台渲染器
    │   ├── StageCRenderer.tsx   # 骨骼绑定渲染器
    │   └── OtherRenderers...    # 其他模式渲染器
    └── CanvasContextProvider     # 全局状态管理
```

### 核心组件职责
- **App.tsx**：应用入口，管理全局状态
- **MainCanvas.tsx**：画布主容器，协调各子组件
- **TabSystem.tsx**：标签栏组件，负责画布标签的显示与管理
- **Toolbar.tsx**：工具栏组件，提供画布操作按钮
- **RenderDispatcher.tsx**：根据当前模式和画布 ID 选择对应的渲染器
- **StageRenderer.tsx/StageCRenderer.tsx**：具体的画布渲染实现
- **CanvasContext.tsx**：全局状态管理，提供画布相关数据

## 总结

通过对 Canvas 模块五个核心功能的分析，我们可以看到：

1. **组件化设计**：将标签页系统封装为独立的 `TabSystem` 组件，提高了代码的可维护性和可复用性
2. **状态管理**：采用多种状态管理方式（Props、Context、自定义 Hook），确保不同组件间的状态同步
3. **联动机制**：通过回调函数和事件通知，实现了各功能模块之间的紧密协作
4. **用户体验**：实现了丰富的交互功能，如滚轮切换、双击重命名等，提升了用户操作效率

这些设计使得 Canvas 模块具有良好的扩展性和可维护性，能够支持后续功能的不断迭代和优化。