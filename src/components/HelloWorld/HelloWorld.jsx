import './HelloWorld.css'

const HelloWorld = ({
  message = 'Hello World',
  subtitle = 'Your starter is deployed. Start building.',
}) => {
  return (
    <div className="hello-world">
      <h1 className="hello-world-title">{message}</h1>
      <p className="hello-world-subtitle">{subtitle}</p>
    </div>
  )
}

export default HelloWorld
