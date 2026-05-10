import './HelloWorld.css'

const HelloWorld = ({
  message = 'Hello World',
  subtitle = 'Your starter is deployed. Start building.',
}) => {
  const version = import.meta.env.VITE_APP_VERSION
  return (
    <div className="hello-world">
      <h1 className="hello-world-title">{message}</h1>
      <p className="hello-world-subtitle">{subtitle}</p>
      {version && <p className="hello-world-version">v{version}</p>}
    </div>
  )
}

export default HelloWorld
