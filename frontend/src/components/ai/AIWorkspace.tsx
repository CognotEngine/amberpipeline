import { useActionState, useTransition } from 'react'
import { useSamSegmentation, useCharacterLayering, useSkeletonBinding } from '../../hooks/useAIInference'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { Loader2, CheckCircle2, AlertCircle, Layers, User, Bone, Scissors } from 'lucide-react'
import { EnterAnimation } from '../../lib/animations'

interface AIWorkspaceProps {
  currentMode: 'precision-cut' | 'character-layer' | 'skeleton-binding'
  imagePath: string
}

/**
 * AI推理工作区组件
 * 集成React 19 Actions和TanStack Query
 * 展示现代化的AI模型推理状态管理
 */
export function AIWorkspace({ currentMode, imagePath }: AIWorkspaceProps) {
  // TanStack Query Hooks
  const samMutation = useSamSegmentation()
  // const depthMutation = useDepthEstimation()
  const characterMutation = useCharacterLayering()
  const skeletonMutation = useSkeletonBinding()
  
  // React 19 Actions状态
  const [isPending, startTransition] = useTransition()
  const [, performAction] = useActionState(
    async (_prevState: any, formData: FormData) => {
      const mode = formData.get('mode') as string
      
      startTransition(async () => {
        try {
          switch (mode) {
            case 'precision-cut':
              // SAM分割需要File对象，这里模拟一个File对象
              const mockFile = new File([''], 'mock-image.png', { type: 'image/png' })
              await samMutation.performSegmentation({
                file: mockFile,
                mode: 'auto',
                points: []
              })
              break
            case 'character-layer':
              await characterMutation.mutateAsync({
                imagePath,
                layerCount: 4,
                faceDetection: true,
                hairSeparation: true,
                clothingDetails: 'high'
              })
              break
            case 'skeleton-binding':
              await skeletonMutation.mutateAsync({
                imagePath,
                jointCount: 18,
                bindingStrength: 75,
                autoAlign: true
              })
              break
          }
        } catch (error) {
          console.error('AI推理失败:', error)
        }
      })
      
      return { mode, timestamp: Date.now() }
    },
    null
  )

  /**
   * 获取当前模式的推理状态
   */
  const getCurrentMutation = () => {
    switch (currentMode) {
      case 'precision-cut':
        return {
          isLoading: samMutation.isLoading,
          isError: !!samMutation.error,
          isSuccess: !!samMutation.result?.success,
          data: samMutation.result,
          error: samMutation.error,
          reset: samMutation.reset
        } as any
      case 'character-layer':
        return characterMutation as any
      case 'skeleton-binding':
        return skeletonMutation as any
      default:
        return samMutation as any
    }
  }

  const currentMutation = getCurrentMutation()

  /**
   * 获取模式图标
   */
  const getModeIcon = () => {
    switch (currentMode) {
      case 'precision-cut':
        return <Scissors className="w-5 h-5" />
      case 'character-layer':
        return <User className="w-5 h-5" />
      case 'skeleton-binding':
        return <Bone className="w-5 h-5" />
      default:
        return <Layers className="w-5 h-5" />
    }
  }

  /**
   * 获取模式标题
   */
  const getModeTitle = () => {
    switch (currentMode) {
      case 'precision-cut':
        return '精细抠图'
      case 'character-layer':
        return '人物分层'
      case 'skeleton-binding':
        return '骨骼绑定'
      default:
        return 'AI推理'
    }
  }

  /**
   * 获取模式描述
   */
  const getModeDescription = () => {
    switch (currentMode) {
      case 'precision-cut':
        return '使用SAM模型进行高精度图像分割'
      case 'character-layer':
        return 'AI驱动的人物结构分层处理'
      case 'skeleton-binding':
        return '3D骨骼与2D图像的智能绑定'
      default:
        return 'AI模型推理'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 头部信息 */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          {getModeIcon()}
          <h3 className="text-lg font-semibold">{getModeTitle()}</h3>
        </div>
        <p className="text-sm text-muted-foreground">{getModeDescription()}</p>
      </div>

      {/* 推理状态显示 */}
      <div className="flex-1 space-y-4">
        {/* 当前状态 */}
        {currentMutation.isLoading && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>AI推理进行中</AlertTitle>
            <AlertDescription>
              正在处理图像，请稍候...
            </AlertDescription>
          </Alert>
        )}

        {currentMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>推理失败</AlertTitle>
            <AlertDescription>
              {currentMutation.error instanceof Error 
                ? currentMutation.error.message 
                : '未知错误，请重试'}
            </AlertDescription>
          </Alert>
        )}

        {currentMutation.isSuccess && currentMutation.data && (
          <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>推理完成</AlertTitle>
            <AlertDescription>
              推理时间: {currentMutation.data.inferenceTime?.toFixed(2)}s
              {currentMutation.data.metadata && (
                <div className="mt-2 text-xs">
                  处理参数: {JSON.stringify(currentMutation.data.metadata, null, 2)}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* 操作按钮 */}
        <form action={performAction} className="space-y-4">
          <input type="hidden" name="mode" value={currentMode} />
          
          <div className="flex space-x-3">
            <Button
              type="submit"
              disabled={isPending || currentMutation.isLoading}
              className="flex-1"
            >
              {(isPending || currentMutation.isLoading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              开始{getModeTitle()}
            </Button>
            
            {currentMutation.isSuccess && (
              <Button
                type="button"
                variant="outline"
                onClick={() => currentMutation.reset()}
              >
                重置
              </Button>
            )}
          </div>
        </form>

        {/* 进度条 */}
        {(isPending || currentMutation.isLoading) && (
          <div className="space-y-2">
            <Progress value={66} className="w-full" />
            <p className="text-xs text-muted-foreground text-center">
              AI模型正在处理您的图像...
            </p>
          </div>
        )}

        {/* 结果预览 */}
        {currentMutation.isSuccess && currentMutation.data?.data && (
          <Card className={`border-green-200 ${EnterAnimation.FADE_IN_CONTAINER}`}>
            <CardHeader>
              <CardTitle className="text-sm">推理结果</CardTitle>
              <CardDescription>AI模型输出数据</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-3">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(currentMutation.data.data, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}