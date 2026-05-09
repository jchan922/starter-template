import './HelloWorld.css'

const HelloWorld = ({
  message = 'Hello World',
  subtitle = 'Your starter is deployed. Start building.',
}) => {
  return (
    <div className="hello-world">
      <h1 className="title">{message}</h1>
      <p className="subtitle">{subtitle}</p>
    </div>
  )
}

export default HelloWorld
