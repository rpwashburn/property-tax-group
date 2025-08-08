import fs from 'fs'
import path from 'path'
import type { DetailedComparablesResponse, ApiPropertyResponse } from '@/lib/properties/types/types'

// Cache directory in project root (not in src to avoid build issues)
const CACHE_DIR = path.join(process.cwd(), '.pdf-cache')

// Ensure cache directory exists
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
}

interface CachedComparablesData {
  property: ApiPropertyResponse
  comparablesData: DetailedComparablesResponse
  cachedAt: string
  accountId: string
}

/**
 * Get the cache file path for a given account ID
 */
function getCacheFilePath(accountId: string): string {
  return path.join(CACHE_DIR, `comparables-${accountId}.json`)
}

/**
 * Check if cached data exists for the given account ID
 */
export function hasCachedData(accountId: string): boolean {
  try {
    const cacheFile = getCacheFilePath(accountId)
    return fs.existsSync(cacheFile)
  } catch (error) {
    console.error('Error checking cache:', error)
    return false
  }
}

/**
 * Load cached comparables data for the given account ID
 */
export function loadCachedData(accountId: string): CachedComparablesData | null {
  try {
    ensureCacheDir()
    const cacheFile = getCacheFilePath(accountId)
    
    if (!fs.existsSync(cacheFile)) {
      return null
    }
    
    const rawData = fs.readFileSync(cacheFile, 'utf-8')
    const cachedData: CachedComparablesData = JSON.parse(rawData)
    
    console.log(`📂 Loaded cached data for account ${accountId} (cached at: ${cachedData.cachedAt})`)
    return cachedData
    
  } catch (error) {
    console.error('Error loading cached data:', error)
    return null
  }
}

/**
 * Cache comparables data for the given account ID
 */
export function cacheComparablesData(
  accountId: string, 
  property: ApiPropertyResponse, 
  comparablesData: DetailedComparablesResponse
): void {
  try {
    ensureCacheDir()
    const cacheFile = getCacheFilePath(accountId)
    
    const dataToCache: CachedComparablesData = {
      property,
      comparablesData,
      cachedAt: new Date().toISOString(),
      accountId
    }
    
    fs.writeFileSync(cacheFile, JSON.stringify(dataToCache, null, 2))
    console.log(`💾 Cached comparables data for account ${accountId}`)
    
  } catch (error) {
    console.error('Error caching data:', error)
  }
}

/**
 * Clear cached data for a specific account ID
 */
export function clearCachedData(accountId: string): boolean {
  try {
    const cacheFile = getCacheFilePath(accountId)
    
    if (fs.existsSync(cacheFile)) {
      fs.unlinkSync(cacheFile)
      console.log(`🗑️ Cleared cached data for account ${accountId}`)
      return true
    }
    
    return false
  } catch (error) {
    console.error('Error clearing cached data:', error)
    return false
  }
}

/**
 * Clear all cached data
 */
export function clearAllCachedData(): number {
  try {
    ensureCacheDir()
    const files = fs.readdirSync(CACHE_DIR)
    const cacheFiles = files.filter(file => file.startsWith('comparables-') && file.endsWith('.json'))
    
    let cleared = 0
    for (const file of cacheFiles) {
      try {
        fs.unlinkSync(path.join(CACHE_DIR, file))
        cleared++
      } catch (error) {
        console.error(`Error deleting ${file}:`, error)
      }
    }
    
    console.log(`🗑️ Cleared ${cleared} cached files`)
    return cleared
    
  } catch (error) {
    console.error('Error clearing all cached data:', error)
    return 0
  }
}

/**
 * List all cached account IDs
 */
export function listCachedAccounts(): string[] {
  try {
    ensureCacheDir()
    const files = fs.readdirSync(CACHE_DIR)
    const cacheFiles = files.filter(file => file.startsWith('comparables-') && file.endsWith('.json'))
    
    return cacheFiles.map(file => {
      const match = file.match(/comparables-(.+)\.json$/)
      return match ? match[1] : null
    }).filter(Boolean) as string[]
    
  } catch (error) {
    console.error('Error listing cached accounts:', error)
    return []
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  try {
    ensureCacheDir()
    const accounts = listCachedAccounts()
    
    const stats = accounts.map(accountId => {
      try {
        const cached = loadCachedData(accountId)
        return {
          accountId,
          cachedAt: cached?.cachedAt || 'Unknown',
          comparablesCount: cached?.comparablesData?.comparables?.length || 0
        }
      } catch {
        return {
          accountId,
          cachedAt: 'Error',
          comparablesCount: 0
        }
      }
    })
    
    return {
      totalCached: accounts.length,
      accounts: stats
    }
    
  } catch (error) {
    console.error('Error getting cache stats:', error)
    return {
      totalCached: 0,
      accounts: []
    }
  }
}