import * as React from 'react';
import { sx } from '@/themes/themeUtils';
import * as LucideIcons from 'lucide-react';

type LucideIconName = keyof typeof LucideIcons;

type IconProps = Omit<React.ComponentProps<'svg'>, 'ref'> & {
  name: LucideIconName;
  size?: number;
  semantic?: string[];
};

/**
 * 语义化图标组件
 * 功能：封装Lucide图标，自动注入text-foreground颜色，支持主题适配
 * 使用示例：
 * <SemanticIcon name="Wrench" size={24} semantic={['state.hover']} />
 */
const SemanticIcon: React.FC<IconProps> = ({ 
  name, 
  className, 
  size = 24, 
  semantic = [],
  ...props 
}) => {
  // 从Lucide图标库中获取对应的图标组件
  const IconComponent = LucideIcons[name] as React.ComponentType<any>;
  
  if (!IconComponent) {
    console.warn(`Icon ${name} not found in Lucide icons`);
    return null;
  }
  
  // 合并所有样式，自动注入text-foreground颜色
  const finalStyles = sx(
    [...semantic, 'state.transition'],
    {
      'text-foreground': true // 自动应用text-foreground颜色
    },
    className
  );

  return (
    <IconComponent
      size={size}
      className={finalStyles}
      {...props}
    />
  );
};

SemanticIcon.displayName = 'SemanticIcon';

export { SemanticIcon };
export type { IconProps };
