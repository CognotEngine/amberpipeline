import * as React from 'react';
import { cn } from '@/lib/utils';
import { sx, useComponentStyle } from '@/themes/themeUtils';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface SemanticAlertProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive' | 'warning' | 'success' | 'info';
  title?: string;
  description?: React.ReactNode;
  semantic?: string[];
  onClose?: () => void;
  showCloseButton?: boolean;
}

/**
 * 语义化提示框组件
 * 功能：提供符合主题样式的提示框，支持多种变体和可关闭功能
 * 使用示例：
 * <SemanticAlert variant="success" semantic={['border.roundedLg']}>
 *   <SemanticAlert.Title>操作成功</SemanticAlert.Title>
 *   <SemanticAlert.Description>数据已成功保存</SemanticAlert.Description>
 * </SemanticAlert>
 */
const SemanticAlert = React.forwardRef<HTMLDivElement, SemanticAlertProps>(
  ({ 
    className, 
    variant = 'default', 
    title, 
    description, 
    semantic = [],
    onClose,
    showCloseButton = false,
    children,
    ...props 
  }, ref) => {
    // 使用useComponentStyle获取主题配置的提示框样式
    const componentStyles = useComponentStyle({ 
      component: 'alert', 
      variant 
    });

    // 合并所有样式
    const finalStyles = cn(
      sx([...semantic, 'state.transition'], {
        'bg.surface border.default p-4 border-l-4': true,
        'border-l-accent': variant === 'default',
        'border-l-error': variant === 'destructive',
        'border-l-warning': variant === 'warning',
        'border-l-success': variant === 'success',
        'border-l-info': variant === 'info',
      }),
      componentStyles,
      className
    );

    // 根据变体获取图标
    const getIcon = () => {
      switch (variant) {
        case 'success':
          return <CheckCircle className="h-4 w-4 text.success" />;
        case 'warning':
          return <AlertTriangle className="h-4 w-4 text.warning" />;
        case 'destructive':
          return <X className="h-4 w-4 text.error" />;
        case 'info':
          return <Info className="h-4 w-4 text.info" />;
        default:
          return <Info className="h-4 w-4 text.info" />;
      }
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={finalStyles}
        {...props}
      >
        <div className="flex">
          {getIcon()}
          <div className="ml-3 w-0 flex-1">
            {title && (
              <h3 className={sx(['text.textPrimary text-sm font-medium'])}>
                {title}
              </h3>
            )}
            {description && (
              <div className={sx(['mt-1 text.textSecondary text-sm'])}>
                {description}
              </div>
            )}
            {children}
          </div>
          {showCloseButton && onClose && (
            <button
              type="button"
              className={sx(['ml-auto flex-shrink-0 text.textSecondary hover:text.textPrimary'])} 
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          )}
        </div>
      </div>
    );
  }
);
SemanticAlert.displayName = 'SemanticAlert';

// 定义子组件
const AlertTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn(sx(['text.textPrimary text-sm font-medium']), className)} {...props} />
);
AlertTitle.displayName = 'SemanticAlert.Title';

const AlertDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <div className={cn(sx(['mt-1 text.textSecondary text-sm']), className)} {...props} />
);
AlertDescription.displayName = 'SemanticAlert.Description';

// 创建带子组件的复合组件类型
type SemanticAlertComponent = typeof SemanticAlert & {
  Title: typeof AlertTitle;
  Description: typeof AlertDescription;
};

// 将子组件附加到主组件
(SemanticAlert as SemanticAlertComponent).Title = AlertTitle;
(SemanticAlert as SemanticAlertComponent).Description = AlertDescription;

export { SemanticAlert };
