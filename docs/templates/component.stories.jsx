import ComponentName from './ComponentName'

export default {
  title: 'Components/ComponentName',
  component: ComponentName,
}

export const Default = {
  args: { value: 'Hello' },
}

export const WithError = {
  args: { error: { message: 'Something went wrong' } },
}
