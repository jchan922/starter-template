import './ComponentName.css'

export default function ComponentName({ value, error }) {
  if (error) return <p className="component-name-error">{error.message}</p>

  return (
    <div className="component-name">
      <p className="component-name-value">{value}</p>
    </div>
  )
}
