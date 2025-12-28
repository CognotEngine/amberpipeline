/**
 * UI组件统一导出
 * 功能：将所有语义化组件重新导出为标准组件名，实现组件系统的统一
 */

// 从语义化组件系统重新导出所有组件
export { SemanticButton as Button } from '../semantic/SemanticButton';
export { SemanticCard as Card } from '../semantic/SemanticCard';
export { SemanticAlert as Alert } from '../semantic/SemanticAlert';
export { SemanticProgress as Progress } from '../semantic/SemanticProgress';
export { SemanticTooltip as Tooltip } from '../semantic/SemanticTooltip';
export { SemanticInput as Input } from '../semantic/SemanticInput';
export { SemanticIcon as Icon } from '../semantic/SemanticIcon';
export { SemanticSlider as Slider } from '../semantic/SemanticSlider';
export { SemanticPropertyPanel as PropertyPanel, PropertyGroup, PropertyField } from '../semantic/SemanticPropertyPanel';

// 导出动画组件
export { Animated, AnimatedContainer, FadeIn } from '../animation';

// 导出动画工具
export { Animations } from '../../lib/animations';
