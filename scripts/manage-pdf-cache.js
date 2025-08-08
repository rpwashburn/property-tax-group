#!/usr/bin/env node

/**
 * PDF Cache Management Script
 * 
 * Usage:
 *   node scripts/manage-pdf-cache.js list        # List all cached accounts
 *   node scripts/manage-pdf-cache.js stats       # Show cache statistics  
 *   node scripts/manage-pdf-cache.js clear       # Clear all cache
 *   node scripts/manage-pdf-cache.js clear <id>  # Clear specific account cache
 *   node scripts/manage-pdf-cache.js show <id>   # Show cached data for account
 */

import fs from 'fs'
import path from 'path'

const CACHE_DIR = path.join(process.cwd(), '.pdf-cache')

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
}

function getCacheFilePath(accountId) {
  return path.join(CACHE_DIR, `comparables-${accountId}.json`)
}

function listCachedAccounts() {
  try {
    ensureCacheDir()
    const files = fs.readdirSync(CACHE_DIR)
    const cacheFiles = files.filter(file => file.startsWith('comparables-') && file.endsWith('.json'))
    
    return cacheFiles.map(file => {
      const match = file.match(/comparables-(.+)\.json$/)
      return match ? match[1] : null
    }).filter(Boolean)
    
  } catch (error) {
    console.error('Error listing cached accounts:', error)
    return []
  }
}

function getCacheStats() {
  try {
    ensureCacheDir()
    const accounts = listCachedAccounts()
    
    const stats = accounts.map(accountId => {
      try {
        const cacheFile = getCacheFilePath(accountId)
        const rawData = fs.readFileSync(cacheFile, 'utf-8')
        const cached = JSON.parse(rawData)
        
        return {
          accountId,
          cachedAt: cached?.cachedAt || 'Unknown',
          comparablesCount: cached?.comparablesData?.comparables?.length || 0,
          fileSize: (fs.statSync(cacheFile).size / 1024).toFixed(2) + ' KB'
        }
      } catch {
        return {
          accountId,
          cachedAt: 'Error',
          comparablesCount: 0,
          fileSize: 'Error'
        }
      }
    })
    
    return {
      totalCached: accounts.length,
      totalSize: stats.reduce((sum, stat) => {
        const size = parseFloat(stat.fileSize.replace(' KB', ''))
        return sum + (isNaN(size) ? 0 : size)
      }, 0).toFixed(2) + ' KB',
      accounts: stats
    }
    
  } catch (error) {
    console.error('Error getting cache stats:', error)
    return {
      totalCached: 0,
      totalSize: '0 KB',
      accounts: []
    }
  }
}

function clearCache(accountId = null) {
  try {
    ensureCacheDir()
    
    if (accountId) {
      // Clear specific account
      const cacheFile = getCacheFilePath(accountId)
      
      if (fs.existsSync(cacheFile)) {
        fs.unlinkSync(cacheFile)
        console.log(`✅ Cleared cached data for account ${accountId}`)
        return true
      } else {
        console.log(`❌ No cached data found for account ${accountId}`)
        return false
      }
    } else {
      // Clear all cache
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
      
      console.log(`✅ Cleared ${cleared} cached files`)
      return cleared > 0
    }
    
  } catch (error) {
    console.error('Error clearing cache:', error)
    return false
  }
}

function showCachedData(accountId) {
  try {
    const cacheFile = getCacheFilePath(accountId)
    
    if (!fs.existsSync(cacheFile)) {
      console.log(`❌ No cached data found for account ${accountId}`)
      return
    }
    
    const rawData = fs.readFileSync(cacheFile, 'utf-8')
    const cached = JSON.parse(rawData)
    
    console.log(`\n📂 Cached Data for Account: ${accountId}`)
    console.log(`─────────────────────────────────────────`)
    console.log(`Cached At: ${new Date(cached.cachedAt).toLocaleString()}`)
    console.log(`Property Address: ${cached.property?.address?.formattedAddress || 'N/A'}`)
    console.log(`Market Value: $${cached.property?.currentValues?.totalMarketValue?.toLocaleString() || 'N/A'}`)
    console.log(`Comparables Count: ${cached.comparablesData?.comparables?.length || 0}`)
    console.log(`Median Value: $${cached.comparablesData?.median_comparable_value?.toLocaleString() || 'N/A'}`)
    
    if (cached.comparablesData?.comparables?.length > 0) {
      console.log(`\nTop 3 Comparables:`)
      cached.comparablesData.comparables.slice(0, 3).forEach((comp, index) => {
        console.log(`  ${index + 1}. ${comp.address?.formattedAddress || 'N/A'} - $${comp.currentValues?.totalMarketValue?.toLocaleString() || 'N/A'}`)
      })
    }
    
  } catch (error) {
    console.error('Error showing cached data:', error)
  }
}

// Main script logic
const command = process.argv[2]
const accountId = process.argv[3]

switch (command) {
  case 'list':
    console.log('📋 Cached Account IDs:')
    const accounts = listCachedAccounts()
    if (accounts.length === 0) {
      console.log('   No cached data found')
    } else {
      accounts.forEach(id => console.log(`   • ${id}`))
    }
    break
    
  case 'stats':
    console.log('📊 Cache Statistics:')
    const stats = getCacheStats()
    console.log(`   Total Cached: ${stats.totalCached} accounts`)
    console.log(`   Total Size: ${stats.totalSize}`)
    console.log('')
    if (stats.accounts.length > 0) {
      console.log('   Account Details:')
      stats.accounts.forEach(account => {
        console.log(`   • ${account.accountId}: ${account.comparablesCount} comparables, ${account.fileSize}, cached ${new Date(account.cachedAt).toLocaleDateString()}`)
      })
    }
    break
    
  case 'clear':
    if (accountId) {
      clearCache(accountId)
    } else {
      const confirm = process.env.FORCE || false
      if (!confirm) {
        console.log('⚠️  This will clear ALL cached data. Add FORCE=1 to confirm.')
        console.log('   Example: FORCE=1 node scripts/manage-pdf-cache.js clear')
        process.exit(1)
      }
      clearCache()
    }
    break
    
  case 'show':
    if (!accountId) {
      console.error('❌ Please provide an account ID: node scripts/manage-pdf-cache.js show <account_id>')
      process.exit(1)
    }
    showCachedData(accountId)
    break
    
  default:
    console.log('📋 PDF Cache Management Tool')
    console.log('')
    console.log('Usage:')
    console.log('  node scripts/manage-pdf-cache.js list        # List all cached accounts')
    console.log('  node scripts/manage-pdf-cache.js stats       # Show cache statistics')
    console.log('  node scripts/manage-pdf-cache.js clear       # Clear all cache (needs FORCE=1)')
    console.log('  node scripts/manage-pdf-cache.js clear <id>  # Clear specific account cache')
    console.log('  node scripts/manage-pdf-cache.js show <id>   # Show cached data for account')
    console.log('')
    console.log('Examples:')
    console.log('  node scripts/manage-pdf-cache.js stats')
    console.log('  node scripts/manage-pdf-cache.js show 1234567890123')
    console.log('  node scripts/manage-pdf-cache.js clear 1234567890123')
    console.log('  FORCE=1 node scripts/manage-pdf-cache.js clear')
    break
}