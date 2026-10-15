/** Colour keys of session_prediction.laser_color_overrides[laserId]. */
export const LASER_COLORS = [
  'black',
  'grey',
  'red',
  'orange',
  'blue',
  'green',
  'purple',
  'yellow',
  'white',
  'skin_tone',
]

export const sameLaserColors = (a = {}, b = {}) =>
  LASER_COLORS.every((color) => Number(a?.[color] ?? 0) === Number(b?.[color] ?? 0))

export const isLaserColorOverride = (value, defaultValue) =>
  Number(value ?? 0) !== Number(defaultValue ?? 0)

export const laserColorOverrideCount = (values = {}, defaults = {}) =>
  LASER_COLORS.filter((color) => isLaserColorOverride(values?.[color], defaults?.[color])).length
