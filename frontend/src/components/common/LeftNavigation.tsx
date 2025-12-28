import * as React from 'react'
import { Scissors, Users, Bone, Play } from 'lucide-react'
import { useTranslation } from '../../i18n'
import { sx } from '../../themes/themeUtils'

// 导航模式类型定义
type NavigationMode = 'precision-cut' | 'character-layer' | 'skeleton-binding' | 'animation'

interface NavigationModeConfig {
  id: NavigationMode
  icon: React.ComponentType<{ className?: string }>
  translationKey: string
  descriptionKey: string
}

interface LeftNavigationProps {
  currentMode: NavigationMode
  onModeChange: (mode: NavigationMode) => void
}

// 定义导航模式列表
const navigationModes: NavigationModeConfig[] = [
  {
    id: 'precision-cut',
    icon: Scissors,
    translationKey: 'mode.precision-cut',
    descriptionKey: 'mode.precision-cut'
  },
  {
    id: 'character-layer',
    icon: Users,
    translationKey: 'mode.character-layer',
    descriptionKey: 'mode.character-layer'
  },
  {
    id: 'skeleton-binding',
    icon: Bone,
    translationKey: 'mode.skeleton-binding',
    descriptionKey: 'mode.skeleton-binding'
  },
  {
    id: 'animation',
    icon: Play,
    translationKey: 'mode.animation',
    descriptionKey: 'mode.animation'
  }
]

/**
 * 左侧极窄工具栏组件
 * 功能：提供画布切换功能，仅显示图标，点击图标切换不同画布
 */
export const LeftNavigation: React.FC<LeftNavigationProps> = ({
  currentMode,
  onModeChange
}) => {
  const { t } = useTranslation()
  const switchMode = (mode: NavigationMode) => {
    onModeChange(mode)
  }

  return (
    <div className={sx(['w-11', 'bg.surface', 'border-r.border.default', 'flex', 'flex-col', 'items-center', 'py-4', 'space-y-6', 'state.transition'])}>
      {/* 画布切换图标按钮 */}
      {navigationModes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => switchMode(mode.id)}
          className={sx(
            ['w-8', 'h-8', 'flex', 'items-center', 'justify-center', 'border.rounded-md', 'relative', 'group', 'cursor-pointer', 'overflow-hidden', 'state.transition'],
            {
              'bg.accent text.inverse shadow.lg scale-[1.1] ring-2 ring-accent/50': currentMode === mode.id,
              'bg.surface text.textTertiary hover:bg.hover hover:text.textPrimary hover:shadow.md hover:scale-[1.05]': currentMode !== mode.id
            }
          )}
          title={t(mode.translationKey)}
        >
          <mode.icon className="w-5 h-5 transition-transform duration-300 ease-in-out group-hover:scale-110" />
          {/* 悬停提示 */}
          <span className={sx(['absolute', 'left-full', 'ml-2', 'px-2', 'py-1', 'bg.elevated', 'text-xs', 'text.textPrimary', 'border.rounded-md', 'whitespace-nowrap', 'opacity-0', 'pointer-events-none', 'z-10', 'border.border.default', 'shadow.lg', 'group-hover:opacity-100', 'group-hover:translate-x-0', 'transition-all', 'duration-200', 'ease-out', 'transform', 'translate-x-2'])}>
            {t(mode.translationKey)}
          </span>
          {/* 点击波纹效果 */}
          <span className="absolute inset-0 border.rounded-full bg-white/20 transform scale-0 transition-transform duration-300 ease-out pointer-events-none"></span>
        </button>
      ))}
    </div>
  )
}