import {memo, useCallback} from 'react'
import {type StyleProp, View, type ViewStyle} from 'react-native'
import {type AppBskyActorDefs, type ModerationDecision} from '@atproto/api'
import {msg} from '@lingui/macro'
import {useLingui} from '@lingui/react'
import {useQueryClient} from '@tanstack/react-query'

import {useActorStatus} from '#/lib/actor-status'
import {makeProfileLink} from '#/lib/routes/links'
import {forceLTR} from '#/lib/strings/bidi'
import {sanitizeDisplayName} from '#/lib/strings/display-names'
import {sanitizeHandle} from '#/lib/strings/handles'
import {niceDate} from '#/lib/strings/time'
import {isAndroid} from '#/platform/detection'
import {useProfileShadow} from '#/state/cache/profile-shadow'
import {precacheProfile} from '#/state/queries/profile'
import {atoms as a, platform, useTheme, web} from '#/alf'
import {WebOnlyInlineLinkText} from '#/components/Link'
import * as Pills from '#/components/Pills'
import {ProfileHoverCard} from '#/components/ProfileHoverCard'
import {Text} from '#/components/Typography'
import {useSimpleVerificationState} from '#/components/verification'
import {VerificationCheck} from '#/components/verification/VerificationCheck'
import {TimeElapsed} from './TimeElapsed'
import {PreviewableUserAvatar} from './UserAvatar'

interface PostMetaOpts {
  author: AppBskyActorDefs.ProfileViewBasic
  moderation: ModerationDecision | undefined
  postHref: string
  timestamp: string
  showAvatar?: boolean
  avatarSize?: number
  onOpenAuthor?: () => void
  style?: StyleProp<ViewStyle>
}

let PostMeta = (opts: PostMetaOpts): React.ReactNode => {
  const t = useTheme()
  const {i18n, _} = useLingui()

  const author = useProfileShadow(opts.author)
  const displayName = author.displayName || author.handle
  const handle = author.handle
  const profileLink = makeProfileLink(author)
  const queryClient = useQueryClient()
  const onOpenAuthor = opts.onOpenAuthor
  const onBeforePressAuthor = useCallback(() => {
    precacheProfile(queryClient, author)
    onOpenAuthor?.()
  }, [queryClient, author, onOpenAuthor])
  const onBeforePressPost = useCallback(() => {
    precacheProfile(queryClient, author)
  }, [queryClient, author])

  const timestampLabel = niceDate(i18n, opts.timestamp)
  const verification = useSimpleVerificationState({profile: author})
  const {isActive: live} = useActorStatus(author)

  return (
    <View
      style={[
        opts.showAvatar ? a.flex_row : a.flex_1,
        opts.showAvatar && a.gap_sm,
        a.z_20,
        opts.style,
      ]}>
      {opts.showAvatar && (
        <PreviewableUserAvatar
          size={opts.avatarSize || 16}
          profile={author}
          moderation={opts.moderation?.ui('avatar')}
          type={author.associated?.labeler ? 'labeler' : 'user'}
          live={live}
          hideLiveBadge
        />
      )}

      <View style={[a.flex_1]}>
        {/* First row: Display name + verification + timestamp */}
        <View style={[a.flex_row, a.align_center, a.gap_xs]}>
          <ProfileHoverCard did={author.did}>
            <View style={[a.flex_row, a.align_center, a.flex_shrink]}>
              <WebOnlyInlineLinkText
                emoji
                numberOfLines={1}
                to={profileLink}
                label={_(msg`View profile`)}
                disableMismatchWarning
                onPress={onBeforePressAuthor}
                style={[
                  a.text_md,
                  a.font_semi_bold,
                  t.atoms.text,
                  a.leading_tight,
                  a.flex_shrink,
                ]}>
                {forceLTR(
                  sanitizeDisplayName(
                    displayName,
                    opts.moderation?.ui('displayName'),
                  ),
                )}
              </WebOnlyInlineLinkText>
              {verification.showBadge && (
                <View
                  style={[
                    a.pl_2xs,
                    a.self_center,
                    {
                      marginTop: platform({web: 0, ios: 0, android: -1}),
                    },
                  ]}>
                  <VerificationCheck
                    width={platform({android: 13, default: 12})}
                    verifier={verification.role === 'verifier'}
                  />
                </View>
              )}
            </View>
          </ProfileHoverCard>

          <TimeElapsed timestamp={opts.timestamp}>
            {({timeElapsed}) => (
              <WebOnlyInlineLinkText
                to={opts.postHref}
                label={timestampLabel}
                title={timestampLabel}
                disableMismatchWarning
                disableUnderline
                onPress={onBeforePressPost}
                style={[
                  a.text_md,
                  a.leading_tight,
                  isAndroid && a.flex_grow,
                  a.text_right,
                  t.atoms.text_contrast_medium,
                  web({
                    whiteSpace: 'nowrap',
                  }),
                ]}>
                {!isAndroid && (
                  <Text
                    style={[
                      a.text_md,
                      a.leading_tight,
                      t.atoms.text_contrast_medium,
                    ]}
                    accessible={false}>
                    &middot;{' '}
                  </Text>
                )}
                {timeElapsed}
              </WebOnlyInlineLinkText>
            )}
          </TimeElapsed>
        </View>

        {/* Second row: Handle + Relationship pills */}
        <View style={[a.flex_row, a.align_center, a.gap_xs]}>
          <ProfileHoverCard did={author.did}>
            <WebOnlyInlineLinkText
              emoji
              numberOfLines={1}
              to={profileLink}
              label={_(msg`View profile`)}
              disableMismatchWarning
              disableUnderline
              onPress={onBeforePressAuthor}
              style={[
                a.text_md,
                t.atoms.text_contrast_medium,
                a.leading_tight,
              ]}>
              {sanitizeHandle(handle, '@')}
            </WebOnlyInlineLinkText>
          </ProfileHoverCard>

          {/* Relationship pills inline with handle */}
          {(author.viewer?.following && author.viewer?.followedBy) ||
          author.viewer?.followedBy ? (
            <>
              {author.viewer?.following && author.viewer?.followedBy ? (
                <Pills.Mutuals size="sm" />
              ) : author.viewer?.followedBy ? (
                <Pills.FollowsYou size="sm" />
              ) : null}
            </>
          ) : null}
        </View>
      </View>
    </View>
  )
}
PostMeta = memo(PostMeta)
export {PostMeta}
