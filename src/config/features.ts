// Authentication feature flag (default false)
// When false: direct access to all pages with no login screen, auth redirects, or token requirement
export const authEnabled: boolean =
  import.meta.env.VITE_AUTH_ENABLED === 'true' || import.meta.env.VITE_AUTH_ENABLED === true;

export interface FeatureFlags {
  evidenceMatrix: boolean;
  conflictResolution: boolean;
  humanReview: boolean;
  auditTrail: boolean;
  calibration: boolean;
  analytics: boolean;
}

export const defaultFeatureFlags: FeatureFlags = {
  evidenceMatrix: true,
  conflictResolution: true,
  humanReview: true,
  auditTrail: true,
  calibration: true,
  analytics: true,
};

// Allows runtime override via localStorage or environment variable if desired
export function getFeatureFlags(): FeatureFlags {
  try {
    const stored = localStorage.getItem('smartledger_features');
    if (stored) {
      return { ...defaultFeatureFlags, ...JSON.parse(stored) };
    }
  } catch {
    // fallback to default
  }
  return defaultFeatureFlags;
}

export function setFeatureFlags(flags: Partial<FeatureFlags>): void {
  const current = getFeatureFlags();
  const updated = { ...current, ...flags };
  localStorage.setItem('smartledger_features', JSON.stringify(updated));
}
