import React from 'react'
import {type ColorSchemeName, useColorScheme} from 'react-native'
import {type ThemeName} from '@bsky.app/alf'

import {isWeb} from '#/platform/detection'
import {useThemePrefs} from '#/state/shell'
import {dark, dim, light} from '#/alf/themes'

export function useColorModeTheme(): ThemeName {
  const theme = useThemeName()

  React.useLayoutEffect(() => {
    updateDocument(theme)
  }, [theme])

  return theme
}

export function useThemeName(): ThemeName {
  const colorScheme = useColorScheme()
  const {colorMode, darkTheme} = useThemePrefs()

  return getThemeName(colorScheme, colorMode, darkTheme)
}

function getThemeName(
  colorScheme: ColorSchemeName,
  colorMode: 'system' | 'light' | 'dark',
  darkTheme?: ThemeName,
) {
  if (
    (colorMode === 'system' && colorScheme === 'light') ||
    colorMode === 'light'
  ) {
    return 'light'
  } else {
    return darkTheme ?? 'dim'
  }
}

function updateDocument(theme: ThemeName) {
  // @ts-ignore web only
  if (isWeb && typeof window !== 'undefined') {
    // @ts-ignore web only
    const html = window.document.documentElement
    // @ts-ignore web only
    const meta = window.document.querySelector('meta[name="theme-color"]')

    const bg = getBackgroundColor(theme)

    // remove any other color mode classes
    html.className = html.className.replace(/(theme)--\w+/g, '')
    html.classList.add(`theme--${theme}`)

    // ensure the page background itself matches the theme and scrolls with it
    // @ts-ignore web only
    html.style.backgroundColor = bg
    // @ts-ignore web only
    if (window.document.body) {
      // @ts-ignore web only
      window.document.body.style.backgroundColor = bg
    }
    // @ts-ignore web only
    const root = window.document.getElementById('root')
    if (root) {
      // @ts-ignore web only
      ;(root as HTMLElement).style.backgroundColor = bg
      // Also paint the main app wrapper (first child of #root) to handle cases
      // where the primary scroller is inside the app container (non-desktop mode)
      const appWrapper = (root as HTMLElement)
        .firstElementChild as HTMLElement | null
      if (appWrapper) {
        appWrapper.style.backgroundColor = bg
      }
    }

    // set color to 'theme-color' meta tag (for browser UI)
    meta?.setAttribute('content', bg)
  }
}

export function getBackgroundColor(theme: ThemeName): string {
  switch (theme) {
    case 'light':
      return light.atoms.bg.backgroundColor
    case 'dark':
      return dark.atoms.bg.backgroundColor
    case 'dim':
      return dim.atoms.bg.backgroundColor
    default:
      return dark.atoms.bg.backgroundColor
  }
}
