const fs = require('fs')
const path = require('path')

function analyzeBuild() {
  const buildDir = path.join(__dirname, '../dist_build/assets')

  if (!fs.existsSync(buildDir)) {
    console.error('❌ Build directory not found. Run npm run build first.')
    process.exit(1)
  }

  const files = fs.readdirSync(buildDir)
  const stats = {
    total: 0,
    js: 0,
    css: 0,
    chunks: [],
    vendors: []
  }

  files.forEach(file => {
    const filePath = path.join(buildDir, file)
    const fileStat = fs.statSync(filePath)
    const size = fileStat.size

    stats.total += size

    if (file.endsWith('.js')) {
      stats.js += size
      const entry = { name: file, size: (size / 1024).toFixed(2) + ' KB' }

      if (file.includes('vendor-')) {
        stats.vendors.push(entry)
      } else {
        stats.chunks.push(entry)
      }
    } else if (file.endsWith('.css')) {
      stats.css += size
    }
  })

  console.log('\n📦 Build Performance Report\n')
  console.log(`Total Size: ${(stats.total / 1024 / 1024).toFixed(2)} MB`)
  console.log(`JavaScript: ${(stats.js / 1024 / 1024).toFixed(2)} MB`)
  console.log(`CSS: ${(stats.css / 1024).toFixed(2)} KB\n`)

  console.log('🔷 Vendor Chunks (Top 10):')
  stats.vendors
    .sort((a, b) => parseFloat(b.size) - parseFloat(a.size))
    .slice(0, 10)
    .forEach(v => console.log(`  ${v.name}: ${v.size}`))

  console.log('\n🔶 App Chunks (Top 10):')
  stats.chunks
    .sort((a, b) => parseFloat(b.size) - parseFloat(a.size))
    .slice(0, 10)
    .forEach(c => console.log(`  ${c.name}: ${c.size}`))

  // Save report
  const reportPath = path.join(__dirname, '../PERFORMANCE_REPORT.json')
  fs.writeFileSync(reportPath, JSON.stringify(stats, null, 2))
  console.log(`\n✅ Full report saved to PERFORMANCE_REPORT.json`)
}

analyzeBuild()
