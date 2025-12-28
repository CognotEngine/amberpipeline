import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from "../lib/queryClient"
import App from './App'
import '../assets/styles/index.css'
import { initializeTheme } from '../themes/themeManager'

/**
 * 应用主入口
 * 集成TanStack Query和React 19
 */
const container = document.getElementById('root')
if (!container) {
  throw new Error('Root container not found')
}

// 初始化主题系统
initializeTheme()

const root = createRoot(container)

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)