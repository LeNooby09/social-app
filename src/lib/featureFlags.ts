// Lightweight feature flags for client surfaces
// Defaults keep current behavior stable in development while allowing staged rollout.

export type FeatureFlagKey =
  | 'feat.muteRepostsByAccount'
  | 'feat.otherProfileLikes'

// Defaults:
// - Keep mute-reposts enabled to avoid regressions where the UI already exists.
// - Keep otherProfileLikes off until the tab is fully wired and QA'd.
const DEFAULT_FLAGS: Record<FeatureFlagKey, boolean> = {
  'feat.muteRepostsByAccount': true,
  'feat.otherProfileLikes': true,
}

// Environment overrides via Expo public env if present
function envOverride(key: FeatureFlagKey): boolean | undefined {
  try {
    const envKey = key.replace(/\./g, '_').toUpperCase() // FEAT_MUTEREPOSTSBYACCOUNT, FEAT_OTHERPROFILELIKES
    const full = `EXPO_PUBLIC_${envKey}`
    const raw = (process?.env as any)?.[full]
    if (typeof raw === 'string') {
      if (raw === '1' || raw.toLowerCase() === 'true') return true
      if (raw === '0' || raw.toLowerCase() === 'false') return false
    }
  } catch {}
  return undefined
}

export function featureFlagEnabled(key: FeatureFlagKey): boolean {
  const override = envOverride(key)
  if (override !== undefined) return override
  return DEFAULT_FLAGS[key]
}

// Hook wrapper for components; currently just returns the static value.
// Kept as a hook to allow future live updates via remote provider.
export function useFeatureFlag(key: FeatureFlagKey): boolean {
  // In the future, this could subscribe to a context/provider.
  return featureFlagEnabled(key)
}
