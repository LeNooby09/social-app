import {AppBskyFeedDefs} from '@atproto/api'

/**
 * Filters out feed items that are reposts by accounts whose DIDs are muted via
 * preferences.mutedRepostsByDid. Original posts from those accounts are not affected.
 */
export function filterFeedItemsByMutedReposts(
  feed: AppBskyFeedDefs.FeedViewPost[],
  mutedRepostsByDid: Record<string, boolean> | undefined,
): AppBskyFeedDefs.FeedViewPost[] {
  if (!mutedRepostsByDid || Object.keys(mutedRepostsByDid).length === 0) {
    return feed
  }
  return feed.filter(item => !isRepostByMutedAccount(item, mutedRepostsByDid))
}

export function isRepostByMutedAccount(
  item: AppBskyFeedDefs.FeedViewPost,
  mutedRepostsByDid: Record<string, boolean>,
): boolean {
  const reason = item.reason
  if (reason && AppBskyFeedDefs.isReasonRepost(reason)) {
    const byDid = reason.by?.did
    if (byDid && mutedRepostsByDid[byDid]) {
      return true
    }
  }
  return false
}
