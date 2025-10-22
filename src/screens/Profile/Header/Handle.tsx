import {View} from 'react-native'
import {type AppBskyActorDefs} from '@atproto/api'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {isInvalidHandle, sanitizeHandle} from '#/lib/strings/handles'
import {isIOS, isNative} from '#/platform/detection'
import {type Shadow} from '#/state/cache/types'
import {atoms as a, useTheme, web} from '#/alf'
import {NewskieDialog} from '#/components/NewskieDialog'
import {Text} from '#/components/Typography'
import * as Pills from '#/components/Pills'

export function ProfileHeaderHandle({
  profile,
  disableTaps,
}: {
  profile: Shadow<AppBskyActorDefs.ProfileViewDetailed>
  disableTaps?: boolean
}) {
  const t = useTheme()
  const {_} = useLingui()
  const invalidHandle = isInvalidHandle(profile.handle)
  const blockHide = profile.viewer?.blocking || profile.viewer?.blockedBy
  const isFollowedBy = Boolean(profile.viewer?.followedBy)
  const isFollowing = Boolean(profile.viewer?.following)
  return (
    <View
      style={[a.flex_row, a.gap_sm, a.align_center, {maxWidth: '100%'}]}
      pointerEvents={disableTaps ? 'none' : isIOS ? 'auto' : 'box-none'}>
      <NewskieDialog profile={profile} disabled={disableTaps} />
      {isFollowedBy && !blockHide ? (
        isFollowing ? (
          <Pills.Mutuals />
        ) : (
          <Pills.FollowsYou />
        )
      ) : undefined}
      <Text
        emoji
        numberOfLines={1}
        style={[
          invalidHandle
            ? [
                a.border,
                a.text_xs,
                a.px_sm,
                a.py_xs,
                a.rounded_xs,
                {borderColor: t.palette.contrast_200},
              ]
            : [a.text_md, a.leading_snug, t.atoms.text_contrast_medium],
          web({
            wordBreak: 'break-all',
            direction: 'ltr',
            unicodeBidi: 'isolate',
          }),
        ]}>
        {invalidHandle
          ? _(msg`⚠Invalid Handle`)
          : sanitizeHandle(
              profile.handle,
              '@',
              // forceLTR handled by CSS above on web
              isNative,
            )}
      </Text>
    </View>
  )
}
