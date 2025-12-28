import React, { useState, useRef, useCallback } from 'react';
import { sx } from '@/themes/themeUtils';

interface DragNumberProps {
  /** 输入值 */
  value: number;
  /** 最小值 */
  min?: number;
  /** 最大值 */
  max?: number;
  /** 步长 */
  step?: number;
  /** 是否显示百分比 */
  isPercentage?: boolean;
  /** 小数位数 */
  decimalPlaces?: number;
  /** 是否禁用 */
  disabled?: boolean;
  /** 值变化事件处理函数 */
  onChange?: (value: number) => void;
  /** 额外的CSS类名 */
  className?: string;
}

/**
 * 数值拖拽组件
 * 功能：实现类似After Effects的数值文本拖拽功能，鼠标左右拖拽可改变数值
 */
export const DragNumber: React.FC<DragNumberProps> = ({
  value,
  min = -Infinity,
  max = Infinity,
  step = 1,
  isPercentage = false,
  decimalPlaces = 0,
  disabled = false,
  onChange,
  className
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startValueRef = useRef(0);
  const lastXRef = useRef(0);
  const accelerationRef = useRef(1);

  // 格式化显示值
  const displayValue = (() => {
    const val = value ?? 0;
    const formatted = val.toFixed(decimalPlaces);
    return isPercentage ? `${formatted}%` : formatted;
  })();

  // 限制值在有效范围内
  const clampValue = useCallback((val: number) => {
    return Math.max(min, Math.min(max, val));
  }, [min, max]);

  // 处理鼠标按下事件
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (disabled) return;
    
    setIsDragging(true);
    startXRef.current = event.clientX;
    lastXRef.current = event.clientX;
    startValueRef.current = value;
    accelerationRef.current = 1;
    
    // 添加全局事件监听器
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseUp);
    
    // 防止文本选择
    event.preventDefault();
  }, [disabled, value]);

  // 处理鼠标移动事件
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = event.clientX - lastXRef.current;
    lastXRef.current = event.clientX;
    
    // 计算加速度（拖拽距离越远，加速度越大）
    const totalDeltaX = Math.abs(event.clientX - startXRef.current);
    accelerationRef.current = 1 + (totalDeltaX / 100) * 2;
    
    // 根据拖拽方向和距离计算新值
    let deltaValue = deltaX * (step * accelerationRef.current) * 0.1;
    
    // 按住Shift键增加步长
    if (event.shiftKey) {
      deltaValue *= 10;
    }
    
    // 按住Alt键减小步长
    if (event.altKey) {
      deltaValue *= 0.1;
    }
    
    const newValue = clampValue(startValueRef.current + deltaValue);
    if (onChange) {
      onChange(newValue);
    }
  }, [isDragging, step, clampValue, onChange]);

  // 处理鼠标释放事件
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    
    // 移除全局事件监听器
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mouseleave', handleMouseUp);
  }, [handleMouseMove]);

  return (
    <span
      className={sx(
        ['cursor-ew-resize', 'select-none', 'font-Inter'],
        {
          'bg.surface hover:bg.hover text.accent border.default px-2 py-0.5 border.roundedSm active:bg.surface-elevated active:border.accent state.transition': !disabled,
          'bg.surface text.disabled border.border-light cursor-not-allowed opacity-70': disabled
        },
        className
      )}
      onMouseDown={handleMouseDown}
      style={{ fontSize: '11px' }}
    >
      {displayValue}
    </span>
  );
};