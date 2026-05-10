import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from '@/pages/index'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <HomePage />,
    },
  ],
  { basename: import.meta.env.BASE_URL }
)

export default function App() {
  return <RouterProvider router={router} />
}
