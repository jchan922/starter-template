import './HelloWorld.css'

/**
 * HelloWorld — starter success state component.
 * Also serves as the pattern template for all new components.
 *
 * Pattern:
 *   - One .jsx and one .css per component, co-located
 *   - CSS scoped via nesting under a single root class
 *   - Props documented inline with defaults
 *   - No direct service calls — data passed as props
 */
const HelloWorld = ({ message = 'Hello World', subtitle = 'Your starter is deployed. Start building.' }) => {
  return (
    <div className="hello-world">
      <h1 className="hello-world-title">{message}</h1>
      <p className="hello-world-subtitle">{subtitle}</p>
    </div>
  )
}

export default HelloWorld
