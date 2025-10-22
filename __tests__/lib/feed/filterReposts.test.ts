import {AppBskyFeedDefs} from '@atproto/api'
import {filterFeedItemsByMutedReposts} from '../../../src/lib/feed/filterReposts'

describe('filterFeedItemsByMutedReposts', () => {
  function makePost(uri: string): AppBskyFeedDefs.FeedViewPost {
    // We only fill what's needed for the test
    return {
      post: {
        uri,
        cid: 'cid',
        author: {did: 'did:author', handle: 'author.handle'} as any,
        record: {} as any,
        likeCount: 0,
        repostCount: 0,
        replyCount: 0,
        indexedAt: new Date().toISOString(),
      } as any,
    } as any
  }

  function asRepost(
    item: AppBskyFeedDefs.FeedViewPost,
    byDid: string,
  ): AppBskyFeedDefs.FeedViewPost {
    return {
      ...item,
      reason: {
        $type: 'app.bsky.feed.defs#reasonRepost',
        by: {did: byDid, handle: 'user.handle'} as any,
        indexedAt: new Date().toISOString(),
      } as any,
    }
  }

  it('returns original array when no mutes are set', () => {
    const items = [
      makePost('at://post/1'),
      asRepost(makePost('at://post/2'), 'did:ex:1'),
    ]
    const filtered = filterFeedItemsByMutedReposts(items, {})
    expect(filtered.length).toBe(2)
  })

  it('filters out reposts by muted DIDs but keeps originals', () => {
    const a = makePost('at://post/1')
    const b = asRepost(makePost('at://post/2'), 'did:ex:muted')
    const c = asRepost(makePost('at://post/3'), 'did:ex:other')
    const d = makePost('at://post/4')

    const items = [a, b, c, d]
    const muted = {'did:ex:muted': true}

    const filtered = filterFeedItemsByMutedReposts(items, muted)

    // b should be removed; a, c, d remain
    expect(filtered.map(i => i.post.uri)).toEqual([
      'at://post/1',
      'at://post/3',
      'at://post/4',
    ])
  })
})
