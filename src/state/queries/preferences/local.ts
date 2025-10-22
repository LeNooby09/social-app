import AsyncStorage from '@react-native-async-storage/async-storage'

const PREFIX = 'prefs-muted-reposts'

export async function saveMutedRepostsByDid(
  viewerDid: string,
  map: Record<string, boolean>,
) {
  const key = `${PREFIX}:${viewerDid}`
  const isEmpty = !map || Object.keys(map).length === 0
  if (isEmpty) {
    try {
      await AsyncStorage.removeItem(key)
    } catch {}
    return
  }
  try {
    await AsyncStorage.setItem(key, JSON.stringify(map))
  } catch {}
}

export async function readMutedRepostsByDid(
  viewerDid: string,
): Promise<Record<string, boolean> | undefined> {
  try {
    const raw = await AsyncStorage.getItem(`${PREFIX}:${viewerDid}`)
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : undefined
  } catch {
    return undefined
  }
}
