/**
 * Bundle Analysis Script
 * Analyzes bundle size, identifies duplicates, and provides optimization recommendations
 */

const fs = require('fs')
const path = require('path')

const DIST_DIR = path.join(__dirname, '../dist_build')
const ASSETS_DIR = path.join(DIST_DIR, 'assets')

/**
 * Get file size in KB
 */
function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return (stats.size / 1024).toFixed(2)
  } catch (e) {
    return 0
  }
}

/**
 * Analyze bundle files
 */
function analyzeBundle() {
  console.log('📦 Bundle Analysis Report\n')
  console.log('='.repeat(60))

  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('❌ Build directory not found. Run "npm run build" first.')
    process.exit(1)
  }

  const files = fs.readdirSync(ASSETS_DIR)
  const jsFiles = files.filter(f => f.endsWith('.js'))
  const cssFiles = files.filter(f => f.endsWith('.css'))
  const otherFiles = files.filter(f => !f.endsWith('.js') && !f.endsWith('.css'))

  // Analyze JS files
  console.log('\n📄 JavaScript Files:')
  console.log('-'.repeat(60))
  
  const jsAnalysis = jsFiles.map(file => {
    const filePath = path.join(ASSETS_DIR, file)
    const size = parseFloat(getFileSize(filePath))
    return { name: file, size, path: filePath }
  }).sort((a, b) => b.size - a.size)

  let totalJSSize = 0
  jsAnalysis.forEach(({ name, size }) => {
    totalJSSize += size
    const sizeStr = size > 1000 ? `${(size / 1024).toFixed(2)} MB` : `${size} KB`
    console.log(`  ${name.padEnd(50)} ${sizeStr.padStart(10)}`)
  })

  console.log(`\n  Total JS: ${(totalJSSize / 1024).toFixed(2)} MB (${totalJSSize.toFixed(2)} KB)`)
  
  // Analyze CSS files
  console.log('\n🎨 CSS Files:')
  console.log('-'.repeat(60))
  
  const cssAnalysis = cssFiles.map(file => {
    const filePath = path.join(ASSETS_DIR, file)
    const size = parseFloat(getFileSize(filePath))
    return { name: file, size, path: filePath }
  }).sort((a, b) => b.size - a.size)

  let totalCSSSize = 0
  cssAnalysis.forEach(({ name, size }) => {
    totalCSSSize += size
    const sizeStr = size > 1000 ? `${(size / 1024).toFixed(2)} MB` : `${size} KB`
    console.log(`  ${name.padEnd(50)} ${sizeStr.padStart(10)}`)
  })

  console.log(`\n  Total CSS: ${(totalCSSSize / 1024).toFixed(2)} MB (${totalCSSSize.toFixed(2)} KB)`)

  // Analyze other assets
  if (otherFiles.length > 0) {
    console.log('\n🖼️  Other Assets:')
    console.log('-'.repeat(60))
    
    let totalOtherSize = 0
    otherFiles.forEach(file => {
      const filePath = path.join(ASSETS_DIR, file)
      const size = parseFloat(getFileSize(filePath))
      totalOtherSize += size
      const sizeStr = size > 1000 ? `${(size / 1024).toFixed(2)} MB` : `${size} KB`
      console.log(`  ${file.padEnd(50)} ${sizeStr.padStart(10)}`)
    })
    console.log(`\n  Total Other: ${(totalOtherSize / 1024).toFixed(2)} MB (${totalOtherSize.toFixed(2)} KB)`)
  }

  // Total size
  const totalSize = totalJSSize + totalCSSSize
  console.log('\n📊 Summary:')
  console.log('-'.repeat(60))
  console.log(`  Total Bundle Size: ${(totalSize / 1024).toFixed(2)} MB (${totalSize.toFixed(2)} KB)`)
  console.log(`  JavaScript: ${((totalJSSize / totalSize) * 100).toFixed(1)}%`)
  console.log(`  CSS: ${((totalCSSSize / totalSize) * 100).toFixed(1)}%`)

  // Find large files
  console.log('\n⚠️  Large Files (>500 KB):')
  console.log('-'.repeat(60))
  const largeFiles = [...jsAnalysis, ...cssAnalysis].filter(f => f.size > 500)
  if (largeFiles.length === 0) {
    console.log('  ✅ No files exceed 500 KB')
  } else {
    largeFiles.forEach(({ name, size }) => {
      console.log(`  ${name}: ${(size / 1024).toFixed(2)} MB`)
    })
  }

  // Recommendations
  console.log('\n💡 Recommendations:')
  console.log('-'.repeat(60))
  
  if (totalSize > 5000) {
    console.log('  ⚠️  Bundle size is large. Consider:')
    console.log('     - Further code splitting')
    console.log('     - Tree shaking unused code')
    console.log('     - Lazy loading more modules')
  } else if (totalSize > 2000) {
    console.log('  ℹ️  Bundle size is moderate. Consider:')
    console.log('     - Additional code splitting for rarely used features')
  } else {
    console.log('  ✅ Bundle size is good!')
  }

  // Check for potential duplicates
  console.log('\n🔍 Chunk Analysis:')
  console.log('-'.repeat(60))
  const chunkGroups = {}
  jsAnalysis.forEach(({ name, size }) => {
    // Extract chunk name (before first dash)
    const chunkName = name.split('-')[0]
    if (!chunkGroups[chunkName]) {
      chunkGroups[chunkName] = { count: 0, totalSize: 0 }
    }
    chunkGroups[chunkName].count++
    chunkGroups[chunkName].totalSize += size
  })

  Object.entries(chunkGroups)
    .sort((a, b) => b[1].totalSize - a[1].totalSize)
    .forEach(([name, { count, totalSize }]) => {
      console.log(`  ${name.padEnd(30)} ${count} file(s), ${(totalSize / 1024).toFixed(2)} MB`)
    })

  console.log('\n' + '='.repeat(60))
  console.log('✅ Analysis complete!\n')
}

// Run analysis
if (require.main === module) {
  analyzeBundle()
}

module.exports = { analyzeBundle }

