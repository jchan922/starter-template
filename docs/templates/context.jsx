import { createContext, useContext, useState } from 'react'

const MyContext = createContext(null)

export function MyProvider({ children }) {
  const [state, setState] = useState(null)

  return <MyContext.Provider value={{ state, setState }}>{children}</MyContext.Provider>
}

// Consume via hook — never import MyContext directly outside this file.
export function useMyContext() {
  const ctx = useContext(MyContext)
  if (!ctx) throw new Error('useMyContext must be used inside MyProvider')
  return ctx
}
