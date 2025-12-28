import React, { useEffect } from 'react';
import { Undo, Redo, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '../../../i18n';

/**
 * 撤销重做工具栏组件
 */
interface UndoRedoToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear?: () => void;
  showClear?: boolean;
}

export const UndoRedoToolbar: React.FC<UndoRedoToolbarProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  showClear = false
}) => {
  const { t } = useTranslation();
  
  // 快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z 或 Cmd+Z - 撤销
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          onUndo();
        }
      }
      
      // Ctrl+Y 或 Cmd+Shift+Z - 重做
      if (
        ((e.ctrlKey || e.metaKey) && e.key === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')
      ) {
        e.preventDefault();
        if (canRedo) {
          onRedo();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [canUndo, canRedo, onUndo, onRedo]);
  
  return (
    <div className="flex items-center gap-1 p-1 bg-background border border-border rounded-md">
      {/* 撤销按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        title={`${t('history.undo')} (Ctrl+Z)`}
        className="h-8 w-8 p-0"
      >
        <Undo size={16} />
      </Button>
      
      {/* 重做按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRedo}
        disabled={!canRedo}
        title={`${t('history.redo')} (Ctrl+Y)`}
        className="h-8 w-8 p-0"
      >
        <Redo size={16} />
      </Button>
      
      {/* 清除历史按钮（可选） */}
      {showClear && onClear && (
        <>
          <div className="w-px h-6 bg-border mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            title={t('history.clear')}
            className="h-8 w-8 p-0"
          >
            <RotateCcw size={16} />
          </Button>
        </>
      )}
    </div>
  );
};
