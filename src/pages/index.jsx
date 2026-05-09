import HelloWorld from '@/components/HelloWorld/HelloWorld'

// Pages are composition only — no logic, no fetch calls. Use hooks for data.
export default function HomePage() {
  return <HelloWorld />
}
