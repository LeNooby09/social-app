import {
  type AppBskyFeedDefs,
  type AppBskyFeedGetActorLikes as GetActorLikes,
  type AppBskyFeedLike,
  BskyAgent,
} from '@atproto/api'
import {getPdsEndpoint} from '@atproto/common-web'

import {type FeedAPI, type FeedAPIResponse} from './types'

export class LikesFeedAPI implements FeedAPI {
  agent: BskyAgent
  params: GetActorLikes.QueryParams

  constructor({
    agent,
    feedParams,
  }: {
    agent: BskyAgent
    feedParams: GetActorLikes.QueryParams
  }) {
    this.agent = agent
    this.params = feedParams
  }

  async peekLatest(): Promise<AppBskyFeedDefs.FeedViewPost> {
    const res = await this.agent.getActorLikes({
      ...this.params,
      limit: 1,
    })
    return res.data.feed[0]
  }

  async fetch({
    cursor,
    limit,
  }: {
    cursor: string | undefined
    limit: number
  }): Promise<FeedAPIResponse> {
    const res = await this.agent.getActorLikes({
      ...this.params,
      cursor,
      limit,
    })
    if (res.success) {
      // HACKFIX: the API incorrectly returns a cursor when there are no items -sfn
      const isEmptyPage = res.data.feed.length === 0
      return {
        cursor: isEmptyPage ? undefined : res.data.cursor,
        feed: res.data.feed,
      }
    }
    return {
      feed: [],
    }
  }
}

/**
 * DirectRepoLikesFeedAPI queries likes directly from a user's PDS repository.
 * This bypasses the app.bsky.feed.getActorLikes API restriction that only allows
 * querying your own likes. Since likes are public records in AT Protocol, we can
 * query them via com.atproto.repo.listRecords.
 */
export class DirectRepoLikesFeedAPI implements FeedAPI {
  agent: BskyAgent
  actor: string

  constructor({
    agent,
    feedParams,
  }: {
    agent: BskyAgent
    feedParams: {actor: string}
  }) {
    this.agent = agent
    this.actor = feedParams.actor
  }

  async peekLatest(): Promise<AppBskyFeedDefs.FeedViewPost> {
    const result = await this.fetch({cursor: undefined, limit: 1})
    return result.feed[0]
  }

  async fetch({
    cursor,
    limit,
  }: {
    cursor: string | undefined
    limit: number
  }): Promise<FeedAPIResponse> {
    try {
      // Step 1: Resolve the target profile's DID document directly (not through a PDS)
      const didDoc = await this.resolveDidDocument(this.actor)
      if (!didDoc) {
        console.error('Failed to resolve DID document:', this.actor)
        return {
          cursor: undefined,
          feed: [],
        }
      }

      const pdsEndpoint = getPdsEndpoint(didDoc as any)
      if (!pdsEndpoint) {
        console.error('No PDS endpoint found for DID:', this.actor)
        return {
          cursor: undefined,
          feed: [],
        }
      }

      // Step 2: Create a temporary agent pointing to the target profile's PDS
      const targetPdsAgent = new BskyAgent({service: pdsEndpoint})

      // Step 3: Query the like records from the user's repository on their PDS
      // Note: We fetch in default order (oldest first) and reverse manually to ensure
      // consistent behavior across different PDS implementations
      const listRecordsRes = await targetPdsAgent.com.atproto.repo.listRecords({
        repo: this.actor,
        collection: 'app.bsky.feed.like',
        limit,
        cursor,
      })

      if (!listRecordsRes.success || listRecordsRes.data.records.length === 0) {
        return {
          cursor: undefined,
          feed: [],
        }
      }

      // Reverse the records to show most recent likes first
      const records = listRecordsRes.data.records.reverse()

      // Step 2: Extract post URIs from like records
      const postUris: string[] = []
      for (const record of records) {
        const likeRecord = record.value as AppBskyFeedLike.Record
        if (likeRecord.subject?.uri) {
          postUris.push(likeRecord.subject.uri)
        }
      }

      if (postUris.length === 0) {
        return {
          cursor: listRecordsRes.data.cursor,
          feed: [],
        }
      }

      // Step 3: Batch fetch the actual posts (getPosts has a limit of 25 URIs per request)
      const postMap = new Map<string, AppBskyFeedDefs.PostView>()
      const BATCH_SIZE = 25

      for (let i = 0; i < postUris.length; i += BATCH_SIZE) {
        const batch = postUris.slice(i, i + BATCH_SIZE)
        const postsRes = await this.agent.app.bsky.feed.getPosts({
          uris: batch,
        })

        if (postsRes.success) {
          for (const post of postsRes.data.posts) {
            postMap.set(post.uri, post)
          }
        }
      }

      // Step 5: Transform into FeedViewPost array, maintaining the order from like records
      const feed: AppBskyFeedDefs.FeedViewPost[] = []
      for (const record of records) {
        const likeRecord = record.value as AppBskyFeedLike.Record
        const postUri = likeRecord.subject?.uri
        if (postUri) {
          const post = postMap.get(postUri)
          if (post) {
            feed.push({post})
          }
        }
      }

      return {
        cursor: listRecordsRes.data.cursor,
        feed,
      }
    } catch (error) {
      console.error('Error fetching likes from repo:', error)
      return {
        feed: [],
      }
    }
  }

  /**
   * Resolve a DID document directly from the authoritative source (plc.directory or web DID).
   * This bypasses any PDS and queries the DID resolution service directly.
   */
  private async resolveDidDocument(
    did: string,
  ): Promise<{[key: string]: unknown} | null> {
    try {
      if (did.startsWith('did:plc:')) {
        // Query plc.directory directly
        const plcUrl = `https://plc.directory/${did}`
        const response = await fetch(plcUrl)
        if (!response.ok) {
          console.error(
            'Failed to fetch DID from plc.directory:',
            response.status,
          )
          return null
        }
        return await response.json()
      } else if (did.startsWith('did:web:')) {
        // Query web DID endpoint
        const domain = did.replace('did:web:', '')
        const webDidUrl = `https://${domain}/.well-known/did.json`
        const response = await fetch(webDidUrl)
        if (!response.ok) {
          console.error('Failed to fetch web DID:', response.status)
          return null
        }
        return await response.json()
      } else {
        console.error('Unsupported DID method:', did)
        return null
      }
    } catch (error) {
      console.error('Error resolving DID document:', error)
      return null
    }
  }
}
