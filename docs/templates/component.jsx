import './ComponentName.css'

export default function ComponentName({ value, error }) {
  if (error) return <p className="error">{error.message}</p>

  return (
    <div className="component-name">
      <p className="value">{value}</p>
    </div>
  )
}
