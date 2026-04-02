import type { LeadDatasetOption } from '@/types'

export const LEGACY_LIVE_DATASET_KEY = 'version-1-0'
export const LEGACY_LIVE_DATASET_LABEL = 'Version 1.0'
export const DEMO_DATASET_KEY = 'demo-mode'
export const DEMO_DATASET_LABEL = 'Demo Mode'

function clean(value?: string) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

export function normalizeDatasetLocation(value?: string) {
  return clean(value)
    .replace(/\b(?:WA|NSW|VIC|QLD|SA|TAS|ACT|NT)\b/gi, '')
    .replace(/\b\d{4}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function datasetKeyFromLocation(value?: string) {
  const normalized = normalizeDatasetLocation(value).toLowerCase()
  return normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function buildLocationDataset(value?: string): LeadDatasetOption {
  const location = normalizeDatasetLocation(value) || 'Unassigned'
  const key = datasetKeyFromLocation(location) || 'unassigned'
  return {
    key: `suburb-${key}`,
    label: location,
    location,
    isLegacy: false,
  }
}

export function legacyLiveDataset(): LeadDatasetOption {
  return {
    key: LEGACY_LIVE_DATASET_KEY,
    label: LEGACY_LIVE_DATASET_LABEL,
    location: '',
    isLegacy: true,
  }
}

export function demoDataset(): LeadDatasetOption {
  return {
    key: DEMO_DATASET_KEY,
    label: DEMO_DATASET_LABEL,
    location: '',
    isLegacy: true,
  }
}

