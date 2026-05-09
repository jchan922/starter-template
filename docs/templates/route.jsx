import MyComponent from '@/components/MyComponent/MyComponent'
import { useMyHook } from '@/hooks/useMyHook'

// Pages are composition only — no logic, no fetch calls. Use hooks for data.
export default function MyPage() {
  const { data, loading, error } = useMyHook()

  return <MyComponent data={data} loading={loading} error={error} />
}
