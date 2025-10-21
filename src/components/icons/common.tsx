import {StyleSheet, type TextProps} from 'react-native'
import {
  Defs,
  LinearGradient,
  type PathProps,
  Stop,
  type SvgProps,
} from 'react-native-svg'
import {nanoid} from 'nanoid/non-secure'

import {tokens, useTheme} from '#/alf'

export type Props = {
  fill?: PathProps['fill']
  style?: TextProps['style']
  size?: keyof typeof sizes
  gradient?: keyof typeof tokens.gradients
} & Omit<SvgProps, 'style' | 'size'>

export const sizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  '2xl': 32,
} as const

export function useCommonSVGProps(props: Props) {
  const t = useTheme()
  const {fill, size, gradient, ...rest} = props
  const style = StyleSheet.flatten(rest.style)
  const _size = Number(size ? sizes[size] : rest.width || sizes.md)

  // Determine a safe default fill color. Avoid using the background color
  // (which can be applied as `style.color` by some parent containers) so that
  // icons don’t become invisible by matching their pane/background.
  let _fill = fill as PathProps['fill']
  if (!_fill) {
    const styleColor = (style?.color as PathProps['fill']) || undefined
    // Background color of the current theme surface
    const bgColor = (t.atoms?.bg as any)?.backgroundColor as string | undefined

    const normalize = (c?: string) => (c ? c.trim().toLowerCase() : c)
    if (styleColor && normalize(styleColor) !== normalize(bgColor)) {
      _fill = styleColor
    } else {
      _fill = t.palette.contrast_0
    }
  }

  let gradientDef = null

  if (gradient && tokens.gradients[gradient]) {
    const id = gradient + '_' + nanoid()
    const config = tokens.gradients[gradient]
    _fill = `url(#${id})`
    gradientDef = (
      <Defs>
        <LinearGradient
          id={id}
          x1="0"
          y1="0"
          x2="100%"
          y2="0"
          gradientTransform="rotate(45)">
          {config.values.map(([stop, fill]) => (
            <Stop key={stop} offset={stop} stopColor={fill} />
          ))}
        </LinearGradient>
      </Defs>
    )
  }

  return {
    fill: _fill,
    size: _size,
    style,
    gradient: gradientDef,
    ...rest,
  }
}
