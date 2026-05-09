/**
 * Shared utilities — pure functions only.
 * No imports from services, hooks, or components.
 * No side effects.
 */

/**
 * Formats a date to a readable string.
 * @param {Date|string} date
 * @param {Intl.DateTimeFormatOptions} [options]
 */
export const formatDate = (date, options = { year: 'numeric', month: 'long', day: 'numeric' }) => {
  return new Intl.DateTimeFormat('en-US', options).format(new Date(date))
}

/**
 * Truncates a string to a max length with ellipsis.
 * @param {string} str
 * @param {number} max
 */
export const truncate = (str, max = 100) => {
  if (!str || str.length <= max) return str
  return `${str.slice(0, max)}…`
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str
 */
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Generates a random ID string.
 * Not cryptographically secure — use for UI keys only.
 */
export const uid = () => Math.random().toString(36).slice(2, 9)

/**
 * Clamps a number between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
