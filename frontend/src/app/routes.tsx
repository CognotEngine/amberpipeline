import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App'

// 路由配置
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/precision-cut',
    element: <App />,
  },
  {
    path: '/character-layer',
    element: <App />,
  },
  {
    path: '/skeleton-binding',
    element: <App />,
  },
])

// 路由提供者组件
export function Routes() {
  return <RouterProvider router={router} />
}