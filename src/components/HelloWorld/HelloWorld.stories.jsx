import HelloWorld from './HelloWorld'

/**
 * Storybook story template.
 * Copy this file for every new component.
 * Rename imports, title, and args to match.
 */
export default {
  title: 'Components/HelloWorld',
  component: HelloWorld,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    message: {
      control: 'text',
      description: 'Primary heading text',
    },
    subtitle: {
      control: 'text',
      description: 'Supporting subtitle text',
    },
  },
}

// Default story — renders with default props
export const Default = {}

// Custom message story — demonstrates prop control
export const CustomMessage = {
  args: {
    message: 'Ship it.',
    subtitle: 'Everything is wired up and ready to go.',
  },
}
