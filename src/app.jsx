import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from '@/pages/index'
import '@/styles/app.css'

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <HomePage />,
    },
  ],
  { basename: import.meta.env.BASE_URL }
)

const version = import.meta.env.VITE_APP_VERSION

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      {version && <span className="app-version">v{version}</span>}
    </>
  )
}
