import {createThemes, type Palette} from '@bsky.app/alf'

// Catppuccin Mocha palette with Mauve accent
const CATPPUCCIN_MOCHA: Palette = {
  white: '#FFFFFF',
  black: '#000000',
  like: '#f38ba8',

  // Contrast scale (light → dark). Note: dark theme is built via invertPalette()
  contrast_0: '#cdd6f4', // Text
  contrast_25: '#bac2de', // Subtext 1
  contrast_50: '#a6adc8', // Subtext 0
  contrast_100: '#9399b2', // Overlay 2
  contrast_200: '#7f849c', // Overlay 1
  contrast_300: '#6c7086', // Overlay 0
  contrast_400: '#585b70', // Surface 2
  contrast_500: '#45475a', // Surface 1
  contrast_600: '#313244', // Surface 0
  contrast_700: '#1e1e2e', // Base
  contrast_800: '#181825', // Mantle
  contrast_900: '#11111b', // Crust
  contrast_950: '#0b0b12', // Extra dark (approx)
  contrast_975: '#07070d', // Extra dark (approx)
  contrast_1000: '#1e1e2e', // Background for dark theme

  // Primary = Mauve
  primary_25: '#f2eaff',
  primary_50: '#eadcff',
  primary_100: '#e1ceff',
  primary_200: '#d6bdff',
  primary_300: '#cca9ff',
  primary_400: '#c193ff',
  primary_500: '#cba6f7', // Mauve
  primary_600: '#b58be6',
  primary_700: '#9e73cf',
  primary_800: '#875eb8',
  primary_900: '#6e4a98',
  primary_950: '#583c7a',
  primary_975: '#422e5d',

  // Positive = Green
  positive_25: '#f2fbf0',
  positive_50: '#e6f7e1',
  positive_100: '#d3f3ca',
  positive_200: '#bbeeb0',
  positive_300: '#a6e3a1', // base green
  positive_400: '#8bd88a',
  positive_500: '#6fcd75',
  positive_600: '#54b95f',
  positive_700: '#459c52',
  positive_800: '#377d43',
  positive_900: '#2d6438',
  positive_950: '#244e2d',
  positive_975: '#1c3c24',

  // Negative = Red
  negative_25: '#fff1f4',
  negative_50: '#ffe4e9',
  negative_100: '#ffd1da',
  negative_200: '#ffb6c5',
  negative_300: '#fca7b8',
  negative_400: '#f691a6',
  negative_500: '#f38ba8', // Red
  negative_600: '#e16f8f',
  negative_700: '#c85879',
  negative_800: '#a74662',
  negative_900: '#883a52',
  negative_950: '#6a2f42',
  negative_975: '#4f2433',
}

const THEMES = createThemes({
  defaultPalette: CATPPUCCIN_MOCHA,
  subduedPalette: CATPPUCCIN_MOCHA,
})

export const themes = {
  lightPalette: THEMES.light.palette,
  darkPalette: THEMES.dark.palette,
  dimPalette: THEMES.dim.palette,
  light: THEMES.light,
  dark: THEMES.dark,
  dim: THEMES.dim,
}

/**
 * @deprecated use ALF and access palette from `useTheme()`
 */
export const lightPalette = THEMES.light.palette
/**
 * @deprecated use ALF and access palette from `useTheme()`
 */
export const darkPalette = THEMES.dark.palette
/**
 * @deprecated use ALF and access palette from `useTheme()`
 */
export const dimPalette = THEMES.dim.palette
/**
 * @deprecated use ALF and access theme from `useTheme()`
 */
export const light = THEMES.light
/**
 * @deprecated use ALF and access theme from `useTheme()`
 */
export const dark = THEMES.dark
/**
 * @deprecated use ALF and access theme from `useTheme()`
 */
export const dim = THEMES.dim
